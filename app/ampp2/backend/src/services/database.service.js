const { connectDatabase } = require('../database/connection');

async function execute(sql) {
  const database = await connectDatabase();
  return new Promise((resolve, reject) => {
    database.exec(sql, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function run(sql, parameters = []) {
  const database = await connectDatabase();
  return new Promise((resolve, reject) => {
    database.run(sql, parameters, function onComplete(error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function get(sql, parameters = []) {
  const database = await connectDatabase();
  return new Promise((resolve, reject) => {
    database.get(sql, parameters, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

async function all(sql, parameters = []) {
  const database = await connectDatabase();
  return new Promise((resolve, reject) => {
    database.all(sql, parameters, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function transaction(operation) {
  await execute('BEGIN IMMEDIATE TRANSACTION');

  try {
    const result = await operation({ execute, run, get, all });
    await execute('COMMIT');
    return result;
  } catch (error) {
    await execute('ROLLBACK');
    throw error;
  }
}

module.exports = {
  execute,
  run,
  get,
  all,
  transaction
};
