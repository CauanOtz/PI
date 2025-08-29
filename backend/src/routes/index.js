// src/routes/index.js
import { Router } from 'express';
import usuarioRoutes from './usuario.routes.js';
import alunoRoutes from './aluno.routes.js';
import aulaRoutes from './aula.routes.js';
import documentoRoutes from './documento.routes.js';
import responsavelAlunoRoutes from './responsavel-aluno.routes.js';
import presencaRoutes from './presenca.routes.js';
import notificacaoRoutes from './notificacao.routes.js';
import responsavelRoutes from './responsavel.routes.js';
const router = Router();

// Rotas da API
router.use('/usuarios', usuarioRoutes);
router.use('/alunos', alunoRoutes);
router.use('/aulas', aulaRoutes);
router.use('/documentos', documentoRoutes);
router.use('/responsaveis-alunos', responsavelAlunoRoutes);
router.use('/responsaveis', responsavelRoutes);
router.use('/presencas', presencaRoutes);
router.use('/notificacoes', notificacaoRoutes);

export default router;