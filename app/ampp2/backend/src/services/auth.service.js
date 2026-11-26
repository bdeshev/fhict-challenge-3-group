const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const settingsModel = require('../models/settings.model');
const HttpError = require('../utils/http-error');

const SALT_ROUNDS = 12;

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set in the environment');
  }

  return jwt.sign({ sub: String(user.id) }, secret, { expiresIn: '1d' });
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  };
}

async function register({ username, email, password }) {
  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Username, email, and password are required');
  }

  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedUsername.length < 3 || normalizedUsername.length > 50) {
    throw new HttpError(400, 'Username must be between 3 and 50 characters');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new HttpError(400, 'A valid email address is required');
  }
  if (password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters long');
  }

  const existingUser = await userModel.findByUsernameOrEmail(normalizedUsername);
  const existingEmail = await userModel.findByUsernameOrEmail(normalizedEmail);
  if (existingUser || existingEmail) {
    throw new HttpError(409, 'Username or email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  let result;
  try {
    result = await userModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new HttpError(409, 'Username or email is already registered');
    }
    throw error;
  }
  await settingsModel.createDefaults(result.lastID);
  const user = await userModel.findById(result.lastID);

  return toPublicUser(user);
}

async function login({ identifier, username, email, password }) {
  identifier = identifier || email || username;
  if (typeof identifier !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Username or email and password are required');
  }

  const normalizedIdentifier = identifier.trim();
  const lookupIdentifier = normalizedIdentifier.includes('@')
    ? normalizedIdentifier.toLowerCase()
    : normalizedIdentifier;
  const user = await userModel.findByUsernameOrEmail(lookupIdentifier);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid username/email or password');
  }

  return {
    token: createToken(user),
    user: toPublicUser(user)
  };
}

module.exports = {
  register,
  login,
  createToken
};
