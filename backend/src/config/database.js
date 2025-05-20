// src/config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Garante que as variáveis de .env sejam carregadas

// Determina qual configuração usar com base no NODE_ENV
// Se não estiver usando sequelize-cli config.json, defina as vars aqui
const dbName = process.env.DB_NAME || 'DiarioDeClasseDev';
const dbUser = process.env.DB_USER || 'root';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPassword = process.env.DB_PASSWORD || ''; // Coloque sua senha padrão aqui ou no .env
const dbDialect = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,
  logging: console.log, // ou false para desabilitar logs SQL no console
  // Outras opções do Sequelize, como pool de conexões, podem ser adicionadas aqui
  // pool: {
  //   max: 5,
  //   min: 0,
  //   acquire: 30000,
  //   idle: 10000
  // }
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
};

export { sequelize, testConnection };