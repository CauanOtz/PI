// src/controllers/responsavel-aluno.controller.js
import { ok, created } from '../utils/response.js';
import ResponsavelAlunoService from '../services/responsavel-aluno.service.js';

const responsavelAlunoService = new ResponsavelAlunoService();

/**
 * @openapi
 * /responsaveis-alunos:
 *   post:
 *     summary: Vincula um responsável a um aluno
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
 *               - idAluno
 *             properties:
 *               idUsuario:
 *                 type: integer
 *                 description: ID do responsável
 *               idAluno:
 *                 type: integer
 *                 description: ID do aluno
 *     responses:
 *       201:
 *         description: Responsável vinculado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário ou aluno não encontrado
 *       409:
 *         description: Vínculo já existe
 */
export const vincularResponsavel = async (req, res, next) => {
  try {
    const { idUsuario, idAluno } = req.body;
    const result = await responsavelAlunoService.vincular(idUsuario, idAluno);

    if (result.notFound) {
      return res.status(404).json({ mensagem: result.message });
    }

    if (result.conflict) {
      return res.status(409).json({ mensagem: result.message });
    }

    return created(res, { mensagem: 'Responsável vinculado com sucesso' });

  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /responsaveis-alunos/usuario/{idUsuario}/aluno/{idAluno}:
 *   delete:
 *     summary: Desvincula um responsável de um aluno
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do responsável
 *       - in: path
 *         name: idAluno
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Responsável desvinculado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Vínculo não encontrado
 */
export const desvincularResponsavel = async (req, res, next) => {
  try {
    const { idUsuario, idAluno } = req.params;
    const result = await responsavelAlunoService.desvincular(idUsuario, idAluno);

    if (result.notFound) {
      return res.status(404).json({ mensagem: result.message });
    }

    return ok(res, { mensagem: 'Responsável desvinculado com sucesso' });

  } catch (error) {
    next(error);
  }
};



