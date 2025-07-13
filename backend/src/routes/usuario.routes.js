// src/routes/usuario.routes.js
import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { validateRegistroUsuario, validateListarUsuarios } from '../middlewares/validators/usuario.validator.js';

const router = Router();

// Rota para registro de usuário
router.post('/registrar', validateRegistroUsuario, usuarioController.registrarUsuario);

// Outras rotas de usuário podem ser adicionadas aqui
// Rota para listar usuários
router.get('/', validateListarUsuarios, usuarioController.listarUsuarios);

export default router;