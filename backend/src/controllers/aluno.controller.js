// src/controllers/aluno.controller.js
import Aluno from '../models/Aluno.model.js';
import { sequelize } from '../config/database.js';
import Usuario from '../models/Usuario.model.js'; // Modelo de UsuÃ¡rio para os ResponsÃ¡veis
import { Op } from 'sequelize';
import ResponsavelAluno from '../models/ResponsavelAluno.model.js'; // Modelo de associaÃ§Ã£o para Many-to-Many
import Documento from '../models/Documento.model.js'; // Modelo de documento para inclusÃ£o na exclusÃ£o
import { AlunoDTO, PaginationDTO } from '../dto/index.js';
import AlunoService from '../services/aluno.service.js';
import { ok } from '../utils/response.js';
import fs from 'fs'; // Importando o mÃ³dulo fs para manipulaÃ§Ã£o de arquivos

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
 *         description: NÃºmero da pÃ¡gina para paginaÃ§Ã£o
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: NÃºmero de itens por pÃ¡gina
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar alunos por nome
 *       - in: query
 *         name: responsavelId
 *         schema:
 *           type: integer
 *         description: ID do responsÃ¡vel para filtrar alunos associados a ele.
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
 *                   description: PÃ¡gina atual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de pÃ¡ginas
 */
export const listarAlunos = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const { count, rows: alunos, page: svcPage, limit: svcLimit } = await AlunoService.listAll({
      page,
      limit,
      search: req.query.search,
      responsavelId: req.query.responsavelId,
    });

    const totalPages = Math.ceil(count / svcLimit);
    const alunosDTO = AlunoDTO.list(alunos, { includeResponsaveis: true });
    const paginacao = new PaginationDTO({ total: count, paginaAtual: svcPage, totalPaginas: totalPages, itensPorPagina: svcLimit });
    return ok(res, { alunos: alunosDTO, paginacao });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /alunos/{id}:
 *   get:
 *     summary: ObtÃ©m um aluno pelo ID
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
 *         description: Aluno nÃ£o encontrado
 */
