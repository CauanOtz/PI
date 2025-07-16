// src/routes/usuario.routes.js
import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { validateRegistroUsuario, validateListarUsuarios } from '../middlewares/validators/usuario.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';
const router = Router();

// Rota para registro de usuário
router.post('/registrar', validateRegistroUsuario, usuarioController.registrarUsuario);

// Outras rotas de usuário podem ser adicionadas aqui
// Rota para listar usuários
router.get('/', validateListarUsuarios, usuarioController.listarUsuarios);

// Rota para obter os dados do usuário logado
router.get('/me', autenticar, usuarioController.obterMeusDados);

export default router;