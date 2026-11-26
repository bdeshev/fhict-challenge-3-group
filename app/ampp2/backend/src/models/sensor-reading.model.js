const database = require('../services/database.service');

async function initialize() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT NOT NULL,
      rawValue REAL NOT NULL,
      moisturePercent REAL NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_timestamp
    ON sensor_readings(deviceId, timestamp DESC, id DESC);
  `);
}

async function create(reading) {
  const result = await database.run(
    `INSERT INTO sensor_readings (deviceId, rawValue, moisturePercent, timestamp)
     VALUES (?, ?, ?, ?)`,
    [reading.deviceId, reading.rawValue, reading.moisturePercent, reading.timestamp]
  );

  return database.get(
    'SELECT id, deviceId, rawValue, moisturePercent, timestamp FROM sensor_readings WHERE id = ?',
    [result.lastID]
  );
}

module.exports = {
  initialize,
  create
};
