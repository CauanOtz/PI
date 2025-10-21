// src/server.js
import app from './app.js';
import { sequelize, syncModels } from './models/index.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Sync all models
    await syncModels();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Erro não tratado:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

startServer();
