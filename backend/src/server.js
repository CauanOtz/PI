// src/server.js (trecho modificado)
import app from './app.js';
import { sequelize, testConnection } from './config/database.js'; // Importe sequelize
import Aula from './models/Aula.model.js'; // Importe seu modelo

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await testConnection();

    // Sincroniza os modelos com o banco de dados
    // CUIDADO: { force: true } apaga e recria as tabelas. Use apenas em desenvolvimento.
    // Para produção, use migrations.
    // await sequelize.sync({ force: true }); // Para recriar tabelas
    await sequelize.sync(); // Apenas cria tabelas se não existirem ou altera se { alter: true }
    console.log('Modelos sincronizados com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
};

startServer();