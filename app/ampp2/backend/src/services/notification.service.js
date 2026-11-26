const notificationModel = require('../models/notification.model');
const HttpError = require('../utils/http-error');

function parseNotificationId(rawId) {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, 'Notification id must be a positive integer');
  }
  return id;
}

function validateNotification(input = {}) {
  const { userId, title, message, type } = input;
  if (!Number.isSafeInteger(Number(userId)) || Number(userId) < 1) {
    throw new HttpError(400, 'A valid user id is required');
  }
  for (const [field, value] of Object.entries({ title, message, type })) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new HttpError(400, `${field} must be a non-empty string`);
    }
  }
}

async function listForUser(userId) {
  return notificationModel.findAllByUserId(Number(userId));
}

async function markAsRead(rawId, userId) {
  const id = parseNotificationId(rawId);
  const numericUserId = Number(userId);
  const existing = await notificationModel.findByIdForUser(id, numericUserId);
  if (!existing) {
    throw new HttpError(404, 'Notification not found');
  }

  await notificationModel.markReadForUser(id, numericUserId);
  return notificationModel.findByIdForUser(id, numericUserId);
}

async function createNotification(input) {
  validateNotification(input);
  return notificationModel.create({
    userId: Number(input.userId),
    title: input.title.trim(),
    message: input.message.trim(),
    type: input.type.trim()
  });
}

module.exports = {
  listForUser,
  markAsRead,
  createNotification
};
