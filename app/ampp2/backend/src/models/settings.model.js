const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS user_settings (
      userId INTEGER PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'system',
      language TEXT NOT NULL DEFAULT 'en',
      notificationsEnabled INTEGER NOT NULL DEFAULT 1 CHECK (notificationsEnabled IN (0, 1)),
      defaultAutoMode INTEGER NOT NULL DEFAULT 0 CHECK (defaultAutoMode IN (0, 1)),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await database.run(`
    INSERT OR IGNORE INTO user_settings (userId)
    SELECT id FROM users
  `);
}

function createDefaults(userId) {
  return database.run(
    'INSERT OR IGNORE INTO user_settings (userId) VALUES (?)',
    [userId]
  );
}

async function findByUserId(userId) {
  const row = await database.get(
    'SELECT userId, theme, language, notificationsEnabled, defaultAutoMode FROM user_settings WHERE userId = ?',
    [userId]
  );

  if (!row) return undefined;

  return {
    theme: row.theme,
    language: row.language,
    notificationsEnabled: Boolean(row.notificationsEnabled),
    defaultAutoMode: Boolean(row.defaultAutoMode)
  };
}

function updateByUserId(userId, settings) {
  return database.run(
    `UPDATE user_settings
     SET theme = ?, language = ?, notificationsEnabled = ?, defaultAutoMode = ?
     WHERE userId = ?`,
    [
      settings.theme,
      settings.language,
      settings.notificationsEnabled ? 1 : 0,
      settings.defaultAutoMode ? 1 : 0,
      userId
    ]
  );
}

module.exports = {
  initialize,
  createDefaults,
  findByUserId,
  updateByUserId
};
