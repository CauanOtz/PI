import { requireAdmin } from '../middlewares/authorization.middleware.js';
import { validateIdParam } from '../middlewares/validators/param.validator.js';
// src/routes/presenca.routes.js
import { Router } from 'express';
import { 
  registrarPresenca, 
  listarPresencas, 
  obterPresenca, 
  atualizarPresenca,
  listarPresencasPorAtividade,
  listarHistoricoAssistido,
  registrarPresencasBulk
} from '../controllers/presenca.controller.js';
import Presenca from '../models/Presenca.model.js';
import { 
  validateRegistrarPresenca, 
  validateListarPresencas, 
  validateObterPresenca, 
  validateAtualizarPresenca,
  validatePresencasPorAula,
  validateHistoricoAssistido
} from '../middlewares/validators/presenca.validator.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Presenca:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da Presença
 *         idAssistido:
 *           type: integer
 *           description: ID do assistido
 *         idAtividade:
 *           type: integer
 *           description: ID da atividade
 *         status:
 *           type: string
 *           enum: [presente, falta, atraso, falta_justificada]
 *           description: Status da Presença
 *         data_registro:
 *           type: string
 *           format: date
 *           description: Data do registro da Presença
 *         observacao:
 *           type: string
 *           description: Observações sobre a Presença
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do registro
 *         assistido:
 *           $ref: '#/components/schemas/Assistido'
 *         atividade:
 *           $ref: '#/components/schemas/Atividade'
 *       example:
 *         id: 1
 *         idAssistido: 1
 *         idAtividade: 1
 *         status: "presente"
 *         data_registro: "2024-07-30"
 *         observacao: "Chegou atrasado 15 minutos"
 *         createdAt: "2024-07-30T14:30:00.000Z"
 *         updatedAt: "2024-07-30T14:30:00.000Z"
 *         assistido:
 *           id: 1
 *           nome: "João Silva"
 *         atividade:
 *           id: 1
 *           titulo: "Atividade de Matemática"
 *           data: "2024-07-30T19:00:00.000Z"
 */

/**
 * @openapi
 * tags:
 *   name: Presenças
 *   description: Gerenciamento de Presenças dos assistidos nas aulas
 */

/**
 * @openapi
 * /presencas:
 *   post:
 *     summary: Registra uma nova Presença
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idAssistido
 *               - idAtividade
 *               - status
 *             properties:
 *               idAssistido:
 *                 type: integer
 *                 description: ID do assistido
 *                 example: 1
 *               idAtividade:
 *                 type: integer
 *                 description: ID da atividade
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [presente, falta, atraso, falta_justificada]
 *                 description: Status da Presença
 *                 example: "presente"
 *               data_registro:
 *                 type: string
 *                 format: date
 *                 description: Data do registro (opcional, padrão é a data atual)
 *                 example: "2024-07-30"
 *               observacao:
 *                 type: string
 *                 description: Observações sobre a Presença (opcional)
 *                 example: "Chegou atrasado 15 minutos"
 *     responses:
 *       201:
 *         description: Presença registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresenca'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Assistido ou Aula não encontrado
 *       409:
 *         description: Já existe um registro de Presença para este assistido nesta data
 */
router.post('/', 
  autenticar, 
  validateRegistrarPresenca, 
  registrarPresenca
);

/**
 * @openapi
 * /presencas:
 *   get:
 *     summary: Lista todas as Presenças com filtros opcionais
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idAssistido
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do assistido
 *       - in: query
 *         name: idAtividade
 *         schema:
 *           type: integer
 *         description: Filtrar por ID da atividade
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [presente, falta, atraso, falta_justificada]
 *         description: Filtrar por status de Presença
 *     responses:
 *       200:
 *         description: Lista de Presenças
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: Parâmetros de filtro inválidos
 *       401:
 *         description: Não autorizado
 */
router.get('/', 
  autenticar, 
  validateListarPresencas, 
  listarPresencas
);

