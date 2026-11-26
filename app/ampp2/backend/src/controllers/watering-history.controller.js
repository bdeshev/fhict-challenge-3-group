const wateringHistoryService = require('../services/watering-history.service');
const { sendSuccess } = require('../utils/api-response');

async function listForPlant(req, res, next) {
  try {
    const history = await wateringHistoryService.listForPlant(req.params.id, req.auth.userId);
    sendSuccess(res, { history });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listForPlant
};
