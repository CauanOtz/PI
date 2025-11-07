// src/routes/responsavel.routes.js
import { Router } from 'express';
import * as responsavelController from '../controllers/responsavel.controller.js';
import { validateResponsavelId } from '../middlewares/validators/responsavel.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /responsaveis/{responsavelId}/assistidos:
 *   get:
 *     summary: Lista todos os assistidos associados a um responsável
 *     tags: [Responsáveis]
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
 *         description: Lista de assistidos do responsável retornada com sucesso.
 *       400:
 *         description: ID do responsável inválido.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Responsável não encontrado.
 */
router.get(
  '/:responsavelId/assistidos', 
  autenticar, 
  validateResponsavelId, 
  responsavelController.listarAssistidosPorResponsavel
);

// Outras rotas relacionadas a responsáveis podem vir aqui.

export default router;