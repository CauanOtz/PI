import { requireAdmin } from '../middlewares/authorization.middleware.js';
import { validateIdParam } from '../middlewares/validators/param.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';
// src/routes/aula.routes.js
import { Router } from 'express';
import * as aulaController from '../controllers/aula.controller.js';
import { validateCreateAula, validateUpdateAula } from '../middlewares/validators/aula.validator.js';

const router = Router();

/**
 * @openapi
 * /aulas:
 *   get:
 *     summary: Lista todas as aulas
 *     tags: [Aulas]
 *     responses:
 *       200:
 *         description: Uma lista de aulas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAulas'
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', aulaController.listarAulas);

// Rota para criar uma nova aula
router.post('/', autenticar, requireAdmin, validateCreateAula, aulaController.criarAula);

// Rota para obter uma aula especÃ­fica
router.get('/:id', validateIdParam('id'), aulaController.getAulaPorId);

// Rota para atualizar uma aula existente
router.put('/:id', autenticar, requireAdmin, validateIdParam('id'), validateUpdateAula, aulaController.atualizarAula);

// Rota para remover uma aula
router.delete('/:id', autenticar, requireAdmin, validateIdParam('id'), aulaController.excluirAula);


export default router;


