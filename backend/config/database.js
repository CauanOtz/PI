// config/database.js
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const config = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Ensure the storage path is absolute
const storagePath = dbConfig.storage.startsWith('.')
  ? join(__dirname, '..', dbConfig.storage)
  : dbConfig.storage;

console.log(`Using database: ${storagePath}`);

const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: storagePath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error(' Erro ao conectar ao banco de dados:', error);
    return false;
  }
};

export { sequelize, Sequelize, testConnection };