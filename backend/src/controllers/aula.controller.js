// src/controllers/aula.controller.js
import Aula from '../models/Aula.model.js';

/**
 * @openapi
 * tags:
 *   name: Aulas
 *   description: Gerenciamento de aulas
 */

export const listarAulas = async (req, res, next) => {
  try {
    const aulas = await Aula.findAll();
    res.status(200).json(aulas);
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
 *               $ref: '#/components/schemas/Aula'
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

    const novaAula = await Aula.create({
      titulo,
      data,
      horario,
      descricao,
    });

    res.status(201).json(novaAula);
  } catch (error) {
    // Se for um erro específico do Sequelize (ex: constraint unique violada, não aplicável aqui ainda)
    // podemos tratá-lo de forma mais específica antes de passar para o handler global.
    // if (error.name === 'SequelizeUniqueConstraintError') {
    //   return res.status(409).json({ message: 'Já existe uma aula com esses detalhes.' });
    // }
    next(error); // Passa outros erros para o middleware de tratamento de erros global
  }
};

// Implementar getAulaPorId, atualizarAula, excluirAula futuramente
// export const getAulaPorId = async (req, res, next) => { ... };
// export const atualizarAula = async (req, res, next) => { ... };
// export const excluirAula = async (req, res, next) => { ... };