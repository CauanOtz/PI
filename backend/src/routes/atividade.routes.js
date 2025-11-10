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
 *   post:
 *     summary: Cria uma nova atividade
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaAtividade'
 *     responses:
 *       201:
 *         description: Atividade criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAtividade'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido - requer perfil de admin
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', atividadeController.listarAtividades);
router.post('/', autenticar, requireAdmin, validateCreateAtividade, atividadeController.criarAtividade);

/**
 * @openapi
 * /atividades/{id}:
 *   get:
 *     summary: Retorna uma atividade específica
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     responses:
 *       200:
 *         description: Atividade encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAtividade'
 *       404:
 *         description: Atividade não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Atualiza uma atividade existente
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaAtividade'
 *     responses:
 *       200:
 *         description: Atividade atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAtividade'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido - requer perfil de admin
 *       404:
 *         description: Atividade não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Remove uma atividade
 *     tags: [Atividades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *     responses:
 *       204:
 *         description: Atividade removida com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido - requer perfil de admin
 *       404:
 *         description: Atividade não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', validateIdParam('id'), atividadeController.getAtividadePorId);
router.put('/:id', autenticar, requireAdmin, validateIdParam('id'), validateUpdateAtividade, atividadeController.atualizarAtividade);
router.delete('/:id', autenticar, requireAdmin, validateIdParam('id'), atividadeController.excluirAtividade);


export default router;
