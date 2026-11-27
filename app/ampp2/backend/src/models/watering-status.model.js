const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS watering_status_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT NOT NULL,
      isWatering INTEGER NOT NULL CHECK (isWatering IN (0, 1)),
      timestamp TEXT NOT NULL
    );
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_watering_status_device_timestamp
    ON watering_status_events(deviceId, timestamp DESC, id DESC);
  `);
}

async function create(status) {
  const result = await database.run(
    `INSERT INTO watering_status_events (deviceId, isWatering, timestamp)
     VALUES (?, ?, ?)`,
    [status.deviceId, status.isWatering ? 1 : 0, status.timestamp]
  );

  const row = await database.get(
    `SELECT id, deviceId, isWatering, timestamp
     FROM watering_status_events WHERE id = ?`,
    [result.lastID]
  );

  return { ...row, isWatering: Boolean(row.isWatering) };
}

module.exports = {
  initialize,
  create
};
