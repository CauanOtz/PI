// src/routes/aula.routes.js
import { Router } from 'express';
import * as aulaController from '../controllers/aula.controller.js';
import { validateCreateAula, validateUpdateAula } from '../middlewares/validators/aula.validator.js'; // Importe o validador de atualização

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

/**
 * @openapi
 * /aulas/{id}:
 *   put:
 *     summary: Atualiza uma aula existente
 *     tags: [Aulas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da aula a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaAula'
 *     responses:
 *       200:
 *         description: Aula atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aula'
 *       400:
 *         description: Dados de entrada inválidos.
 *       404:
 *         description: Aula não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
router.put('/:id', validateUpdateAula, aulaController.atualizarAula);

// Adicione outras rotas para GET /{id}, DELETE /{id} com suas anotações
// router.get('/:id', aulaController.getAulaPorId);
// router.delete('/:id', aulaController.excluirAula);

export default router;