const profileService = require('../services/profile.service');
const { sendSuccess } = require('../utils/api-response');

async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.auth.userId);
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await profileService.updateProfile(req.auth.userId, req.body);
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
