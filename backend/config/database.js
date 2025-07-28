// config/database.js
import { Sequelize } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    storage: dbConfig.storage,
    logging: console.log
  }
);

export { sequelize, Sequelize };