const sensorReadingModel = require('../models/sensor-reading.model');
const plantModel = require('../models/plant.model');
const plantService = require('./plant.service');
const HttpError = require('../utils/http-error');

// TODO: Replace this temporary plant ID with a deviceId-to-plant mapping.
const TEMPORARY_SENSOR_PLANT_ID = 1;

function normalizeTimestamp(timestamp) {
  if (typeof timestamp !== 'string' || Number.isNaN(Date.parse(timestamp))) {
    throw new HttpError(400, 'timestamp must be a valid date string');
  }
  return new Date(timestamp).toISOString();
}

async function storeReading(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'A sensor reading object is required');
  }

  const { deviceId, rawValue, moisturePercent, timestamp } = input;
  if (typeof deviceId !== 'string' || deviceId.trim().length === 0 || deviceId.trim().length > 128) {
    throw new HttpError(400, 'deviceId must be a non-empty string of at most 128 characters');
  }
  if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
    throw new HttpError(400, 'rawValue must be a finite number');
  }
  if (typeof moisturePercent !== 'number' || !Number.isFinite(moisturePercent) || moisturePercent < 0 || moisturePercent > 100) {
    throw new HttpError(400, 'moisturePercent must be a number between 0 and 100');
  }

  const reading = await sensorReadingModel.create({
    deviceId: deviceId.trim(),
    rawValue,
    moisturePercent,
    timestamp: normalizeTimestamp(timestamp)
  });

  const plant = await plantModel.findById(TEMPORARY_SENSOR_PLANT_ID);
  if (!plant) {
    return {
      reading,
      plant: null,
      wateringNeeded: false,
      command: 'NONE'
    };
  }

  const wateringNeeded = plantService.isAutomaticWateringNeeded(plant, moisturePercent);
  await plantModel.updateSensorState(TEMPORARY_SENSOR_PLANT_ID, {
    moisture: moisturePercent,
    isWatering: wateringNeeded
  });
  const updatedPlant = await plantModel.findById(TEMPORARY_SENSOR_PLANT_ID);

  // TODO: Send a watering command to the ESP32 when wateringNeeded is true after hardware integration.

  return {
    reading,
    plant: updatedPlant,
    wateringNeeded,
    command: wateringNeeded ? 'ACTIVATE_PUMP' : 'NONE'
  };
}

module.exports = {
  storeReading
};
