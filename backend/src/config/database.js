// src/config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path'; // Para construir caminhos de forma segura
import { fileURLToPath } from 'url'; // Para obter o caminho do diretório atual com ES Modules

dotenv.config();

// Helper para obter o __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDialect = process.env.DB_DIALECT || 'sqlite';
// Define o storage com base no dialect. Se não for sqlite, pode ser undefined.
const dbStorage = dbDialect === 'sqlite'
    ? (process.env.DB_STORAGE || path.join(path.dirname(__dirname), 'dev.sqlite')) // Salva na raiz do projeto
    : undefined;

let sequelize;

if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbStorage, // Caminho para o arquivo do banco de dados
    logging: console.log, // ou false para desabilitar logs SQL
  });
} else {
  // Configuração para outros bancos de dados (MySQL, PostgreSQL, etc.)
  // Adapte conforme sua necessidade se for alternar entre bancos
  const dbName = process.env.DB_NAME || 'teste_escola_dev';
  const dbUser = process.env.DB_USER || 'root';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPassword = process.env.DB_PASSWORD || 'yourpassword';

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: dbDialect, // Ex: 'mysql', 'postgres'
    logging: console.log,
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Conexão com o banco de dados (${dbDialect}) estabelecida com sucesso.`);
    if (dbDialect === 'sqlite') {
      console.log(`Banco de dados SQLite em: ${dbStorage}`);
    }
  } catch (error) {
    console.error(`Não foi possível conectar ao banco de dados (${dbDialect}):`, error);
  }
};

export { sequelize, testConnection };