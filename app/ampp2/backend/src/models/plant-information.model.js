const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS plant_information (
      species TEXT PRIMARY KEY COLLATE NOCASE,
      description TEXT,
      wateringTips TEXT,
      sunlight TEXT,
      idealMoistureMin REAL,
      idealMoistureMax REAL,
      cachedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const columns = await database.all('PRAGMA table_info(plant_information)');
  if (!columns.some((column) => column.name === 'cachedAt')) {
    await database.execute('ALTER TABLE plant_information ADD COLUMN cachedAt TEXT');
  }
}

function findBySpecies(species) {
  return database.get(
    `SELECT species, description, wateringTips, sunlight,
            idealMoistureMin, idealMoistureMax
     FROM plant_information
     WHERE species = ? COLLATE NOCASE`,
    [species.trim()]
  );
}

function findCachedBySpecies(species) {
  return database.get(
    `SELECT species, description, wateringTips, sunlight,
            idealMoistureMin, idealMoistureMax, cachedAt
     FROM plant_information
     WHERE species = ? COLLATE NOCASE`,
    [species.trim()]
  );
}

function findBySpeciesList(speciesNames) {
  if (speciesNames.length === 0) return Promise.resolve([]);

  const placeholders = speciesNames.map(() => '?').join(', ');
  return database.all(
    `SELECT species, description, wateringTips, sunlight,
            idealMoistureMin, idealMoistureMax
     FROM plant_information
     WHERE species COLLATE NOCASE IN (${placeholders})`,
    speciesNames
  );
}

function upsertBySpecies(information) {
  const {
    species,
    description = null,
    wateringTips = null,
    sunlight = null,
    idealMoistureMin = null,
    idealMoistureMax = null
  } = information;

  return database.run(
    `INSERT INTO plant_information
      (species, description, wateringTips, sunlight, idealMoistureMin, idealMoistureMax, cachedAt)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(species) DO UPDATE SET
       description = excluded.description,
       wateringTips = excluded.wateringTips,
       sunlight = excluded.sunlight,
       idealMoistureMin = excluded.idealMoistureMin,
       idealMoistureMax = excluded.idealMoistureMax,
       cachedAt = CURRENT_TIMESTAMP`,
    [species.trim(), description, wateringTips, sunlight, idealMoistureMin, idealMoistureMax]
  );
}

module.exports = {
  initialize,
  findBySpecies,
  findCachedBySpecies,
  findBySpeciesList,
  upsertBySpecies
};