router.get('/atividades/:idAtividade', 
  autenticar, 
  validatePresencasPorAula,
  listarPresencasPorAtividade
);

router.get('/assistidos/:idAssistido', 
  autenticar, 
  validateHistoricoAssistido,
  listarHistoricoAssistido
);;

/**
 * @openapi
 * /presencas/atividades/{idAtividade}:
 *   get:
 *     summary: Lista as Presenças de uma atividade específica
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtividade
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         description: Data específica para filtrar as Presenças (opcional)
 *     responses:
 *       200:
 *         description: Lista de Presenças da atividade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: ID da atividade inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Atividade não encontrada
 */

/**
 * @openapi
 * /presencas/assistidos/{idAssistido}:
 *   get:
 *     summary: Lista o histórico de Presença de um assistido
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAssistido
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim para filtro (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Histórico de Presenças do assistido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: ID do assistido inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Assistido não encontrado
 */

/**
 * @openapi
 * /presencas/{id}:
 *   get:
 *     summary: Obtém um registro de Presença específico
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de Presença
 *     responses:
 *       200:
 *         description: Registro de Presença encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresenca'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Registro de Presença não encontrado
 */
router.get('/:id', validateIdParam('id'), 
  autenticar, 
  validateObterPresenca, 
  obterPresenca
);

/**
 * @openapi
 * /presencas/{id}:
 *   put:
 *     summary: Atualiza o status de uma Presença
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de Presença
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [presente, falta, atraso, falta_justificada]
 *                 description: Novo status da Presença
 *                 example: "atraso"
 *               data_registro:
 *                 type: string
 *                 format: date
 *                 description: Nova data do registro (opcional)
 *                 example: "2024-07-30"
 *               observacao:
 *                 type: string
 *                 description: Observações sobre a Presença (opcional)
 *                 example: "Chegou atrasado 15 minutos"
 *     responses:
 *       200:
 *         description: Presença atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresenca'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Registro de Presença não encontrado
 */
router.put('/:id', validateIdParam('id'),  autenticar, requireAdmin, validateIdParam('id'), 
  autenticar, 
  validateAtualizarPresenca, 
  atualizarPresenca
);

/**
 * @openapi
 * /presencas/{id}:
 *   delete:
 *     summary: Remove um registro de Presença
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de Presença a ser removido
 *     responses:
 *       204:
 *         description: Registro de Presença removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Registro de Presença não encontrado
 */
router.delete('/:id', validateIdParam('id'), 
  autenticar,
  validateObterPresenca,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Verifica se o registro de Presença existe
      const presenca = await Presenca.findByPk(id);
      
      if (!presenca) {
        return res.status(404).json({ message: 'Registro de Presença não encontrado' });
      }
      
      // Remove o registro de Presença
      await presenca.destroy();
      
      // Resposta sem conteúdo (204 - No Content) para operação de sucesso
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /presencas/bulk:
 *   post:
 *     summary: Registra múltiplas Presenças em uma única requisição
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               presencas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idAssistido
 *                     - idAtividade
 *                     - status
 *                   properties:
 *                     idAssistido:
 *                       type: integer
 *                       description: ID do assistido
 *                       example: 1
 *                     idAtividade:
 *                       type: integer
 *                       description: ID da atividade
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [presente, falta, atraso, falta_justificada]
 *                       description: Status da Presença
 *                       example: "presente"
 *                     data_registro:
 *                       type: string
 *                       format: date
 *                       description: Data do registro (opcional, padrão é a data atual)
 *                       example: "2024-07-30"
 *                     observacao:
 *                       type: string
 *                       description: Observações sobre a Presença (opcional)
 *                       example: "Chegou atrasado 15 minutos"
 *     responses:
 *       201:
 *         description: Presenças registradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Assistido ou Aula não encontrado
 *       409:
 *         description: Conflito ao registrar Presenças
 */
router.post('/bulk', autenticar, requireAdmin,
  autenticar,
  // opcional: validar corpo antes
  registrarPresencasBulk
);

export default router;