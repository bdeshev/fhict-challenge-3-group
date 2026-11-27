const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/api-response');

async function list(req, res, next) {
  try {
    const notifications = await notificationService.listForUser(req.auth.userId);
    sendSuccess(res, { notifications });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.auth.userId);
    sendSuccess(res, { notification });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  markRead
};
