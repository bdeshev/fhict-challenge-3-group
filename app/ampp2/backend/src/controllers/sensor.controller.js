const sensorService = require('../services/sensor.service');
const { sendSuccess } = require('../utils/api-response');

async function createReading(req, res, next) {
  try {
    const result = await sensorService.storeReading(req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReading
};
