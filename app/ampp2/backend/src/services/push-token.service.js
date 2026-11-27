const pushTokenModel = require('../models/push-token.model');
const HttpError = require('../utils/http-error');

function validateRegistration(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'A deviceToken and platform are required');
  }

  const { deviceToken, platform } = input;
  if (typeof deviceToken !== 'string' || deviceToken.trim().length === 0 || deviceToken.length > 4096) {
    throw new HttpError(400, 'deviceToken must be a non-empty string of at most 4096 characters');
  }
  if (typeof platform !== 'string' || platform.trim().length === 0 || platform.trim().length > 30) {
    throw new HttpError(400, 'platform must be a non-empty string of at most 30 characters');
  }

  return {
    deviceToken: deviceToken.trim(),
    platform: platform.trim().toLowerCase()
  };
}

async function registerForUser(input, userId) {
  const registration = validateRegistration(input);
  const pushToken = await pushTokenModel.register({
    ...registration,
    userId: Number(userId)
  });
  return pushToken;
}

async function removeForUser(input, userId) {
  const registration = validateRegistration(input);
  await pushTokenModel.removeForUser(Number(userId), registration.deviceToken);
}

module.exports = {
  registerForUser,
  removeForUser
};
