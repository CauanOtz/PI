// src/controllers/responsavel-aluno.controller.js
import ResponsavelAluno from '../models/ResponsavelAluno.model.js';
import Usuario from '../models/Usuario.model.js';
import Aluno from '../models/Aluno.model.js';

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
 *               - cpfUsuario
 *               - idAluno
 *             properties:
 *               cpfUsuario:
 *                 type: string
 *                 description: CPF do responsável (apenas números)
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
    const { cpfUsuario, idAluno } = req.body;

    // Verifica se o usuário existe e é um responsável
    const usuario = await Usuario.findOne({
      where: { 
        cpf: cpfUsuario,
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
      where: { cpfUsuario, idAluno }
    });

    if (vinculoExistente) {
      return res.status(409).json({ 
        mensagem: 'Este responsável já está vinculado a este aluno' 
      });
    }

    // Cria o vínculo
    await ResponsavelAluno.create({
      cpfUsuario,
      idAluno
    });

    return res.status(201).json({ 
      mensagem: 'Responsável vinculado com sucesso' 
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /responsaveis/{cpfUsuario}/alunos/{idAluno}:
 *   delete:
 *     summary: Desvincula um responsável de um aluno
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpfUsuario
 *         required: true
 *         schema:
 *           type: string
 *         description: CPF do responsável (apenas números)
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
    const { cpfUsuario, idAluno } = req.params;

    // Verifica se o vínculo existe
    const vinculo = await ResponsavelAluno.findOne({
      where: { 
        cpfUsuario,
        idAluno
      }
    });

    if (!vinculo) {
      return res.status(404).json({ 
        mensagem: 'Vínculo não encontrado' 
      });
    }

    // Remove o vínculo
    await vinculo.destroy();

    return res.status(200).json({ 
      mensagem: 'Responsável desvinculado com sucesso' 
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @openapi
 * /alunos/{idAluno}/responsaveis:
 *   get:
 *     summary: Lista todos os responsáveis de um aluno
 *     tags: [Responsáveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAluno
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Lista de responsáveis do aluno
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Aluno não encontrado
 */
export const listarResponsaveis = async (req, res, next) => {
    try {
      const { idAluno } = req.params;
      const usuarioId = req.usuario.id;
  
      // Verifica se o aluno existe
      const aluno = await Aluno.findByPk(idAluno);
      if (!aluno) {
        return res.status(404).json({ mensagem: 'Aluno não encontrado' });
      }
  
      // Verifica se o usuário tem permissão (admin, o próprio aluno ou responsável)
      const isAdmin = req.usuario.role === 'admin';
      const isProprioAluno = aluno.usuarioId === usuarioId;
      const isResponsavel = await ResponsavelAluno.findOne({
        where: { 
          cpfUsuario: req.usuario.cpf,
          idAluno
        }
      });
  
      if (!isAdmin && !isProprioAluno && !isResponsavel) {
        return res.status(403).json({ 
          mensagem: 'Você não tem permissão para ver os responsáveis deste aluno' 
        });
      }
  
      // Busca os responsáveis do aluno
      const responsaveis = await Usuario.findAll({
        attributes: ['cpf', 'nome', 'email', 'telefone', 'dataNascimento', 'endereco'],
        include: [{
          model: ResponsavelAluno,
          as: 'alunos',
          where: { idAluno },
          attributes: [],
          required: true
        }],
        order: [['nome', 'ASC']]
      });
  
      return res.status(200).json(responsaveis);
  
    } catch (error) {
      next(error);
    }
  };