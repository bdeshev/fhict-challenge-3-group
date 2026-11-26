const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      profilePicture TEXT
    );
  `);

  const columns = await database.all('PRAGMA table_info(users)');
  if (!columns.some((column) => column.name === 'profilePicture')) {
    await database.execute('ALTER TABLE users ADD COLUMN profilePicture TEXT');
  }
}

function create({ username, email, passwordHash }) {
  return database.run(
    'INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
}

function findByUsernameOrEmail(identifier) {
  return database.get(
    'SELECT id, username, email, passwordHash, createdAt FROM users WHERE username = ? OR email = ?',
    [identifier, identifier]
  );
}

function findById(id) {
  return database.get(
    'SELECT id, username, email, createdAt FROM users WHERE id = ?',
    [id]
  );
}

function findProfileById(id) {
  return database.get(
    'SELECT username, email, profilePicture, createdAt FROM users WHERE id = ?',
    [id]
  );
}

function updateProfile(id, { username, email, profilePicture }) {
  return database.run(
    'UPDATE users SET username = ?, email = ?, profilePicture = ? WHERE id = ?',
    [username, email, profilePicture, id]
  );
}

module.exports = {
  initialize,
  create,
  findByUsernameOrEmail,
  findById,
  findProfileById,
  updateProfile
};
