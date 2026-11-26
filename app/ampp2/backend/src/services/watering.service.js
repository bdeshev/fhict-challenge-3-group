const plantModel = require('../models/plant.model');
const wateringHistoryModel = require('../models/watering-history.model');
const plantInformationService = require('./plant-information.service');
const HttpError = require('../utils/http-error');

const SIMULATED_DURATION_MS = 3000;

async function startManualWatering(rawPlantId, userId) {
  const plantId = Number(rawPlantId);
  if (!Number.isSafeInteger(plantId) || plantId < 1) {
    throw new HttpError(400, 'Plant id must be a positive integer');
  }

  const plant = await plantModel.findByIdForUser(plantId, Number(userId));
  if (!plant) {
    throw new HttpError(404, 'Plant not found');
  }
  if (plant.isWatering) {
    throw new HttpError(409, 'Plant is already being watered');
  }

  const start = await wateringHistoryModel.startForPlant(plantId, Number(userId), {
    automatic: false,
    duration: Math.ceil(SIMULATED_DURATION_MS / 1000)
  });
  if (!start) {
    const currentPlant = await plantModel.findByIdForUser(plantId, Number(userId));
    if (!currentPlant) {
      throw new HttpError(404, 'Plant not found');
    }
    throw new HttpError(409, 'Plant is already being watered');
  }

  setTimeout(() => {
    wateringHistoryModel.complete(start.historyId, plantId).catch((error) => {
      console.error('Unable to complete simulated watering:', error);
    });
  }, SIMULATED_DURATION_MS);

  const updatedPlant = await plantModel.findByIdForUser(plantId, Number(userId));
  return {
    plant: await plantInformationService.enrichOne(updatedPlant),
    historyId: start.historyId,
    simulatedDurationMs: SIMULATED_DURATION_MS
  };
}

module.exports = {
  startManualWatering
};
