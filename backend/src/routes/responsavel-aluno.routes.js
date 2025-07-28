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

// Rota para vincular responsável a aluno
router.post(
  '/responsaveis-alunos',
  autenticar,
  validateVincularResponsavel,
  vincularResponsavel
);

// Rota para desvincular responsável de aluno
router.delete(
  '/responsaveis/:cpfUsuario/alunos/:idAluno',
  autenticar,
  validateDesvincularResponsavel,
  desvincularResponsavel
);

export default router;