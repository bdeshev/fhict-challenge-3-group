const database = require('../services/database.service');
const UPDATEABLE_FIELDS = new Set([
  'name',
  'species',
  'moisture',
  'threshold',
  'autoMode',
  'isWatering',
  'lastWateredAt'
]);

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      moisture REAL,
      threshold REAL NOT NULL,
      autoMode INTEGER NOT NULL DEFAULT 0 CHECK (autoMode IN (0, 1)),
      isWatering INTEGER NOT NULL DEFAULT 0 CHECK (isWatering IN (0, 1)),
      lastWateredAt TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_plants_userId ON plants(userId);
  `);
}

function toPlant(row) {
  if (!row) return undefined;

  return {
    ...row,
    autoMode: Boolean(row.autoMode),
    isWatering: Boolean(row.isWatering)
  };
}

async function create({ userId, name, species, moisture = null, threshold, autoMode = false, isWatering = false, lastWateredAt = null }) {
  const result = await database.run(
    `INSERT INTO plants
      (userId, name, species, moisture, threshold, autoMode, isWatering, lastWateredAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      name,
      species,
      moisture,
      threshold,
      autoMode ? 1 : 0,
      isWatering ? 1 : 0,
      lastWateredAt
    ]
  );

  return result.lastID;
}

async function findByIdForUser(id, userId) {
  const row = await database.get(
    'SELECT * FROM plants WHERE id = ? AND userId = ?',
    [id, userId]
  );
  return toPlant(row);
}

async function findById(id) {
  const row = await database.get('SELECT * FROM plants WHERE id = ?', [id]);
  return toPlant(row);
}

function updateSensorState(id, { moisture, isWatering }) {
  return database.run(
    'UPDATE plants SET moisture = ?, isWatering = ? WHERE id = ?',
    [moisture, isWatering ? 1 : 0, id]
  );
}

async function findAllByUserId(userId) {
  const rows = await database.all(
    'SELECT * FROM plants WHERE userId = ? ORDER BY createdAt DESC, id DESC',
    [userId]
  );
  return rows.map(toPlant);
}

async function searchByUserId(userId, term, limit) {
  const rows = await database.all(
    `SELECT * FROM plants
     WHERE userId = ?
       AND (name LIKE ? ESCAPE '!' OR species LIKE ? ESCAPE '!')
     ORDER BY createdAt DESC, id DESC
     LIMIT ?`,
    [userId, term, term, limit]
  );
  return rows.map(toPlant);
}

function updateForUser(id, userId, changes) {
  const fields = Object.keys(changes);
  if (fields.length === 0 || fields.some((field) => !UPDATEABLE_FIELDS.has(field))) {
    throw new Error('Plant update contains no fields or unsupported fields');
  }

  const values = fields.map((field) => {
    const value = changes[field];
    return field === 'autoMode' || field === 'isWatering'
      ? (value ? 1 : 0)
      : value;
  });
  const assignments = fields.map((field) => `${field} = ?`).join(', ');

  return database.run(
    `UPDATE plants SET ${assignments} WHERE id = ? AND userId = ?`,
    [...values, id, userId]
  );
}

function deleteForUser(id, userId) {
  return database.run(
    'DELETE FROM plants WHERE id = ? AND userId = ?',
    [id, userId]
  );
}

module.exports = {
  initialize,
  create,
  findById,
  findByIdForUser,
  updateSensorState,
  findAllByUserId,
  searchByUserId,
  updateForUser,
  deleteForUser
};
