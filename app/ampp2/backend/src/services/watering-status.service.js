const wateringStatusModel = require('../models/watering-status.model');
const HttpError = require('../utils/http-error');

async function storeStatus(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'A watering status object is required');
  }

  const { deviceId, isWatering } = input;
  if (typeof deviceId !== 'string' || deviceId.trim().length === 0 || deviceId.trim().length > 128) {
    throw new HttpError(400, 'deviceId must be a non-empty string of at most 128 characters');
  }
  if (typeof isWatering !== 'boolean') {
    throw new HttpError(400, 'isWatering must be a boolean');
  }

  let timestamp;
  if (input.timestamp === undefined) {
    timestamp = new Date().toISOString();
  } else if (typeof input.timestamp === 'string' && !Number.isNaN(Date.parse(input.timestamp))) {
    timestamp = new Date(input.timestamp).toISOString();
  } else {
    throw new HttpError(400, 'timestamp must be a valid date string');
  }

  return wateringStatusModel.create({
    deviceId: deviceId.trim(),
    isWatering,
    timestamp
  });
}

module.exports = {
  storeStatus
};
