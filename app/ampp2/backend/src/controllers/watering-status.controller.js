const wateringStatusService = require('../services/watering-status.service');
const { sendSuccess } = require('../utils/api-response');

async function createStatus(req, res, next) {
  try {
    const status = await wateringStatusService.storeStatus(req.body);
    sendSuccess(res, { status }, 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createStatus
};
