const settingsModel = require('../models/settings.model');
const HttpError = require('../utils/http-error');

const DEFAULTS = Object.freeze({
  theme: 'system',
  language: 'en',
  notificationsEnabled: true,
  defaultAutoMode: false
});
const ALLOWED_FIELDS = new Set(Object.keys(DEFAULTS));
const THEMES = new Set(['system', 'light', 'dark']);

async function getSettings(userId) {
  const settings = await settingsModel.findByUserId(Number(userId));
  if (!settings) {
    throw new HttpError(404, 'User settings not found');
  }
  return settings;
}

async function updateSettings(userId, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'A settings object is required');
  }

  const fields = Object.keys(input);
  if (fields.some((field) => !ALLOWED_FIELDS.has(field))) {
    throw new HttpError(400, 'One or more settings fields are not supported');
  }
  if (fields.length === 0) {
    throw new HttpError(400, 'At least one setting is required');
  }

  const current = await getSettings(userId);
  const updated = { ...current, ...input };

  if (typeof updated.theme !== 'string' || !THEMES.has(updated.theme)) {
    throw new HttpError(400, 'theme must be system, light, or dark');
  }
  if (typeof updated.language !== 'string' || !/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(updated.language)) {
    throw new HttpError(400, 'language must be a valid language tag');
  }
  if (typeof updated.notificationsEnabled !== 'boolean') {
    throw new HttpError(400, 'notificationsEnabled must be a boolean');
  }
  if (typeof updated.defaultAutoMode !== 'boolean') {
    throw new HttpError(400, 'defaultAutoMode must be a boolean');
  }

  await settingsModel.updateByUserId(Number(userId), updated);
  return settingsModel.findByUserId(Number(userId));
}

module.exports = {
  DEFAULTS,
  getSettings,
  updateSettings
};
