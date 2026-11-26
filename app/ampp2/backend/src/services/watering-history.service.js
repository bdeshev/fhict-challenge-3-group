const plantModel = require('../models/plant.model');
const wateringHistoryModel = require('../models/watering-history.model');
const HttpError = require('../utils/http-error');

async function listForPlant(rawPlantId, userId) {
  const plantId = Number(rawPlantId);
  if (!Number.isSafeInteger(plantId) || plantId < 1) {
    throw new HttpError(400, 'Plant id must be a positive integer');
  }

  const plant = await plantModel.findByIdForUser(plantId, Number(userId));
  if (!plant) {
    throw new HttpError(404, 'Plant not found');
  }

  return wateringHistoryModel.findByPlantId(plantId);
}

module.exports = {
  listForPlant
};
