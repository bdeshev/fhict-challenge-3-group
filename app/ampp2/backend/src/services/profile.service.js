const userModel = require('../models/user.model');
const HttpError = require('../utils/http-error');

const ALLOWED_FIELDS = new Set(['username', 'email', 'profilePicture']);

async function getProfile(userId) {
  const profile = await userModel.findProfileById(Number(userId));
  if (!profile) {
    throw new HttpError(404, 'User profile not found');
  }
  return profile;
}

async function updateProfile(userId, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'A profile object is required');
  }

  const fields = Object.keys(input);
  if (fields.some((field) => !ALLOWED_FIELDS.has(field))) {
    throw new HttpError(400, 'Only username, email, and profilePicture can be updated');
  }
  if (fields.length === 0) {
    throw new HttpError(400, 'At least one profile field is required');
  }

  const current = await getProfile(userId);
  const username = input.username === undefined ? current.username : input.username;
  const email = input.email === undefined ? current.email : input.email;
  const profilePicture = input.profilePicture === undefined
    ? current.profilePicture
    : input.profilePicture;

  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 50) {
    throw new HttpError(400, 'Username must be between 3 and 50 characters');
  }
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new HttpError(400, 'A valid email address is required');
  }
  if (profilePicture !== null && (typeof profilePicture !== 'string' || profilePicture.length > 2048)) {
    throw new HttpError(400, 'profilePicture must be a string or null, up to 2048 characters');
  }

  try {
    await userModel.updateProfile(Number(userId), {
      username: username.trim(),
      email: normalizedEmail,
      profilePicture
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new HttpError(409, 'Username or email is already in use');
    }
    throw error;
  }

  return getProfile(userId);
}

module.exports = {
  getProfile,
  updateProfile
};