export const obterAlunoPorId = async (req, res, next) => {
  try {
    const aluno = await AlunoService.getById(req.params.id);
    const dto = AlunoDTO.from(aluno, { includeResponsaveis: true });
    return ok(res, { aluno: dto });
  } catch (error) {
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
 *                 description: IDs dos responsÃ¡veis pelo aluno.
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         description: Dados invÃ¡lidos
 *       404:
 *         description: ResponsÃ¡vel(is) nÃ£o encontrado(s)
 */
export const criarAluno = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { nome, idade, endereco, contato, responsaveisIds } = req.body;

    // ValidaÃ§Ã£o bÃ¡sica do array de responsÃ¡veis
    if (!responsaveisIds || !Array.isArray(responsaveisIds) || responsaveisIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Ã‰ necessÃ¡rio fornecer pelo menos um ID de responsÃ¡vel.',
      });
    }

    // Verifica se todos os responsÃ¡veis existem
    const responsaveisExistentes = await Usuario.findAll({
      where: {
        id: responsaveisIds,
        // Opcional: garantir que o usuÃ¡rio tem a role 'responsavel'
        // role: 'responsavel' 
      },
      transaction,
    });

    // Se o nÃºmero de responsÃ¡veis encontrados nÃ£o bate com o nÃºmero de IDs fornecidos, algum ID Ã© invÃ¡lido
    if (responsaveisExistentes.length !== responsaveisIds.length) {
      await transaction.rollback();
      const foundIds = responsaveisExistentes.map(r => r.id);
      const missingIds = responsaveisIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Um ou mais responsÃ¡veis nÃ£o foram encontrados.',
        detalhes: `IDs de responsÃ¡veis nÃ£o encontrados: ${missingIds.join(', ')}`
      });
    }

    // Cria o aluno dentro da transaÃ§Ã£o
    const novoAluno = await Aluno.create({
      nome,
      idade,
      endereco,
      contato,
    }, { transaction });

    // Cria as associaÃ§Ãµes na tabela de junÃ§Ã£o
    if (responsaveisExistentes && responsaveisExistentes.length > 0) {
      // Usando o mÃ©todo addResponsaveis que Ã© criado automaticamente pelo Sequelize
      // para a associaÃ§Ã£o belongsToMany
      await novoAluno.addResponsaveis(responsaveisExistentes, { transaction });
      
      // Log para depuraÃ§Ã£o
      console.log(`AssociaÃ§Ãµes criadas para o aluno ID ${novoAluno.id} com os responsÃ¡veis:`, 
        responsaveisExistentes.map(r => r.id).join(', '));
    }

    // Finaliza a transaÃ§Ã£o com sucesso
    await transaction.commit();

    // Recarrega o aluno com os dados dos responsÃ¡veis associados para a resposta final
    const alunoComResponsaveis = await Aluno.findByPk(novoAluno.id, {
      include: [
        {
          model: Usuario,
          as: 'responsaveis',
          attributes: ['id', 'nome', 'email', 'telefone'],
          through: { attributes: [] } // Oculta os campos da tabela de junÃ§Ã£o
        }
      ]
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Aluno criado e vinculado com sucesso!',
      dados: alunoComResponsaveis
    });

  } catch (error) {
    // Se qualquer coisa der errado, desfaz todas as operaÃ§Ãµes
    await transaction.rollback();
    console.error('Erro detalhado ao criar aluno:', error);

    if (error.name === 'SequelizeValidationError') {
      const erros = error.errors.map(err => ({
        campo: err.path,
        mensagem: err.message
      }));
      return res.status(400).json({ 
        sucesso: false,
        mensagem: 'Erro de validaÃ§Ã£o',
        erros 
      });
    }

    // Envia um erro genÃ©rico para o cliente
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
 *                 example: "Rua das Flores, 123 - Centro, SÃ£o Paulo"
 *               contato:
 *                 type: string
 *                 example: "(11) 98765-1234"
 *               responsaveisIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs dos responsÃ¡veis pelo aluno para atualizar.
 *                 example: [2, 3]
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         description: Dados invÃ¡lidos
 *       404:
 *         description: Aluno ou responsÃ¡vel(is) nÃ£o encontrado(s)
 */
export const atualizarAluno = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const alunoId = parseInt(req.params.id);
    const { nome, idade, endereco, contato, responsaveisIds } = req.body;

    if (isNaN(alunoId)) {
      await transaction.rollback();
      return res.status(400).json({
        mensagem: 'ID do aluno invÃ¡lido',
        detalhes: 'O ID deve ser um nÃºmero inteiro vÃ¡lido'
      });
    }

    const aluno = await Aluno.findByPk(alunoId, { transaction });

    if (!aluno) {
      await transaction.rollback();
      return res.status(404).json({ mensagem: 'Aluno nÃ£o encontrado' });
    }

    // Atualiza os campos bÃ¡sicos do aluno
    const camposParaAtualizar = {};
    if (nome !== undefined) camposParaAtualizar.nome = nome;
    if (idade !== undefined) camposParaAtualizar.idade = idade;
    if (endereco !== undefined) camposParaAtualizar.endereco = endereco;
    if (contato !== undefined) camposParaAtualizar.contato = contato;

    await aluno.update(camposParaAtualizar, { transaction });

    // Se houver IDs de responsÃ¡veis para atualizar
    if (responsaveisIds !== undefined) {
      if (!Array.isArray(responsaveisIds)) {
        await transaction.rollback();
        return res.status(400).json({
          sucesso: false,
          mensagem: 'A lista de responsÃ¡veis deve ser um array de IDs.',
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
            mensagem: 'Um ou mais responsÃ¡veis para atualizaÃ§Ã£o nÃ£o encontrados',
            detalhes: `IDs de responsÃ¡veis nÃ£o encontrados: ${missingIds.join(', ')}`
          });
        }
        // Usa setResponsaveis para substituir todas as associaÃ§Ãµes existentes
        await aluno.setResponsaveis(responsaveisExistentes, { transaction });
      } else {
        // Se o array estiver vazio, remove todos os responsÃ¡veis
        await aluno.setResponsaveis([], { transaction });
      }
    }

    await transaction.commit();

    // Recarrega o aluno com os dados atualizados e os responsÃ¡veis
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

    const dto = AlunoDTO.from(alunoAtualizado, { includeResponsaveis: true });
    return ok(res, { aluno: dto });
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
 *         description: Aluno nÃ£o encontrado
 */
export const excluirAluno = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const alunoId = parseInt(req.params.id);

    if (isNaN(alunoId)) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do aluno invÃ¡lido'
      });
    }

    const aluno = await Aluno.findByPk(alunoId, { transaction });
    
    if (!aluno) {
      await transaction.rollback();
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aluno nÃ£o encontrado'
      });
    }

    // removo o vinculo com documentos 
    await Documento.destroy({ where: { alunoId }, transaction });

    //removo as presenÃ§as associadas a ele
    if (sequelize.models.Presenca) {
      await sequelize.models.Presenca.destroy({ where: { idAluno: alunoId }, transaction });
    } else {
      await sequelize.query('DELETE FROM presencas WHERE id_aluno = ?', { replacements: [alunoId], transaction });
    }

    //removo os vinculos na tabela que junta os responsaveis dos alunos
    await ResponsavelAluno.destroy({ where: { id_aluno: alunoId }, transaction });

    // agora removo o aluno
    await aluno.destroy({ transaction });
    
     // Se chegou atÃ© aqui, tudo deu certo
    await transaction.commit();
    
    // 204 sem mensagem nenhuma msm
    return res.status(204).end();
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao excluir aluno:', error);

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'NÃ£o foi possÃ­vel excluir o aluno.',
        detalhes: 'Este aluno ainda possui registros dependentes (como presenÃ§as) que nÃ£o puderam ser removidos.',
        erro: error.message
      });
    }

    next(error);
  }
};
















