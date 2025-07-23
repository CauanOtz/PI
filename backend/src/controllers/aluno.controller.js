// src/controllers/aluno.controller.js
import Aluno from '../models/Aluno.model.js';
import Usuario from '../models/Usuario.model.js';
import { Op } from 'sequelize';

/**
 * @openapi
 * tags:
 *   name: Alunos
 *   description: Gerenciamento de alunos
 */

/**
 * @openapi
 * /alunos:
 *   get:
 *     summary: Lista todos os alunos
 *     tags: [Alunos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar alunos por nome
 *       - in: query
 *         name: responsavel_id
 *         schema:
 *           type: integer
 *         description: ID do responsável para filtrar alunos
 *     responses:
 *       200:
 *         description: Lista de alunos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alunos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Aluno'
 *                 total:
 *                   type: integer
 *                   description: Total de alunos encontrados
 *                 page:
 *                   type: integer
 *                   description: Página atual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 */
export const listarAlunos = async (req, res, next) => {
  try {
    // Validação dos parâmetros de paginação
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Filtro por termo de busca no nome
    if (req.query.search && typeof req.query.search === 'string') {
      whereClause.nome = {
        [Op.iLike]: `%${req.query.search.trim()}%`
      };
    }
    
    // Filtro por responsável
    if (req.query.responsavel_id) {
      const responsavelId = parseInt(req.query.responsavel_id);
      if (!isNaN(responsavelId)) {
        whereClause.responsavel_id = responsavelId;
      }
    }
    
    // Busca os alunos com paginação e filtros
    const { count, rows } = await Aluno.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [['nome', 'ASC']],
      include: [
        {
          association: 'responsavel',
          attributes: ['id', 'nome', 'email', 'telefone']
        }
      ]
    });
    
    // Cálculo do total de páginas
    const totalPages = Math.ceil(count / limit);
    
    // Resposta formatada
    res.status(200).json({
      sucesso: true,
      dados: {
        alunos: rows,
        paginacao: {
          total: count,
          paginaAtual: page,
          totalPaginas: totalPages,
          itensPorPagina: limit,
          temProximaPagina: page < totalPages,
          temPaginaAnterior: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    next(error);
  }
};

/**
 * @openapi
 * /alunos/{id}:
 *   get:
 *     summary: Obtém um aluno pelo ID
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno a ser obtido
 *     responses:
 *       200:
 *         description: Aluno encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       404:
 *         description: Aluno não encontrado
 */
export const obterAlunoPorId = async (req, res, next) => {
  try {
    const alunoId = parseInt(req.params.id);
    
    if (isNaN(alunoId)) {
      return res.status(400).json({ 
        mensagem: 'ID do aluno inválido',
        detalhes: 'O ID deve ser um número inteiro válido'
      });
    }
    
    const aluno = await Aluno.findByPk(alunoId, {
      include: [
        {
          association: 'responsavel',
          attributes: ['id', 'nome', 'email', 'telefone']
        }
      ]
    });
    
    if (!aluno) {
      return res.status(404).json({ 
        mensagem: 'Aluno não encontrado',
        detalhes: `Nenhum aluno encontrado com o ID ${alunoId}`
      });
    }
    
    res.status(200).json({
      sucesso: true,
      dados: aluno
    });
  } catch (error) {
    console.error('Erro ao buscar aluno por ID:', error);
    next(error);
  }
};

/**
 * @openapi
 * /alunos:
 *   post:
 *     summary: Cria um novo aluno
 *     tags: [Alunos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - idade
 *               - responsavel_id
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Maria Oliveira"
 *               idade:
 *                 type: integer
 *                 example: 10
 *               endereco:
 *                 type: string
 *                 example: "Rua das Flores, 123 - Centro"
 *               contato:
 *                 type: string
 *                 example: "(11) 98765-4321"
 *               responsavel_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Responsável não encontrado
 */
export const criarAluno = async (req, res, next) => {
  try {
    // Verifica se o responsável existe
    const responsavel = await Usuario.findByPk(req.body.responsavel_id);
    if (!responsavel) {
      return res.status(404).json({ 
        sucesso: false,
        mensagem: 'Responsável não encontrado',
        detalhes: `Nenhum responsável encontrado com o ID ${req.body.responsavel_id}`
      });
    }
    
    const novoAluno = await Aluno.create(req.body);
    
    // Recarrega o aluno com os dados do responsável para a resposta
    const alunoComResponsavel = await Aluno.findByPk(novoAluno.id, {
      include: [
        {
          association: 'responsavel',
          attributes: ['id', 'nome', 'email', 'telefone']
        }
      ]
    });
    
    res.status(201).json(alunoComResponsavel);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const erros = error.errors.map(err => ({
        campo: err.path,
        mensagem: err.message
      }));
      return res.status(400).json({ erros });
    }
    next(error);
  }
};

/**
 * @openapi
 * /alunos/{id}:
 *   put:
 *     summary: Atualiza um aluno existente
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Maria Oliveira da Silva"
 *               idade:
 *                 type: integer
 *                 example: 11
 *               endereco:
 *                 type: string
 *                 example: "Rua das Flores, 123 - Centro, São Paulo"
 *               contato:
 *                 type: string
 *                 example: "(11) 98765-1234"
 *               responsavel_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Aluno ou responsável não encontrado
 */
export const atualizarAluno = async (req, res, next) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    
    if (!aluno) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }
    
    // Se estiver tentando atualizar o responsável, verifica se existe
    if (req.body.responsavel_id) {
      const responsavel = await Usuario.findByPk(req.body.responsavel_id);
      if (!responsavel) {
        return res.status(404).json({ 
          sucesso: false,
          mensagem: 'Responsável não encontrado',
          detalhes: `Nenhum responsável encontrado com o ID ${req.body.responsavel_id}`
        });
      }
    }
    
    // Atualiza apenas os campos fornecidos no corpo da requisição
    const camposAtualizaveis = ['nome', 'idade', 'endereco', 'contato', 'responsavel_id'];
    camposAtualizaveis.forEach(campo => {
      if (req.body[campo] !== undefined) {
        aluno[campo] = req.body[campo];
      }
    });
    
    await aluno.save();
    
    // Recarrega o aluno com os dados atualizados e o responsável
    const alunoAtualizado = await Aluno.findByPk(aluno.id, {
      include: [
        {
          association: 'responsavel',
          attributes: ['id', 'nome', 'email', 'telefone']
        }
      ]
    });
    
    res.status(200).json(alunoAtualizado);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const erros = error.errors.map(err => ({
        campo: err.path,
        mensagem: err.message
      }));
      return res.status(400).json({ erros });
    }
    next(error);
  }
};

/**
 * @openapi
 * /alunos/{id}:
 *   delete:
 *     summary: Remove um aluno
 *     tags: [Alunos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno a ser removido
 *     responses:
 *       204:
 *         description: Aluno removido com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
export const excluirAluno = async (req, res, next) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    
    if (!aluno) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }
    
    await aluno.destroy();
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
