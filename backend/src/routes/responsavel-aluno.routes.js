import { requireAdmin } from '../middlewares/authorization.middleware.js';
// src/routes/responsavel-aluno.routes.js
import { Router } from 'express';
import { 
  vincularResponsavel,
  desvincularResponsavel
} from '../controllers/responsavel-aluno.controller.js';
import { 
  validateVincularResponsavel,
  validateDesvincularResponsavel
} from '../middlewares/validators/responsavel-aluno.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

// Rota para vincular responsÃ¡vel a aluno
router.post(
  '/',
  autenticar,
  validateVincularResponsavel,
  vincularResponsavel
);

// Rota para desvincular responsÃ¡vel de aluno
router.delete(
  '/usuario/:idUsuario/aluno/:idAluno',
  autenticar,
  validateDesvincularResponsavel,
  desvincularResponsavel
);

export default router;

