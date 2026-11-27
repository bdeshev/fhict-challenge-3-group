const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS push_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      deviceToken TEXT NOT NULL UNIQUE,
      platform TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_push_tokens_userId ON push_tokens(userId);
  `);
}

async function register({ userId, deviceToken, platform }) {
  await database.run(
    `INSERT INTO push_tokens (userId, deviceToken, platform)
     VALUES (?, ?, ?)
     ON CONFLICT(deviceToken) DO UPDATE SET
       userId = excluded.userId,
       platform = excluded.platform,
       createdAt = CURRENT_TIMESTAMP`,
    [userId, deviceToken, platform]
  );

  return database.get(
    'SELECT id, platform, createdAt FROM push_tokens WHERE deviceToken = ? AND userId = ?',
    [deviceToken, userId]
  );
}

function removeForUser(userId, deviceToken) {
  return database.run(
    'DELETE FROM push_tokens WHERE userId = ? AND deviceToken = ?',
    [userId, deviceToken]
  );
}

module.exports = {
  initialize,
  register,
  removeForUser
};
