// src/controllers/responsavel-assistido.controller.js
import { validationResult } from 'express-validator';
import ResponsavelAssistidoService from '../services/responsavel-assistido.service.js';

const responsavelAssistidoService = new ResponsavelAssistidoService();

/**
 * @openapi
 * /api/v2/responsaveis-assistidos/vincular:
 *   post:
 *     summary: Vincula um responsável a um assistido
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *               - idAssistido
 *             properties:
 *               idUsuario:
 *                 type: integer
 *                 description: ID do responsável
 *               idAssistido:
 *                 type: integer
 *                 description: ID do assistido
 *     responses:
 *       201:
 *         description: Vínculo criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Responsável ou assistido não encontrado
 *       409:
 *         description: Vínculo já existe
 */
export const vincularResponsavel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idUsuario, idAssistido } = req.body;
    const result = await responsavelAssistidoService.vincular(idUsuario, idAssistido);

    if (result.notFound) {
      return res.status(404).json({ message: result.message });
    }
    if (result.conflict) {
      return res.status(409).json({ message: result.message });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao vincular responsável:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * @openapi
 * /api/v2/responsaveis-assistidos/desvincular:
 *   delete:
 *     summary: Desvincula um responsável de um assistido
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *               - idAssistido
 *             properties:
 *               idUsuario:
 *                 type: integer
 *                 description: ID do responsável
 *               idAssistido:
 *                 type: integer
 *                 description: ID do assistido
 *     responses:
 *       200:
 *         description: Vínculo removido com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Vínculo não encontrado
 */
export const desvincularResponsavel = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idUsuario, idAssistido } = req.body;
    const result = await responsavelAssistidoService.desvincular(idUsuario, idAssistido);

    if (result.notFound) {
      return res.status(404).json({ message: result.message });
    }

    res.json(result);
  } catch (error) {
    console.error('Erro ao desvincular responsável:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};