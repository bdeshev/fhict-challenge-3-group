const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const databaseConfig = require('../config/database');

let database;
let connectionPromise;

function connectDatabase() {
  if (connectionPromise) {
    return connectionPromise;
  }

  const { filename } = databaseConfig;

  if (filename !== ':memory:') {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  connectionPromise = new Promise((resolve, reject) => {
    database = new sqlite3.Database(filename, (error) => {
      if (error) {
        database = undefined;
        connectionPromise = undefined;
        reject(error);
        return;
      }

      database.configure('busyTimeout', 5000);
      database.run('PRAGMA foreign_keys = ON', (pragmaError) => {
        if (pragmaError) {
          closeDatabase().finally(() => reject(pragmaError));
          return;
        }

        resolve(database);
      });
    });
  });

  return connectionPromise;
}

async function closeDatabase() {
  if (!connectionPromise || !database) {
    return;
  }

  const currentDatabase = database;
  database = undefined;
  connectionPromise = undefined;

  await new Promise((resolve, reject) => {
    currentDatabase.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

module.exports = {
  connectDatabase,
  closeDatabase
};
