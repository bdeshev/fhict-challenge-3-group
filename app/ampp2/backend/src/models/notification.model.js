const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      "read" INTEGER NOT NULL DEFAULT 0 CHECK ("read" IN (0, 1)),
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications(userId, createdAt DESC, id DESC);
  `);
}

function fromRow(row) {
  if (!row) return undefined;
  return { ...row, read: Boolean(row.read) };
}

async function findAllByUserId(userId) {
  const rows = await database.all(
    `SELECT id, userId, title, message, type, "read", createdAt
     FROM notifications
     WHERE userId = ?
     ORDER BY createdAt DESC, id DESC`,
    [userId]
  );
  return rows.map(fromRow);
}

async function findByIdForUser(id, userId) {
  const row = await database.get(
    `SELECT id, userId, title, message, type, "read", createdAt
     FROM notifications
     WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return fromRow(row);
}

function markReadForUser(id, userId) {
  return database.run(
    'UPDATE notifications SET "read" = 1 WHERE id = ? AND userId = ?',
    [id, userId]
  );
}

async function create({ userId, title, message, type }) {
  const result = await database.run(
    'INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)',
    [userId, title, message, type]
  );
  return findByIdForUser(result.lastID, userId);
}

module.exports = {
  initialize,
  findAllByUserId,
  findByIdForUser,
  markReadForUser,
  create
};
