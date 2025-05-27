// src/routes/aula.routes.js
import { Router } from 'express';
import * as aulaController from '../controllers/aula.controller.js';
import { validateCreateAula } from '../middlewares/validators/aula.validator.js'; // Importe o validador

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

// A rota POST agora usa o middleware de validação ANTES do controller
router.post('/', validateCreateAula, aulaController.criarAula);


// Adicione outras rotas para GET /{id}, PUT /{id}, DELETE /{id} com suas anotações
// router.get('/:id', aulaController.getAulaPorId);
// router.put('/:id', validateUpdateAula, aulaController.atualizarAula); // Precisaria de validateUpdateAula
// router.delete('/:id', aulaController.excluirAula);

export default router;