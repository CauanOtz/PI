// src/routes/aluno.routes.js
import { Router } from 'express';
import * as alunoController from '../controllers/aluno.controller.js';
import { 
  validateCreateAluno, 
  validateUpdateAluno, 
  validateAlunoId,
  validateListarAlunos,
} from '../middlewares/validators/aluno.validator.js';
import { validateAdicionarDocumento, validateListarDocumentos, validateObterDocumento, validateAtualizarDocumento, validateExcluirDocumento, validateDownloadDocumento } from '../middlewares/validators/documento.validator.js';
import { adicionarDocumento, listarDocumentos, obterDocumento, atualizarDocumento, excluirDocumento, downloadDocumento } from '../controllers/documento.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { sequelize } from '../config/database.js';

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
 *                 example: [7]
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

router.post(
  '/:alunoId/documentos',
  autenticar,
  upload.single('documento'),
  validateAdicionarDocumento,
  adicionarDocumento
);

// Rota para listar documentos de um aluno
router.get(
  '/:alunoId/documentos',
  autenticar,
  validateListarDocumentos,
  listarDocumentos
);

// Rota para obter um documento específico
router.get(
  '/:alunoId/documentos/:documentoId',
  autenticar,
  validateObterDocumento,
  obterDocumento
);


// Rota para atualizar um documento
router.put(
  '/:alunoId/documentos/:documentoId',
  autenticar,
  validateAtualizarDocumento,
  atualizarDocumento
);


// Rota para excluir um documento
router.delete(
  '/:alunoId/documentos/:documentoId',
  autenticar,
  validateExcluirDocumento,
  excluirDocumento
);

// Rota para download de documento
router.get(
  '/:alunoId/documentos/:documentoId/download',
  autenticar,
  validateDownloadDocumento,
  downloadDocumento
);

// Rota de depuração para verificar os registros em responsaveis_alunos
router.get('/debug/vinculos', autenticar, async (req, res) => {
  try {
    const { id } = req.usuario;
    
    // Verifica se o usuário é admin
    if (req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Apenas administradores podem acessar esta rota' });
    }
    
    // Consulta todos os registros da tabela responsaveis_alunos
    const vinculos = await sequelize.query(
      'SELECT * FROM responsaveis_alunos',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Consulta os usuários
    const usuarios = await sequelize.query(
      'SELECT id, nome, email, role FROM usuarios',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Consulta os alunos
    const alunos = await sequelize.query(
      'SELECT id, nome FROM alunos',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Mapeia os resultados para incluir informações detalhadas
    const resultado = vinculos.map(vinculo => ({
      ...vinculo,
      usuario: usuarios.find(u => u.id === vinculo.id_usuario),
      aluno: alunos.find(a => a.id === vinculo.id_aluno)
    }));
    
    res.status(200).json({
      total: resultado.length,
      vinculos: resultado
    });
    
  } catch (error) {
    console.error('Erro na rota de depuração:', error);
    res.status(500).json({ 
      mensagem: 'Erro ao consultar vínculos',
      erro: error.message 
    });
  }
});

export default router;