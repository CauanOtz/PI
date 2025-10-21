// src/server.js
import app from './app.js';
import { sequelize, syncModels } from './models/index.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');

    await syncModels();

    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      logger.info(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar o servidor', { error });
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('Erro não tratado', { error: err });
});

startServer();
