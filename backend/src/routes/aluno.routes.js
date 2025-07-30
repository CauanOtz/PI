// src/routes/aluno.routes.js
import { Router } from 'express';
import * as alunoController from '../controllers/aluno.controller.js';
import { 
  validateCreateAluno, 
  validateUpdateAluno, 
  validateAlunoId,
  validateListarAlunos,
  validateResponsavelId
} from '../middlewares/validators/aluno.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

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
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', autenticar, validateListarAlunos, alunoController.listarAlunos);

/**
 * @openapi
 * /responsaveis/{responsavelId}/alunos:
 *   get:
 *     summary: Lista todos os alunos associados a um responsável
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responsavelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do responsável
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
 *     responses:
 *       200:
 *         description: Lista de alunos do responsável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 dados:
 *                   type: object
 *                   properties:
 *                     alunos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Aluno'
 *                     paginacao:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de alunos encontrados
 *                         paginaAtual:
 *                           type: integer
 *                           description: Número da página atual
 *                         totalPaginas:
 *                           type: integer
 *                           description: Total de páginas
 *                         itensPorPagina:
 *                           type: integer
 *                           description: Número de itens por página
 *                         temProximaPagina:
 *                           type: boolean
 *                           description: Indica se existe próxima página
 *                         temPaginaAnterior:
 *                           type: boolean
 *                           description: Indica se existe página anterior
 *       400:
 *         description: ID do responsável inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Responsável não encontrado
 */
router.get('/responsaveis/:responsavelId/alunos', autenticar, validateResponsavelId, alunoController.listarAlunosPorResponsavel);

/**
 * @openapi
 * /alunos/{id}:
 *   get:
 *     summary: Obtém um aluno pelo ID
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: ID inválido
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/:id', autenticar, validateAlunoId, alunoController.obterAlunoPorId);

/**
 * @openapi
 * /alunos:
 *   post:
 *     summary: Cria um novo aluno
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoAluno'
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Responsável não encontrado
 */
router.post('/', autenticar, validateCreateAluno, alunoController.criarAluno);

/**
 * @openapi
 * /alunos/{id}:
 *   put:
 *     summary: Atualiza um aluno existente
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Aluno ou responsável não encontrado
 */
router.put('/:id', autenticar, validateAlunoId, validateUpdateAluno, alunoController.atualizarAluno);

/**
 * @openapi
 * /alunos/{id}:
 *   delete:
 *     summary: Remove um aluno
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
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
 *       400:
 *         description: ID inválido
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Aluno não encontrado
 */
router.delete('/:id', autenticar, validateAlunoId, alunoController.excluirAluno);

export default router;
