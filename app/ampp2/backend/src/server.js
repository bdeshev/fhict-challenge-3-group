require('dotenv').config();

const app = require('./app');
const { connectDatabase, closeDatabase } = require('./database/connection');
const userModel = require('./models/user.model');
const settingsModel = require('./models/settings.model');
const plantModel = require('./models/plant.model');
const wateringHistoryModel = require('./models/watering-history.model');
const plantInformationModel = require('./models/plant-information.model');
const notificationModel = require('./models/notification.model');
const pushTokenModel = require('./models/push-token.model');
const sensorReadingModel = require('./models/sensor-reading.model');
const wateringStatusModel = require('./models/watering-status.model');
const port = Number(process.env.PORT) || 3000;

let server;

async function start() {
  await connectDatabase();
  await userModel.initialize();
  await settingsModel.initialize();
  await plantModel.initialize();
  await wateringHistoryModel.initialize();
  await plantInformationModel.initialize();
  await notificationModel.initialize();
  await pushTokenModel.initialize();
  await sensorReadingModel.initialize();
  await wateringStatusModel.initialize();
  server = app.listen(port, () => {
    console.log(`Smart Plant Watering API listening on port ${port}`);
  });
}

async function shutdown() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await closeDatabase();
  process.exit(0);
}

start().catch((error) => {
  console.error('Unable to start the API:', error);
  process.exit(1);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
