// src/routes/responsavel-assistido.routes.js
import { requireAdmin } from '../middlewares/authorization.middleware.js';
import { Router } from 'express';
import { 
  vincularResponsavel,
  desvincularResponsavel
} from '../controllers/responsavel-assistido.controller.js';
import { 
  validateVincularResponsavel,
  validateDesvincularResponsavel
} from '../middlewares/validators/responsavel-assistido.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

// Rota para vincular responsável a assistido
router.post(
  '/',
  autenticar,
  validateVincularResponsavel,
  vincularResponsavel
);

// Rota para desvincular responsável de assistido
router.delete(
  '/usuario/:idUsuario/assistido/:idAssistido',
  autenticar,
  validateDesvincularResponsavel,
  desvincularResponsavel
);

export default router;