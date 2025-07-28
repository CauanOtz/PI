// src/routes/documento.routes.js
import { Router } from 'express';
import { adicionarDocumento, listarDocumentos } from '../controllers/documento.controller.js';
import { validateAdicionarDocumento, validateListarDocumentos } from '../middlewares/validators/documento.validator.js';
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

// Rota para listar documentos de um aluno
router.get(
    '/alunos/:alunoId/documentos',
    autenticar,
    validateListarDocumentos,
    listarDocumentos
  );
  

export default router;