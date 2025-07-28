// src/routes/documento.routes.js
import { Router } from 'express';
import { adicionarDocumento, listarDocumentos, obterDocumento, atualizarDocumento } from '../controllers/documento.controller.js';
import { validateAdicionarDocumento, validateListarDocumentos, validateObterDocumento, validateAtualizarDocumento } from '../middlewares/validators/documento.validator.js';
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

// Rota para obter um documento específico
router.get(
    '/alunos/:alunoId/documentos/:documentoId',
    autenticar,
    validateObterDocumento,
    obterDocumento
);


// Rota para atualizar um documento
router.put(
    '/alunos/:alunoId/documentos/:documentoId',
    autenticar,
    validateAtualizarDocumento,
    atualizarDocumento
  );



export default router;