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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aula'
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', aulaController.listarAulas);

// Rota para criar uma nova aula
router.post('/', validateCreateAula, aulaController.criarAula);

// Rota para atualizar uma aula existente
router.put('/:id', validateUpdateAula, aulaController.atualizarAula);

// Rota para remover uma aula
router.delete('/:id', aulaController.excluirAula);


export default router;