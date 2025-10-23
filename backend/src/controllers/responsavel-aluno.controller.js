// src/controllers/responsavel-aluno.controller.js
import ResponsavelAluno from '../models/ResponsavelAluno.model.js';
import Usuario from '../models/Usuario.model.js';
import Aluno from '../models/Aluno.model.js';
import { ok, created } from '../utils/response.js';

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

    // Verifica se o usuário existe e é um responsável
    const usuario = await Usuario.findOne({
      where: { 
        id: idUsuario,
        role: 'responsavel' 
      }
    });

    if (!usuario) {
      return res.status(404).json({ 
        mensagem: 'Responsável não encontrado ou não tem permissão' 
      });
    }

    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(idAluno);
    if (!aluno) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    // Verifica se o vínculo já existe
    const vinculoExistente = await ResponsavelAluno.findOne({
      where: { id_usuario: idUsuario, id_aluno: idAluno }
    });

    if (vinculoExistente) {
      return res.status(409).json({ 
        mensagem: 'Este responsável já está vinculado a este aluno' 
      });
    }

    // Cria o vínculo
    await ResponsavelAluno.create({
      id_usuario: idUsuario,
      id_aluno: idAluno
    });

    return created(res, { mensagem: 'Respons�vel vinculado com sucesso' });

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

    // Verifica se o vínculo existe
    const vinculo = await ResponsavelAluno.findOne({
      where: { 
        id_usuario: idUsuario,
        id_aluno: idAluno
      }
    });

    if (!vinculo) {
      return res.status(404).json({ 
        mensagem: 'Vínculo não encontrado' 
      });
    }

    // Remove o vínculo
    await vinculo.destroy();

    return ok(res, { mensagem: 'Respons�vel desvinculado com sucesso' });

  } catch (error) {
    next(error);
  }
};



