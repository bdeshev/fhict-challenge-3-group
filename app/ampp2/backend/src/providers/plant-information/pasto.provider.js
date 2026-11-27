const plantInformationModel = require('../../models/plant-information.model');

const API_BASE_URL = process.env.PASTO_API_BASE_URL || 'https://api.pasto.ai';
const CACHE_TTL_MS = Number(process.env.PLANT_INFO_CACHE_TTL_MS) || 7 * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

function publicInformation(row) {
  if (!row) return null;
  const { cachedAt, ...information } = row;
  return information;
}

function isFresh(row) {
  if (!row || !row.cachedAt) return false;
  const timestamp = row.cachedAt.includes('T')
    ? row.cachedAt
    : `${row.cachedAt.replace(' ', 'T')}Z`;
  const cachedTime = Date.parse(timestamp);
  return Number.isFinite(cachedTime) && Date.now() - cachedTime < CACHE_TTL_MS;
}

async function requestJson(url, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Plant API returned HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function resultItems(payload) {
  if (Array.isArray(payload)) return payload;
  for (const field of ['data', 'results', 'plants', 'items']) {
    if (Array.isArray(payload?.[field])) return payload[field];
  }
  if (payload?.data && typeof payload.data === 'object') return [payload.data];
  return payload && typeof payload === 'object' ? [payload] : [];
}

function namesFor(item) {
  const names = [item.common_name, item.commonName, item.name, item.scientific_name, item.scientificName];
  const aliases = item.aliases || item.other_names || item.other_name;
  return names.concat(Array.isArray(aliases) ? aliases : [aliases])
    .flatMap((name) => Array.isArray(name) ? name : [name])
    .filter((name) => typeof name === 'string')
    .map((name) => name.trim().toLowerCase());
}

function findSearchResult(payload, query) {
  const items = resultItems(payload);
  const normalizedQuery = query.trim().toLowerCase();
  return items.find((item) => namesFor(item).includes(normalizedQuery))
    || items.find((item) => namesFor(item).some((name) => name.startsWith(normalizedQuery)))
    || items.find((item) => namesFor(item).some((name) => name.includes(normalizedQuery)));
}

function toText(value) {
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(', ') || null;
  if (value && typeof value === 'object') return JSON.stringify(value);
  return null;
}

function asNumber(value) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function moistureRange(profile) {
  if (!profile || typeof profile !== 'object') return [null, null];

  const explicitMin = asNumber(profile.idealMoistureMin ?? profile.ideal_moisture_min);
  const explicitMax = asNumber(profile.idealMoistureMax ?? profile.ideal_moisture_max);
  if (explicitMin !== null || explicitMax !== null) return [explicitMin, explicitMax];

  const pending = [profile];
  while (pending.length) {
    const current = pending.pop();
    if (!current || typeof current !== 'object') continue;

    for (const [key, value] of Object.entries(current)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
      if ((normalizedKey.includes('soilmoisture') || normalizedKey === 'moisturerange' || normalizedKey === 'idealmoisture') && value && typeof value === 'object') {
        if (Array.isArray(value)) return [asNumber(value[0]), asNumber(value[1])];
        const minimum = asNumber(value.min ?? value.minimum ?? value.low ?? value.min_pct ?? value.min_percent ?? value.minimum_percent);
        const maximum = asNumber(value.max ?? value.maximum ?? value.high ?? value.max_pct ?? value.max_percent ?? value.maximum_percent);
        if (minimum !== null || maximum !== null) return [minimum, maximum];
      }
      if (normalizedKey.includes('soilmoisture') && typeof value === 'string') {
        const range = value.match(/(-?\d+(?:\.\d+)?)\s*[-–]\s*(-?\d+(?:\.\d+)?)/);
        if (range) return [asNumber(range[1]), asNumber(range[2])];
      }
      if (value && typeof value === 'object') pending.push(value);
    }
  }

  return [null, null];
}

function normalizeProfile(species, profile) {
  const care = profile.care || {};
  const sensorProfiles = profile.sensor_profiles || profile.sensorProfiles || {};
  const [profileMoistureMin, profileMoistureMax] = moistureRange(sensorProfiles);
  const [rootMoistureMin, rootMoistureMax] = moistureRange(profile);

  return {
    species,
    description: toText(profile.description || profile.summary),
    wateringTips: toText(profile.watering_tips || profile.wateringTips || care.watering_tips || care.water || profile.watering),
    sunlight: toText(profile.sunlight || care.sun || care.sunlight || profile.sun),
    idealMoistureMin: profileMoistureMin ?? rootMoistureMin,
    idealMoistureMax: profileMoistureMax ?? rootMoistureMax
  };
}

async function fetchProfile(species, apiKey) {
  const searchUrl = new URL('/v1/plants', API_BASE_URL);
  searchUrl.searchParams.set('q', species);
  searchUrl.searchParams.set('lang', 'en');

  const searchPayload = await requestJson(searchUrl, apiKey);
  const result = findSearchResult(searchPayload, species);
  if (!result) return null;

  let profile = result;
  const plantId = result.id || result.plant_id || result.pid;
  if (plantId && !result.sensor_profiles && !result.sensorProfiles) {
    const detailsUrl = new URL(`/v1/plants/${encodeURIComponent(plantId)}`, API_BASE_URL);
    detailsUrl.searchParams.set('lang', 'en');
    profile = await requestJson(detailsUrl, apiKey);
  }

  return normalizeProfile(species, profile);
}

async function getBySpecies(species) {
  const cached = await plantInformationModel.findCachedBySpecies(species);
  if (isFresh(cached)) return publicInformation(cached);

  const apiKey = process.env.PASTO_API_KEY;
  if (!apiKey) return publicInformation(cached);

  try {
    const fetched = await fetchProfile(species, apiKey);
    if (!fetched) return publicInformation(cached);

    const information = {
      ...fetched,
      description: fetched.description || cached?.description || null,
      wateringTips: fetched.wateringTips || cached?.wateringTips || null,
      sunlight: fetched.sunlight || cached?.sunlight || null,
      idealMoistureMin: fetched.idealMoistureMin ?? cached?.idealMoistureMin ?? null,
      idealMoistureMax: fetched.idealMoistureMax ?? cached?.idealMoistureMax ?? null
    };
    await plantInformationModel.upsertBySpecies(information);
    return publicInformation({ ...information, cachedAt: new Date().toISOString() });
  } catch (error) {
    console.warn(`Plant API lookup failed for "${species}"; using cached data when available: ${error.message}`);
    return publicInformation(cached);
  }
}

async function getManyBySpecies(speciesNames) {
  const results = [];
  for (let index = 0; index < speciesNames.length; index += 5) {
    const batch = speciesNames.slice(index, index + 5);
    results.push(...await Promise.all(batch.map(getBySpecies)));
  }
  return results.filter(Boolean);
}

module.exports = {
  getBySpecies,
  getManyBySpecies
};
