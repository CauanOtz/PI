// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import setupSwagger from './config/swagger.js'; // Importe a configuração do Swagger
// import mainRoutes from './routes/index.js'; // Descomente quando tiver rotas
import aulaRoutes from './routes/aula.routes.js'; // Importe suas rotas de aula
import usuarioRoutes from './routes/usuario.routes.js'; // Importe suas rotas de usuário
import alunoRoutes from './routes/aluno.routes.js'; // Importe as rotas de aluno
import responsavelAlunoRoutes from './routes/responsavel-aluno.routes.js'; // Importe as rotas de responsavel-aluno
import presencaRoutes from './routes/presenca.routes.js'; // Importe as rotas de presença
import responsavelRoutes from './routes/responsavel.routes.js'; // Importe as rotas de responsavel
import notificacaoRoutes from './routes/notificacao.routes.js'; // Importe as rotas de notificações
dotenv.config();
const app = express();

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: FRONT_ORIGIN, credentials: false })); // true se usar cookies
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
app.use('/api/v2/aulas', aulaRoutes); // Rotas de aula sob /api/v2/aulas
app.use('/api/v2/usuarios', usuarioRoutes); // Rotas de usuário sob /api/v2/usuarios
app.use('/api/v2/alunos', alunoRoutes); // Rotas de aluno sob /api/v2/alunos
app.use('/api/v2/responsaveis-alunos', responsavelAlunoRoutes); // Rotas de responsavel-aluno sob /api/v2/responsaveis-alunos
app.use('/api/v2/presencas', presencaRoutes); // Rotas de presença sob /api/v2/presencas
app.use('/api/v2/responsaveis', responsavelRoutes); // Rotas de responsavel sob /api/v2/responsaveis
app.use('/api/v2/notificacoes', notificacaoRoutes); // Rotas de notificações sob /api/v2/notificacoes

app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

export default app;