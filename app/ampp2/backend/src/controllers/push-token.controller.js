const pushTokenService = require('../services/push-token.service');
const { sendSuccess } = require('../utils/api-response');

async function register(req, res, next) {
  try {
    const pushToken = await pushTokenService.registerForUser(req.body, req.auth.userId);
    sendSuccess(res, { pushToken });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await pushTokenService.removeForUser(req.body, req.auth.userId);
    sendSuccess(res, {});
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  remove
};
