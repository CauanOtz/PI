// src/routes/responsavel.routes.js
import { Router } from 'express';
import * as alunoController from '../controllers/aluno.controller.js';
import { validateResponsavelId } from '../middlewares/validators/aluno.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /responsaveis/{responsavelId}/alunos:
 *   get:
 *     summary: Lista todos os alunos associados a um responsável
 *     tags: [Responsaveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responsavelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do responsável
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Lista de alunos do responsável retornada com sucesso.
 *       400:
 *         description: ID do responsável inválido.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Responsável não encontrado.
 */
router.get(
  '/:responsavelId/alunos', 
  autenticar, 
  validateResponsavelId, 
  alunoController.listarAlunosPorResponsavel
);

// Outras rotas relacionadas a responsáveis podem vir aqui.

export default router;