// src/controllers/aluno.controller.js
import { AlunoDTO, PaginationDTO } from '../dto/index.js';
import AlunoService from '../services/aluno.service.js';
import { ok } from '../utils/response.js';

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
 *         description: Númeroda páginapara paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Númerode itens por pÃ¡gina
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
 *                   description: páginaatual
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
 *         description: Aluno Nãoencontrado
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
 *         description: responsável(is) Nãoencontrado(s)
 */
export const criarAluno = async (req, res, next) => {
  try {
    const { nome, idade, endereco, contato, responsaveisIds } = req.body;
    const novoAluno = await AlunoService.create({ nome, idade, endereco, contato, responsaveisIds });
    res.status(201);
    res.json({ sucesso: true, dados: novoAluno });
  } catch (error) {
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
 *         description: Aluno ou responsável(is) Nãoencontrado(s)
 */
export const atualizarAluno = async (req, res, next) => {
  try {
    const alunoId = req.params.id;
    const { nome, idade, endereco, contato, responsaveisIds } = req.body;
    const alunoAtualizado = await AlunoService.update(alunoId, { nome, idade, endereco, contato, responsaveisIds });
    
    if (!alunoAtualizado) {
      res.status(404);
      return res.json({ sucesso: false, mensagem: 'Aluno não encontrado' });
    }

    res.status(200);
    res.json({ sucesso: true, dados: alunoAtualizado });
  } catch (error) {
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
 *         description: Aluno Nãoencontrado
 */
export const excluirAluno = async (req, res, next) => {
  try {
    const alunoId = req.params.id;
    const result = await AlunoService.remove(alunoId);
    
    if (result === null) {
      res.status(404);
      return res.json({ sucesso: false, mensagem: 'Aluno não encontrado' });
    }

    res.status(204);
    res.end();
  } catch (error) {
    next(error);
  }
};
















