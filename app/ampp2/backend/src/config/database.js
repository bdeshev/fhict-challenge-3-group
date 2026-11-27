const path = require('path');

const configuredPath = process.env.DATABASE_PATH || 'src/data/plant-watering.sqlite';

module.exports = {
  filename: configuredPath === ':memory:'
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath)
};
