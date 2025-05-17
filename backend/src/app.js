// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import mainRoutes from './routes/index.js'; // Descomente quando tiver rotas

// Carrega variáveis de ambiente do .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens
app.use(express.json()); // Permite que o Express entenda JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Permite que o Express entenda dados de formulário URL-encoded

// Rota de Teste
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bem-vindo à API da Escola!' });
});

// Aqui você importará e usará suas rotas principais
// app.use('/api/v1', mainRoutes); // Exemplo de prefixo para todas as rotas

// Middleware para tratar rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// Middleware para tratamento de erros global (opcional, mas recomendado)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.', error: err.message });
});

export default app;