// src/routes/assistido.routes.js
import { Router } from 'express';
import * as assistidoController from '../controllers/assistido.controller.js';
import { 
  validateCreateAssistido, 
  validateUpdateAssistido, 
  validateAssistidoId,
  validateListarAssistidos,
} from '../middlewares/validators/assistido.validator.js';
import { validateAdicionarDocumento, validateListarDocumentos, validateObterDocumento, validateAtualizarDocumento, validateExcluirDocumento, validateDownloadDocumento } from '../middlewares/validators/documento.validator.js';
import { adicionarDocumento, listarDocumentos, obterDocumento, atualizarDocumento, excluirDocumento, downloadDocumento } from '../controllers/documento.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { sequelize } from '../config/database.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Assistidos
 *   description: Gerenciamento de assistidos
 */

/**
 * @openapi
 * /assistidos:
 *   get:
 *     summary: Lista todos os assistidos
 *     tags: [Assistidos]
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
 *         description: Termo de busca para filtrar assistidos por nome
 *       - in: query
 *         name: responsavelId
 *         schema:
 *           type: integer
 *         description: ID do responsável para filtrar assistidos
 *     responses:
 *       200:
 *         description: Lista de assistidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assistidos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Assistido'
 *                 total:
 *                   type: integer
 *                   description: Total de assistidos encontrados
 *                 page:
 *                   type: integer
 *                   description: Página atual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', autenticar, validateListarAssistidos, assistidoController.listarAssistidos);

/**
 * @openapi
 * /assistidos/{id}:
 *   get:
 *     summary: Obtém um assistido pelo ID
 *     tags: [Assistidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido a ser obtido
 *     responses:
 *       200:
 *         description: Assistido encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assistido'
 *       400:
 *         description: ID inválido
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Assistido não encontrado
 */
router.get('/:id', autenticar, validateAssistidoId, assistidoController.obterAssistidoPorId);

/**
 * @openapi
 * /assistidos:
 *   post:
 *     summary: Cria um novo assistido
 *     tags: [Assistidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoAssistido'
 *     responses:
 *       201:
 *         description: Assistido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assistido'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Responsável não encontrado
 */
router.post('/', autenticar, validateCreateAssistido, assistidoController.criarAssistido);

/**
 * @openapi
 * /assistidos/{id}:
 *   put:
 *     summary: Atualiza um assistido existente
 *     tags: [Assistidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido a ser atualizado
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
 *     responses:
 *       200:
 *         description: Assistido atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assistido'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Assistido ou responsável não encontrado
 */
router.put('/:id', autenticar, validateAssistidoId, validateUpdateAssistido, assistidoController.atualizarAssistido);

/**
 * @openapi
 * /assistidos/{id}:
 *   delete:
 *     summary: Remove um assistido
 *     tags: [Assistidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido a ser removido
 *     responses:
 *       204:
 *         description: Assistido removido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Assistido não encontrado
 */
router.delete('/:id', autenticar, validateAssistidoId, assistidoController.excluirAssistido);

// Rotas de documentos
router.post(
  '/:assistidoId/documentos',
  autenticar,
  upload.single('documento'),
  validateAdicionarDocumento,
  adicionarDocumento
);

router.get(
  '/:assistidoId/documentos',
  autenticar,
  validateListarDocumentos,
  listarDocumentos
);

router.get(
  '/:assistidoId/documentos/:documentoId',
  autenticar,
  validateObterDocumento,
  obterDocumento
);

router.put(
  '/:assistidoId/documentos/:documentoId',
  autenticar,
  validateAtualizarDocumento,
  atualizarDocumento
);

router.delete(
  '/:assistidoId/documentos/:documentoId',
  autenticar,
  validateExcluirDocumento,
  excluirDocumento
);

router.get(
  '/:assistidoId/documentos/:documentoId/download',
  autenticar,
  validateDownloadDocumento,
  downloadDocumento
);

// Rota de depuração
router.get('/debug/vinculos', autenticar, async (req, res) => {
  try {
    const { id } = req.usuario;
    
    // Verifica se o usuário é admin
    if (req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Apenas administradores podem acessar esta rota' });
    }
    
    // Consulta todos os registros da tabela responsaveis_assistidos
    const vinculos = await sequelize.query(
      'SELECT * FROM responsaveis_assistidos',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Consulta os usuários
    const usuarios = await sequelize.query(
      'SELECT id, nome, email, role FROM usuarios',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Consulta os assistidos
    const assistidos = await sequelize.query(
      'SELECT id, nome FROM assistidos',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Mapeia os resultados para incluir informações detalhadas
    const resultado = vinculos.map(vinculo => ({
      ...vinculo,
      usuario: usuarios.find(u => u.id === vinculo.id_usuario),
      assistido: assistidos.find(a => a.id === vinculo.id_assistido)
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