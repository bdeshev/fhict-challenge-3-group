const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS watering_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plantId INTEGER NOT NULL,
      startedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER NOT NULL DEFAULT 0,
      automatic INTEGER NOT NULL DEFAULT 0 CHECK (automatic IN (0, 1)),
      completedAt TEXT,
      status TEXT NOT NULL DEFAULT 'watering' CHECK (status IN ('watering', 'completed')),
      FOREIGN KEY (plantId) REFERENCES plants(id) ON DELETE CASCADE
    );
  `);

  const columns = await database.all('PRAGMA table_info(watering_history)');
  if (!columns.some((column) => column.name === 'duration')) {
    await database.execute('ALTER TABLE watering_history ADD COLUMN duration INTEGER NOT NULL DEFAULT 0');
  }
  if (!columns.some((column) => column.name === 'automatic')) {
    await database.execute('ALTER TABLE watering_history ADD COLUMN automatic INTEGER NOT NULL DEFAULT 0 CHECK (automatic IN (0, 1))');
  }

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_watering_history_plantId
    ON watering_history(plantId, startedAt DESC);
  `);
}

async function startForPlant(plantId, userId, { automatic = false, duration = 0 } = {}) {
  return database.transaction(async (transaction) => {
    const update = await transaction.run(
      'UPDATE plants SET isWatering = 1 WHERE id = ? AND userId = ? AND isWatering = 0',
      [plantId, userId]
    );

    if (update.changes === 0) {
      return undefined;
    }

    const history = await transaction.run(
      'INSERT INTO watering_history (plantId, duration, automatic) VALUES (?, ?, ?)',
      [plantId, duration, automatic ? 1 : 0]
    );

    return { historyId: history.lastID };
  });
}

function complete(historyId, plantId) {
  return database.transaction(async (transaction) => {
    await transaction.run(
      `UPDATE plants
       SET isWatering = 0, lastWateredAt = CURRENT_TIMESTAMP
       WHERE id = ? AND isWatering = 1`,
      [plantId]
    );
    await transaction.run(
      `UPDATE watering_history
       SET completedAt = CURRENT_TIMESTAMP, status = 'completed'
       WHERE id = ? AND status = 'watering'`,
      [historyId]
    );
  });
}

async function findByPlantId(plantId) {
  const rows = await database.all(
    `SELECT id, plantId, startedAt, duration, automatic
     FROM watering_history
     WHERE plantId = ?
     ORDER BY startedAt DESC, id DESC`,
    [plantId]
  );

  return rows.map((row) => ({
    ...row,
    automatic: Boolean(row.automatic)
  }));
}

module.exports = {
  initialize,
  startForPlant,
  complete,
  findByPlantId
};
