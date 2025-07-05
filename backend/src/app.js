// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import setupSwagger from './config/swagger.js'; // Importe a configuração do Swagger
// import mainRoutes from './routes/index.js'; // Descomente quando tiver rotas
import aulaRoutes from './routes/aula.routes.js'; // Importe suas rotas de aula
import usuarioRoutes from './routes/usuario.routes.js'; // Importe suas rotas de usuário
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Swagger
setupSwagger(app);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bem-vindo à API do Diário de Classe!' });
});

// Aqui você importará e usará suas rotas principais
// O prefixo /api/v1 é um exemplo, ajuste conforme sua necessidade e o que foi configurado no swagger.js
// app.use('/api/v1', mainRoutes);



// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';
  res.status(statusCode).json({ message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
});

// Use suas rotas com um prefixo
app.use('/api/v1/aulas', aulaRoutes); // Rotas de aula sob /api/v1/aulas
app.use('/api/v1/usuarios', usuarioRoutes); // Rotas de usuário sob /api/v1/usuarios

app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

export default app;