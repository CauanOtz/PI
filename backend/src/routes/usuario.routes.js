import { requireAdmin } from '../middlewares/authorization.middleware.js';
// src/routes/usuario.routes.js
import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { validateRegistroUsuario, validateListarUsuarios, validateBuscarPorCPF, validateLogin, validateAtualizarUsuario, validateExcluirUsuario  } from '../middlewares/validators/usuario.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

// Rota para registro de usuÃ¡rio
router.post('/registrar', autenticar, requireAdmin, validateRegistroUsuario, usuarioController.registrarUsuario);

// Rota para login
router.post('/login', validateLogin, usuarioController.login);

// Outras rotas de usuÃ¡rio podem ser adicionadas aqui
// Rota para listar usuÃ¡rios
router.get('/', autenticar, requireAdmin, validateListarUsuarios, usuarioController.listarUsuarios);

// Rota para obter os dados do usuÃ¡rio logado
router.get('/me', autenticar, usuarioController.obterMeusDados);

// Rota para buscar usuÃ¡rio por CPF (apenas admin)
router.get(
    '/:cpf',
    autenticar,
    validateBuscarPorCPF,
    usuarioController.buscarPorCPF
);

// Rota para atualizar usuÃ¡rio por CPF (apenas admin)
router.put(
    '/:cpf',
    autenticar,
    validateAtualizarUsuario,
    usuarioController.atualizarUsuarioPorCPF
);

// Rota para excluir usuÃ¡rio por CPF (apenas admin)
router.delete(
    '/:cpf',
    autenticar,
    validateExcluirUsuario,
    usuarioController.excluirUsuarioPorCPF
);

export default router;

