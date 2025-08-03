// src/routes/index.js
import { Router } from 'express';
import usuarioRoutes from './usuario.routes.js';
import alunoRoutes from './aluno.routes.js';
import aulaRoutes from './aula.routes.js';
import documentoRoutes from './documento.routes.js';
import responsavelAlunoRoutes from './responsavel-aluno.routes.js';
import presencaRoutes from './presenca.routes.js';

const router = Router();

// Rotas da API
router.use('/usuarios', usuarioRoutes);
router.use('/alunos', alunoRoutes);
router.use('/aulas', aulaRoutes);
router.use('/documentos', documentoRoutes);
router.use('/responsaveis-alunos', responsavelAlunoRoutes);
router.use('/presencas', presencaRoutes);

export default router;