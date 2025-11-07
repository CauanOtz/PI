// src/controllers/atividade.controller.js
import { AtividadeDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';
import AtividadeService from '../services/atividade.service.js';

/**
 * @openapi
 * tags:
 *   name: Atividades
 *   description: Gerenciamento de atividades
 */

export const listarAtividades = async (req, res, next) => {
  try {
    const atividades = await AtividadeService.listAll();
    const atividadesDTO = atividades.map((a) => AtividadeDTO.from(a));
    return ok(res, { atividades: atividadesDTO });
  } catch (error) {
    next(error); // Passa o erro para o middleware de tratamento de erros global
  }
};

/**
 * @openapi
 * /atividades:
 *   post:
 *     summary: Cria uma nova atividade
 *     tags: [Atividades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaAtividade'
 *     responses:
 *       201:
 *         description: Atividade criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAtividade'
 *       400:
 *         description: Dados de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       500:
 *         description: Erro interno do servidor.
 */
export const criarAtividade = async (req, res, next) => {
  try {
    // Os dados já foram validados pelo middleware validateCreateAtividade
    const { titulo, data, horario, descricao } = req.body;

    const novaAtividade = await AtividadeService.create({ titulo, data, horario, descricao });
    return created(res, AtividadeDTO.from(novaAtividade));
  } catch (error) {
    // Se for um erro específico do Sequelize (ex: constraint unique violada, não aplicável aqui ainda)
    // podemos tratá-lo de forma mais específica antes de passar para o handler global.
    // if (error.name === 'SequelizeUniqueConstraintError') {
    //   return res.status(409).json({ message: 'Já existe uma atividade com esses detalhes.' });
    // }
    next(error); // Passa outros erros para o middleware de tratamento de erros global
  }
};

/**
 * @openapi
 * /atividades/{id}:
 *   put:
 *     summary: Atualiza uma atividade existente
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaAtividade'
 *     responses:
 *       200:
 *         description: Atividade atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAtividade'
 *       400:
 *         description: Dados de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       404:
 *         description: Atividade não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
export const atualizarAtividade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, data, horario, descricao } = req.body;

    const atividadeAtualizada = await AtividadeService.update(id, { titulo, data, horario, descricao });
    if (!atividadeAtualizada) {
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }
    return ok(res, AtividadeDTO.from(atividadeAtualizada));
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /atividades/{id}:
 *   get:
 *     summary: Obtém uma atividade específica pelo ID
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade a ser obtida
 *     responses:
 *       200:
 *         description: Atividade encontrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAtividade'
 *       404:
 *         description: Atividade não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
export const getAtividadePorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const atividade = await AtividadeService.getById(id);
    return ok(res, AtividadeDTO.from(atividade));
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /atividades/{id}:
 *   delete:
 *     summary: Remove uma atividade existente
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade a ser removida
 *     responses:
 *       204:
 *         description: Atividade removida com sucesso.
 *       404:
 *         description: Atividade não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
export const excluirAtividade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AtividadeService.remove(id);
    if (result === null) {
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
