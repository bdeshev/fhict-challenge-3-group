const provider = require('../providers/plant-information/pasto.provider');

async function getBySpecies(species) {
  if (typeof species !== 'string' || species.trim().length === 0) {
    return null;
  }
  return provider.getBySpecies(species);
}

async function enrichOne(plant) {
  if (!plant) return plant;
  const plantInformation = await getBySpecies(plant.species);
  return { ...plant, plantInformation: plantInformation || null };
}

async function enrichMany(plants) {
  const speciesNames = [...new Set(plants.map((plant) => plant.species).filter(Boolean))];
  const informationBySpecies = new Map();

  if (typeof provider.getManyBySpecies === 'function') {
    for (let index = 0; index < speciesNames.length; index += 500) {
      const batch = speciesNames.slice(index, index + 500);
      const informationRows = await provider.getManyBySpecies(batch);
      for (const information of informationRows) {
        informationBySpecies.set(information.species.toLowerCase(), information);
      }
    }
  } else {
    const informationEntries = await Promise.all(
      speciesNames.map(async (species) => [species, await getBySpecies(species)])
    );
    for (const [species, information] of informationEntries) {
      informationBySpecies.set(species.toLowerCase(), information || null);
    }
  }

  return plants.map((plant) => ({
    ...plant,
    plantInformation: informationBySpecies.get(plant.species.toLowerCase()) || null
  }));
}

module.exports = {
  getBySpecies,
  enrichOne,
  enrichMany
};
