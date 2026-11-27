const authService = require('../services/auth.service');
const userModel = require('../models/user.model');
const HttpError = require('../utils/http-error');
const { sendSuccess } = require('../utils/api-response');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body || {});
    sendSuccess(res, { user }, 201);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body || {});
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

async function currentUser(req, res, next) {
  try {
    const user = await userModel.findById(Number(req.auth.userId));
    if (!user) {
      throw new HttpError(401, 'User no longer exists');
    }
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  currentUser
};
