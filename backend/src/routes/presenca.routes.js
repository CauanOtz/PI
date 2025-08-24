// src/routes/presenca.routes.js
import { Router } from 'express';
import { 
  registrarPresenca, 
  listarPresencas, 
  obterPresenca, 
  atualizarPresenca,
  listarPresencasPorAula,
  listarHistoricoAluno
} from '../controllers/presenca.controller.js';
import Presenca from '../models/Presenca.model.js';
import { 
  validateRegistrarPresenca, 
  validateListarPresencas, 
  validateObterPresenca, 
  validateAtualizarPresenca,
  validatePresencasPorAula,
  validateHistoricoAluno
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
 *           description: ID da presença
 *         idAluno:
 *           type: integer
 *           description: ID do aluno
 *         idAula:
 *           type: integer
 *           description: ID da aula
 *         status:
 *           type: string
 *           enum: [presente, falta]
 *           description: Status da presença (presente ou falta)
 *         data_registro:
 *           type: string
 *           format: date
 *           description: Data do registro da presença
 *         observacao:
 *           type: string
 *           description: Observações sobre a presença
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do registro
 *         aluno:
 *           $ref: '#/components/schemas/Aluno'
 *         aula:
 *           $ref: '#/components/schemas/Aula'
 *       example:
 *         id: 1
 *         idAluno: 1
 *         idAula: 1
 *         status: "presente"
 *         data_registro: "2024-07-30"
 *         observacao: "Chegou atrasado 15 minutos"
 *         createdAt: "2024-07-30T14:30:00.000Z"
 *         updatedAt: "2024-07-30T14:30:00.000Z"
 *         aluno:
 *           id: 1
 *           nome: "João Silva"
 *         aula:
 *           id: 1
 *           titulo: "Aula de Matemática"
 *           data: "2024-07-30T19:00:00.000Z"
 */

/**
 * @openapi
 * tags:
 *   name: Presenças
 *   description: Gerenciamento de presenças dos alunos nas aulas
 */

/**
 * @openapi
 * /presencas:
 *   post:
 *     summary: Registra uma nova presença
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
 *               - idAluno
 *               - idAula
 *               - status
 *             properties:
 *               idAluno:
 *                 type: integer
 *                 description: ID do aluno
 *                 example: 1
 *               idAula:
 *                 type: integer
 *                 description: ID da aula
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [presente, falta, atraso, falta_justificada]
 *                 description: Status da presença
 *                 example: "presente"
 *               data_registro:
 *                 type: string
 *                 format: date
 *                 description: Data do registro (opcional, padrão é a data atual)
 *                 example: "2024-07-30"
 *               observacao:
 *                 type: string
 *                 description: Observações sobre a presença (opcional)
 *                 example: "Chegou atrasado 15 minutos"
 *     responses:
 *       201:
 *         description: Presença registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Presenca'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Aluno ou Aula não encontrado
 *       409:
 *         description: Já existe um registro de presença para este aluno nesta data
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
 *     summary: Lista todas as presenças com filtros opcionais
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idAluno
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do aluno
 *       - in: query
 *         name: idAula
 *         schema:
 *           type: integer
 *         description: Filtrar por ID da aula
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
 *         description: Filtrar por status de presença
 *     responses:
 *       200:
 *         description: Lista de presenças
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presenca'
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

/**
 * @openapi
 * /presencas/aulas/{idAula}:
 *   get:
 *     summary: Lista as presenças de uma aula específica
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAula
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da aula
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         description: Data específica para filtrar as presenças (opcional)
 *     responses:
 *       200:
 *         description: Lista de presenças da aula
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presenca'
 *       400:
 *         description: ID da aula inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Aula não encontrada
 */
router.get('/aulas/:idAula', 
  autenticar, 
  validatePresencasPorAula,
  listarPresencasPorAula
);

/**
 * @openapi
 * /presencas/alunos/{idAluno}:
 *   get:
 *     summary: Lista o histórico de presença de um aluno
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAluno
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
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
 *         description: Histórico de presenças do aluno
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presenca'
 *       400:
 *         description: ID do aluno inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Aluno não encontrado
 */
router.get('/alunos/:idAluno', 
  autenticar, 
  validateHistoricoAluno,
  listarHistoricoAluno
);

/**
 * @openapi
 * /presencas/{id}:
 *   get:
 *     summary: Obtém um registro de presença específico
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de presença
 *     responses:
 *       200:
 *         description: Registro de presença encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Presenca'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Registro de presença não encontrado
 */
router.get('/:id', 
  autenticar, 
  validateObterPresenca, 
  obterPresenca
);

/**
 * @openapi
 * /presencas/{id}:
 *   put:
 *     summary: Atualiza o status de uma presença
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de presença
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
 *                 description: Novo status da presença
 *                 example: "atraso"
 *               data_registro:
 *                 type: string
 *                 format: date
 *                 description: Nova data do registro (opcional)
 *                 example: "2024-07-30"
 *               observacao:
 *                 type: string
 *                 description: Observações sobre a presença (opcional)
 *                 example: "Chegou atrasado 15 minutos"
 *     responses:
 *       200:
 *         description: Presença atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Presenca'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Registro de presença não encontrado
 */
router.put('/:id', 
  autenticar, 
  validateAtualizarPresenca, 
  atualizarPresenca
);

/**
 * @openapi
 * /presencas/{id}:
 *   delete:
 *     summary: Remove um registro de presença
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de presença a ser removido
 *     responses:
 *       204:
 *         description: Registro de presença removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Registro de presença não encontrado
 */
router.delete('/:id', 
  autenticar,
  validateObterPresenca,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Verifica se o registro de presença existe
      const presenca = await Presenca.findByPk(id);
      
      if (!presenca) {
        return res.status(404).json({ message: 'Registro de presença não encontrado' });
      }
      
      // Remove o registro de presença
      await presenca.destroy();
      
      // Resposta sem conteúdo (204 - No Content) para operação de sucesso
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
