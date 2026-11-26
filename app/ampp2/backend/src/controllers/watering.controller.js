const wateringService = require('../services/watering.service');
const { sendSuccess } = require('../utils/api-response');

async function water(req, res, next) {
  try {
    const result = await wateringService.startManualWatering(req.params.id, req.auth.userId);
    sendSuccess(res, {
      message: 'Simulated watering started',
      ...result
    }, 202);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  water
};
