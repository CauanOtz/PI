import logger from '../utils/logger.js';
// src/config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDialect = process.env.DB_DIALECT || 'sqlite';
const dbLogging = process.env.DB_LOGGING === 'true' ? (msg => logger.debug(msg)) : false;
const dbStorage = dbDialect === 'sqlite'
  ? (process.env.DB_STORAGE || path.join(path.dirname(__dirname), 'dev.sqlite'))
  : undefined;
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  const sslEnabled = process.env.DB_SSL === 'true' || process.env.SUPABASE_USE_SSL === 'true';
  const dialectOptions = sslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
        }
      }
    : undefined;

  sequelize = new Sequelize(databaseUrl, {
    dialect: dbDialect,
    logging: dbLogging,
    dialectOptions,
  });
} else if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbStorage,
    logging: dbLogging,
  });
} else {
  const dbName = process.env.DB_NAME || 'teste_escola_dev';
  const dbUser = process.env.DB_USER || 'root';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPassword = process.env.DB_PASSWORD || 'yourpassword';
  const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

  const sslEnabled = process.env.DB_SSL === 'true' || process.env.SUPABASE_USE_SSL === 'true';
  const dialectOptions = sslEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
        }
      }
    : undefined;

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    logging: dbLogging,
    dialectOptions,
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`Conexao com o banco de dados (${dbDialect}) estabelecida com sucesso.`);
    if (dbDialect === 'sqlite') {
      logger.info(`Banco de dados SQLite em: ${dbStorage}`);
    }
  } catch (error) {
    logger.error(`Nao foi possivel conectar ao banco de dados (${dbDialect})`, { error });
  }
};

export { sequelize, testConnection };


