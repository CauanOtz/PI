import { Router } from 'express';
import {
  criarNotificacao,
  listarNotificacoes,
  obterNotificacao,
  atualizarNotificacao,
  excluirNotificacao,
  listarNotificacoesUsuario,
  marcarComoLida,
  enviarNotificacao,
  listarUsuariosNotificacao
} from '../controllers/notificacao.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import {
  validateCriarNotificacao,
  validateEnviarNotificacao,
  validateListarNotificacoes,
  validateNotificacaoId,
  validateUsuarioCpf
} from '../middlewares/validators/notificacao.validator.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Notificações
 *     description: Gerenciamento de notificações do sistema
 */

/**
 * @openapi
 * /notificacoes:
 *   post:
 *     summary: Cria uma nova notificação
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - mensagem
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Aviso Importante
 *               mensagem:
 *                 type: string
 *                 example: Esta é uma mensagem de notificação importante.
 *               tipo:
 *                 type: string
 *                 enum: [info, alerta, urgente, sistema]
 *                 default: info
 *                 example: info
 *               dataExpiracao:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-31T23:59:59.000Z
 *     responses:
 *       201:
 *         description: Notificação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notificacao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  autenticar,
  validateCriarNotificacao,
  criarNotificacao
);

/**
 * @openapi
 * /notificacoes:
 *   get:
 *     summary: Lista todas as notificações (apenas admin)
 *     tags: [Notificações]
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
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [info, alerta, urgente, sistema]
 *         description: Filtrar por tipo de notificação
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notificacoes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notificacao'
 *                 paginacao:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrevious:
 *                       type: boolean
 *                       example: false
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  autenticar,
  validateListarNotificacoes,
  listarNotificacoes
);

/**
 * @openapi
 * /notificacoes/{id}:
 *   get:
 *     summary: Obtém uma notificação específica
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notificacao'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Notificação não encontrada
 */
router.get(
  '/:id',
  autenticar,
  validateNotificacaoId,
  obterNotificacao
);

/**
 * @openapi
 * /notificacoes/{id}:
 *   put:
 *     summary: Atualiza uma notificação
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da notificação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Título Atualizado
 *               mensagem:
 *                 type: string
 *                 example: Mensagem atualizada
 *               tipo:
 *                 type: string
 *                 enum: [info, alerta, urgente, sistema]
 *                 example: alerta
 *               dataExpiracao:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-31T23:59:59.000Z
 *     responses:
 *       200:
 *         description: Notificação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notificacao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Notificação não encontrada
 */
router.put(
  '/:id',
  autenticar,
  validateNotificacaoId,
  validateCriarNotificacao,
  atualizarNotificacao
);

/**
 * @openapi
 * /notificacoes/{id}:
 *   delete:
 *     summary: Exclui uma notificação
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Notificação excluída com sucesso
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Notificação não encontrada
 */
router.delete(
  '/:id',
  autenticar,
  validateNotificacaoId,
  excluirNotificacao
);

/**
 * @openapi
 * /notificacoes/{idNotificacao}/usuarios:
 *   get:
 *     summary: Lista usuários que receberam uma notificação específica
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idNotificacao
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da notificação
 *       - in: query
 *         name: lida
 *         schema:
 *           type: boolean
 *         description: Filtrar por notificações lidas/não lidas
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
 *         description: Lista de usuários que receberam a notificação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UsuarioNotificacao'
 *                 paginacao:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrevious:
 *                       type: boolean
 *                       example: false
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Notificação não encontrada
 */
router.get(
  '/:idNotificacao/usuarios',
  autenticar,
  validateNotificacaoId,
  listarUsuariosNotificacao
);

/**
 * @openapi
 * /notificacoes/usuarios/{cpfUsuario}/notificacoes:
 *   get:
 *     summary: Lista notificações de um usuário específico
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpfUsuario
 *         required: true
 *         schema:
 *           type: string
 *           format: cpf
 *         description: CPF do usuário (formato 000.000.000-00)
 *       - in: query
 *         name: lida
 *         schema:
 *           type: boolean
 *         description: Filtrar por notificações lidas/não lidas
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
 *         description: Lista de notificações do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notificacoes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notificacao'
 *                 paginacao:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrevious:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: CPF inválido
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Usuário não encontrado
 */
router.get(
  '/usuarios/:cpfUsuario/notificacoes',
  autenticar,
  validateUsuarioCpf,
  listarNotificacoesUsuario
);

router.get(
  '/minhas',
  autenticar,
  (req, res, next) => {
    req.params.cpfUsuario = req.usuario.cpf;
    return listarNotificacoesUsuario(req, res, next);
  }
);

/**
 * @openapi
 * /notificacoes/{idNotificacao}/marcar-lida:
 *   post:
 *     summary: Marca uma notificação como lida
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idNotificacao
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Notificação marcada como lida
 *                 notificacao:
 *                   $ref: '#/components/schemas/Notificacao'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Notificação não encontrada para este usuário
 */
router.post(
  '/:idNotificacao/marcar-lida',
  autenticar,
  validateNotificacaoId,
  marcarComoLida
);

/**
 * @openapi
 * /notificacoes/{idNotificacao}/enviar:
 *   post:
 *     summary: Envia/associa uma notificação a um ou mais usuários
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idNotificacao
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da notificação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarios
 *             properties:
 *               usuarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: cpf
 *                   example: "123.456.789-09"
 *                 description: Lista de CPFs dos usuários que receberão a notificação
 *     responses:
 *       201:
 *         description: Notificação enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Notificação enviada com sucesso
 *                 totalEnviadas:
 *                   type: integer
 *                   example: 5
 *                 novasAssociacoes:
 *                   type: integer
 *                   example: 3
 *                 associacoesExistentes:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Dados inválidos ou usuários não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Alguns usuários não foram encontrados
 *                 usuariosNaoEncontrados:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "987.654.321-00"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Notificação não encontrada
 */
router.post(
  '/:idNotificacao/enviar',
  autenticar,
  validateNotificacaoId,
  validateEnviarNotificacao,
  enviarNotificacao
);

export default router;
