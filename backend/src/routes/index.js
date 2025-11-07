// src/routes/index.js
import { Router } from 'express';
import usuarioRoutes from './usuario.routes.js';
import assistidoRoutes from './assistido.routes.js';
// import aulaRoutes from './aula.routes.js'; // DEPRECATED: Use atividades
import atividadeRoutes from './atividade.routes.js';
import responsavelAssistidoRoutes from './responsavel-assistido.routes.js';
import presencaRoutes from './presenca.routes.js';
import notificacaoRoutes from './notificacao.routes.js';
import responsavelRoutes from './responsavel.routes.js';
const router = Router();

// Rotas da API
router.use('/usuarios', usuarioRoutes);
router.use('/assistidos', assistidoRoutes);
// router.use('/aulas', aulaRoutes); // DEPRECATED: Use /atividades
router.use('/atividades', atividadeRoutes);
router.use('/responsaveis-assistidos', responsavelAssistidoRoutes);
router.use('/responsaveis', responsavelRoutes);
router.use('/presencas', presencaRoutes);
router.use('/notificacoes', notificacaoRoutes);

export default router;