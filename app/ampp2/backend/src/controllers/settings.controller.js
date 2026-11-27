const settingsService = require('../services/settings.service');
const { sendSuccess } = require('../utils/api-response');

async function getSettings(req, res, next) {
  try {
    const settings = await settingsService.getSettings(req.auth.userId);
    sendSuccess(res, { settings });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await settingsService.updateSettings(req.auth.userId, req.body);
    sendSuccess(res, { settings });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings
};
