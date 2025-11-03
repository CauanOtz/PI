// src/controllers/aula.controller.js
import { AulaDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';
import AulaService from '../services/aula.service.js';

/**
 * @openapi
 * tags:
 *   name: Aulas
 *   description: Gerenciamento de aulas
 */

export const listarAulas = async (req, res, next) => {
  try {
    const aulas = await AulaService.listAll();
    const aulasDTO = aulas.map((a) => AulaDTO.from(a));
    return ok(res, { aulas: aulasDTO });
  } catch (error) {
    next(error); // Passa o erro para o middleware de tratamento de erros global
  }
};

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
 *             $ref: '#/components/schemas/NovaAula'
 *     responses:
 *       201:
 *         description: Aula criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAula'
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
export const criarAula = async (req, res, next) => {
  try {
    // Os dados já foram validados pelo middleware validateCreateAula
    const { titulo, data, horario, descricao } = req.body;

    const novaAula = await AulaService.create({ titulo, data, horario, descricao });
    return created(res, AulaDTO.from(novaAula));
  } catch (error) {
    // Se for um erro específico do Sequelize (ex: constraint unique violada, não aplicável aqui ainda)
    // podemos tratá-lo de forma mais específica antes de passar para o handler global.
    // if (error.name === 'SequelizeUniqueConstraintError') {
    //   return res.status(409).json({ message: 'Já existe uma aula com esses detalhes.' });
    // }
    next(error); // Passa outros erros para o middleware de tratamento de erros global
  }
};

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
 *               $ref: '#/components/schemas/SuccessAula'
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
 *         description: Aula não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
export const atualizarAula = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, data, horario, descricao } = req.body;

    const aulaAtualizada = await AulaService.update(id, { titulo, data, horario, descricao });
    if (!aulaAtualizada) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }
    return ok(res, AulaDTO.from(aulaAtualizada));
  } catch (error) {
    next(error);
  }
};

// Implementar getAulaPorId, excluirAula futuramente
// export const getAulaPorId = async (req, res, next) => { ... };
// export const excluirAula = async (req, res, next) => { ... };// Adicione estas funções ao final do arquivo, antes do export

/**
 * @openapi
 * /aulas/{id}:
 *   get:
 *     summary: Obtém uma aula específica pelo ID
 *     tags: [Aulas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da aula a ser obtida
 *     responses:
 *       200:
 *         description: Aula encontrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessAula'
 *       404:
 *         description: Aula não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
export const getAulaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const aula = await AulaService.getById(id);
    return ok(res, AulaDTO.from(aula));
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /aulas/{id}:
 *   delete:
 *     summary: Remove uma aula existente
 *     tags: [Aulas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da aula a ser removida
 *     responses:
 *       204:
 *         description: Aula removida com sucesso.
 *       404:
 *         description: Aula não encontrada.
 *       500:
 *         description: Erro interno do servidor.
 */
export const excluirAula = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AulaService.remove(id);
    if (result === null) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

