import { requireAdmin } from '../middlewares/authorization.middleware.js';
import { validateIdParam } from '../middlewares/validators/param.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';
// src/routes/atividade.routes.js
import { Router } from 'express';
import * as atividadeController from '../controllers/atividade.controller.js';
import { validateCreateAtividade, validateUpdateAtividade } from '../middlewares/validators/atividade.validator.js';

const router = Router();

/**
 * @openapi
 * /atividades:
 *   get:
 *     summary: Lista todas as atividades
 *     tags: [Atividades]
 *     responses:
 *       200:
 *         description: Uma lista de atividades.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAtividades'
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', atividadeController.listarAtividades);

// Rota para criar uma nova atividade
router.post('/', autenticar, requireAdmin, validateCreateAtividade, atividadeController.criarAtividade);

// Rota para obter uma atividade específica
router.get('/:id', validateIdParam('id'), atividadeController.getAtividadePorId);

// Rota para atualizar uma atividade existente
router.put('/:id', autenticar, requireAdmin, validateIdParam('id'), validateUpdateAtividade, atividadeController.atualizarAtividade);

// Rota para remover uma atividade
router.delete('/:id', autenticar, requireAdmin, validateIdParam('id'), atividadeController.excluirAtividade);


export default router;
