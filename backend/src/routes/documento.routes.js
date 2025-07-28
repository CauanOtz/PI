// src/routes/documento.routes.js
import { Router } from 'express';
import { adicionarDocumento } from '../controllers/documento.controller.js';
import { validateAdicionarDocumento } from '../middlewares/validators/documento.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// Rota para adicionar documento a um aluno
router.post(
  '/alunos/:alunoId/documentos',
  autenticar,
  upload.single('documento'),
  validateAdicionarDocumento,
  adicionarDocumento
);

export default router;