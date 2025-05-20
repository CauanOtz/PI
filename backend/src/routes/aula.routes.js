// src/routes/aula.routes.js
import { Router } from 'express';
import * as aulaController from '../controllers/aula.controller.js';

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
 *                 $ref: '#/components/schemas/Aula' # Referência ao esquema do modelo Aula
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/', aulaController.listarAulas);

/**
 * @openapi
 * /aulas:
 *   post:
 *     summary: Cria uma nova aula
 *     tags: [Aulas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaAula' # Esquema para criar uma nova aula
 *     responses:
 *       201:
 *         description: Aula criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aula'
 *       400:
 *         description: Dados de entrada inválidos.
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/', aulaController.criarAula);

// Adicione outras rotas para GET /{id}, PUT /{id}, DELETE /{id} com suas anotações

export default router;