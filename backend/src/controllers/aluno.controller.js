// src/controllers/aluno.controller.js
import Aluno from '../models/Aluno.model.js';
import { sequelize } from '../config/database.js';
import Usuario from '../models/Usuario.model.js'; // Modelo de Usuário para os Responsáveis
import { Op } from 'sequelize';
import ResponsavelAluno from '../models/ResponsavelAluno.model.js'; // Modelo de associação para Many-to-Many

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
 *         name: responsavelId
 *         schema:
 *           type: integer
 *         description: ID do responsável para filtrar alunos associados a ele.
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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const whereClause = {};
    const includeClause = [
      {
        model: Usuario,
        as: 'responsaveis', // Usamos 'responsaveis' porque é a alias da associação Many-to-Many
        attributes: ['id', 'nome', 'email', 'telefone'],
        through: { attributes: [] } // Não queremos os campos da tabela de junção na resposta do aluno
      }
    ];

    if (req.query.search && typeof req.query.search === 'string') {
      whereClause.nome = {
        [Op.iLike]: `%${req.query.search.trim()}%`
      };
    }

    // Filtrar alunos por ID de responsável (Many-to-Many)
    if (req.query.responsavelId) {
      const responsavelId = parseInt(req.query.responsavelId);
      if (!isNaN(responsavelId)) {
        // Ajustamos o include para filtrar pela associação
        includeClause[0].where = { id: responsavelId };
      }
    }

    const { count, rows: alunos } = await Aluno.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: limit,
      offset: offset,
      order: [['nome', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      sucesso: true,
      dados: {
        alunos: alunos,
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
          model: Usuario,
          as: 'responsaveis',
          attributes: ['id', 'nome', 'email', 'telefone'],
          through: { attributes: [] }
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
 *               - responsaveisIds
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
 *               responsaveisIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs dos responsáveis pelo aluno.
 *                 example: [1, 2]
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
 *         description: Responsável(is) não encontrado(s)
 */
export const criarAluno = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { nome, idade, endereco, contato, responsaveisIds } = req.body;

    // Validação básica do array de responsáveis
    if (!responsaveisIds || !Array.isArray(responsaveisIds) || responsaveisIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: 'É necessário fornecer pelo menos um ID de responsável.',
      });
    }

    // Verifica se todos os responsáveis existem
    const responsaveisExistentes = await Usuario.findAll({
      where: {
        id: responsaveisIds,
        // Opcional: garantir que o usuário tem a role 'responsavel'
        // role: 'responsavel' 
      },
      transaction,
    });

    // Se o número de responsáveis encontrados não bate com o número de IDs fornecidos, algum ID é inválido
    if (responsaveisExistentes.length !== responsaveisIds.length) {
      await transaction.rollback();
      const foundIds = responsaveisExistentes.map(r => r.id);
      const missingIds = responsaveisIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Um ou mais responsáveis não foram encontrados.',
        detalhes: `IDs de responsáveis não encontrados: ${missingIds.join(', ')}`
      });
    }

    // Cria o aluno dentro da transação
    const novoAluno = await Aluno.create({
      nome,
      idade,
      endereco,
      contato,
    }, { transaction });

    // --- CORREÇÃO PRINCIPAL AQUI ---
    // Em vez de usar novoAluno.addResponsaveis, criamos as entradas na tabela de junção manualmente.
    // Isso é mais explícito e garantido de funcionar.
    const associacoesParaCriar = responsaveisExistentes.map(responsavel => {
      return {
        id_aluno: novoAluno.id,
        id_usuario: responsavel.id
      };
    });

    await ResponsavelAluno.bulkCreate(associacoesParaCriar, { transaction });
    // --- FIM DA CORREÇÃO ---

    // Finaliza a transação com sucesso
    await transaction.commit();

    // Recarrega o aluno com os dados dos responsáveis associados para a resposta final
    const alunoComResponsaveis = await Aluno.findByPk(novoAluno.id, {
      include: [
        {
          model: Usuario,
          as: 'responsaveis',
          attributes: ['id', 'nome', 'email', 'telefone'],
          through: { attributes: [] } // Oculta os campos da tabela de junção
        }
      ]
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Aluno criado e vinculado com sucesso!',
      dados: alunoComResponsaveis
    });

  } catch (error) {
    // Se qualquer coisa der errado, desfaz todas as operações
    await transaction.rollback();
    console.error('Erro detalhado ao criar aluno:', error);

    if (error.name === 'SequelizeValidationError') {
      const erros = error.errors.map(err => ({
        campo: err.path,
        mensagem: err.message
      }));
      return res.status(400).json({ 
        sucesso: false,
        mensagem: 'Erro de validação',
        erros 
      });
    }

    // Envia um erro genérico para o cliente
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
 *               responsaveisIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs dos responsáveis pelo aluno para atualizar.
 *                 example: [2, 3]
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
 *         description: Aluno ou responsável(is) não encontrado(s)
 */
export const atualizarAluno = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const alunoId = parseInt(req.params.id);
    const { nome, idade, endereco, contato, responsaveisIds } = req.body;

    if (isNaN(alunoId)) {
      await transaction.rollback();
      return res.status(400).json({
        mensagem: 'ID do aluno inválido',
        detalhes: 'O ID deve ser um número inteiro válido'
      });
    }

    const aluno = await Aluno.findByPk(alunoId, { transaction });

    if (!aluno) {
      await transaction.rollback();
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }

    // Atualiza os campos básicos do aluno
    const camposParaAtualizar = {};
    if (nome !== undefined) camposParaAtualizar.nome = nome;
    if (idade !== undefined) camposParaAtualizar.idade = idade;
    if (endereco !== undefined) camposParaAtualizar.endereco = endereco;
    if (contato !== undefined) camposParaAtualizar.contato = contato;

    await aluno.update(camposParaAtualizar, { transaction });

    // Se houver IDs de responsáveis para atualizar
    if (responsaveisIds !== undefined) {
      if (!Array.isArray(responsaveisIds)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'A lista de responsáveis deve ser um array de IDs.',
        });
      }

      if (responsaveisIds.length > 0) {
        const responsaveisExistentes = await Usuario.findAll({
          where: {
            id: responsaveisIds,
          },
          transaction,
        });

        if (responsaveisExistentes.length !== responsaveisIds.length) {
          await transaction.rollback();
          const foundIds = responsaveisExistentes.map(r => r.id);
          const missingIds = responsaveisIds.filter(id => !foundIds.includes(id));
          return res.status(404).json({
            sucesso: false,
            mensagem: 'Um ou mais responsáveis para atualização não encontrados',
            detalhes: `IDs de responsáveis não encontrados: ${missingIds.join(', ')}`
          });
        }
        // Usa setResponsaveis para substituir todas as associações existentes
        await aluno.setResponsaveis(responsaveisExistentes, { transaction });
      } else {
        // Se o array estiver vazio, remove todos os responsáveis
        await aluno.setResponsaveis([], { transaction });
      }
    }

    await transaction.commit();

    // Recarrega o aluno com os dados atualizados e os responsáveis
    const alunoAtualizado = await Aluno.findByPk(aluno.id, {
      include: [
        {
          model: Usuario,
          as: 'responsaveis',
          attributes: ['id', 'nome', 'email', 'telefone'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json(alunoAtualizado);
  } catch (error) {
    await transaction.rollback();
    if (error.name === 'SequelizeValidationError') {
      const erros = error.errors.map(err => ({
        campo: err.path,
        mensagem: err.message
      }));
      return res.status(400).json({ erros });
    }
    console.error('Erro ao atualizar aluno:', error);
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
  const transaction = await sequelize.transaction();
  
  try {
    const alunoId = parseInt(req.params.id);

    if (isNaN(alunoId)) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do aluno inválido',
        detalhes: 'O ID deve ser um número inteiro válido'
      });
    }

    // Primeiro, verifica se o aluno existe
    const aluno = await Aluno.findByPk(alunoId, { transaction });
    
    if (!aluno) {
      await transaction.rollback();
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno não encontrado',
        detalhes: `Nenhum aluno encontrado com o ID ${alunoId}`
      });
    }

    // Remove todas as associações na tabela de junção primeiro
    await ResponsavelAluno.destroy({
      where: { id_aluno: alunoId },
      transaction
    });

    // Agora remove o aluno
    await aluno.destroy({ transaction });
    
    // Se chegou até aqui, tudo deu certo
    await transaction.commit();
    
    res.status(204).end();
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao excluir aluno:', error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não foi possível excluir o aluno',
        detalhes: 'Existem registros associados a este aluno que precisam ser removidos primeiro.'
      });
    }
    
    next(error);
  }
};