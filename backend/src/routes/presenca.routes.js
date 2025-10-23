import { requireAdmin } from '../middlewares/authorization.middleware.js';
import { validateIdParam } from '../middlewares/validators/param.validator.js';
// src/routes/presenca.routes.js
import { Router } from 'express';
import { 
  registrarPresenca, 
  listarPresencas, 
  obterPresenca, 
  atualizarPresenca,
  listarPresencasPorAula,
  listarHistoricoAluno,
  registrarPresencasBulk
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
 *           description: ID da presenÃ§a
 *         idAluno:
 *           type: integer
 *           description: ID do aluno
 *         idAula:
 *           type: integer
 *           description: ID da aula
 *         status:
 *           type: string
 *           enum: [presente, falta]
 *           description: Status da presenÃ§a (presente ou falta)
 *         data_registro:
 *           type: string
 *           format: date
 *           description: Data do registro da presenÃ§a
 *         observacao:
 *           type: string
 *           description: ObservaÃ§Ãµes sobre a presenÃ§a
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criaÃ§Ã£o do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da Ãºltima atualizaÃ§Ã£o do registro
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
 *           nome: "JoÃ£o Silva"
 *         aula:
 *           id: 1
 *           titulo: "Aula de MatemÃ¡tica"
 *           data: "2024-07-30T19:00:00.000Z"
 */

/**
 * @openapi
 * tags:
 *   name: PresenÃ§as
 *   description: Gerenciamento de presenÃ§as dos alunos nas aulas
 */

/**
 * @openapi
 * /presencas:
 *   post:
 *     summary: Registra uma nova presenÃ§a
 *     tags: [PresenÃ§as]
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
 *                 description: Status da presenÃ§a
 *                 example: "presente"
 *               data_registro:
 *                 type: string
 *                 format: date
 *                 description: Data do registro (opcional, padrÃ£o Ã© a data atual)
 *                 example: "2024-07-30"
 *               observacao:
 *                 type: string
 *                 description: ObservaÃ§Ãµes sobre a presenÃ§a (opcional)
 *                 example: "Chegou atrasado 15 minutos"
 *     responses:
 *       201:
 *         description: PresenÃ§a registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresenca'
 *       400:
 *         description: Dados invÃ¡lidos
 *       401:
 *         description: NÃ£o autorizado
 *       404:
 *         description: Aluno ou Aula nÃ£o encontrado
 *       409:
 *         description: JÃ¡ existe um registro de presenÃ§a para este aluno nesta data
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
 *     summary: Lista todas as presenÃ§as com filtros opcionais
 *     tags: [PresenÃ§as]
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
 *         description: Data de inÃ­cio para filtro (YYYY-MM-DD)
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
 *         description: Filtrar por status de presenÃ§a
 *     responses:
 *       200:
 *         description: Lista de presenÃ§as
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: ParÃ¢metros de filtro invÃ¡lidos
 *       401:
 *         description: NÃ£o autorizado
 */
router.get('/', 
  autenticar, 
  validateListarPresencas, 
  listarPresencas
);

router.get('/aulas/:idAula', 
  autenticar, 
  validatePresencasPorAula,
  listarPresencasPorAula
);

router.get('/alunos/:idAluno', 
  autenticar, 
  validateHistoricoAluno,
  listarHistoricoAluno
);

router.get('/aulas/:idAula', 
  autenticar, 
  validatePresencasPorAula,
  listarPresencasPorAula
);

router.get('/alunos/:idAluno', 
  autenticar, 
  validateHistoricoAluno,
  listarHistoricoAluno
);

/**
 * @openapi
 * /presencas/aulas/{idAula}:
 *   get:
 *     summary: Lista as presenÃ§as de uma aula especÃ­fica
 *     tags: [PresenÃ§as]
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
 *         description: Data especÃ­fica para filtrar as presenÃ§as (opcional)
 *     responses:
 *       200:
 *         description: Lista de presenÃ§as da aula
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: ID da aula invÃ¡lido
 *       401:
 *         description: NÃ£o autorizado
 *       404:
 *         description: Aula nÃ£o encontrada
 */

/**
 * @openapi
 * /presencas/alunos/{idAluno}:
 *   get:
 *     summary: Lista o histÃ³rico de presenÃ§a de um aluno
 *     tags: [PresenÃ§as]
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
 *         description: Data de inÃ­cio para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim para filtro (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: HistÃ³rico de presenÃ§as do aluno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: ID do aluno invÃ¡lido
 *       401:
 *         description: NÃ£o autorizado
 *       404:
 *         description: Aluno nÃ£o encontrado
 */

/**
 * @openapi
 * /presencas/{id}:
 *   get:
 *     summary: ObtÃ©m um registro de presenÃ§a especÃ­fico
 *     tags: [PresenÃ§as]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de presenÃ§a
 *     responses:
 *       200:
 *         description: Registro de presenÃ§a encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresenca'
 *       400:
 *         description: ID invÃ¡lido
 *       401:
 *         description: NÃ£o autorizado
 *       404:
 *         description: Registro de presenÃ§a nÃ£o encontrado
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
 *     summary: Atualiza o status de uma presenÃ§a
 *     tags: [PresenÃ§as]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de presenÃ§a
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
 *                 description: Novo status da presenÃ§a
 *                 example: "atraso"
 *               data_registro:
 *                 type: string
 *                 format: date
 *                 description: Nova data do registro (opcional)
 *                 example: "2024-07-30"
 *               observacao:
 *                 type: string
 *                 description: ObservaÃ§Ãµes sobre a presenÃ§a (opcional)
 *                 example: "Chegou atrasado 15 minutos"
 *     responses:
 *       200:
 *         description: PresenÃ§a atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresenca'
 *       400:
 *         description: Dados invÃ¡lidos
 *       401:
 *         description: NÃ£o autorizado
 *       404:
 *         description: Registro de presenÃ§a nÃ£o encontrado
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
 *     summary: Remove um registro de presenÃ§a
 *     tags: [PresenÃ§as]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de presenÃ§a a ser removido
 *     responses:
 *       204:
 *         description: Registro de presenÃ§a removido com sucesso
 *       401:
 *         description: NÃ£o autorizado
 *       404:
 *         description: Registro de presenÃ§a nÃ£o encontrado
 */
router.delete('/:id', validateIdParam('id'), 
  autenticar,
  validateObterPresenca,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Verifica se o registro de presenÃ§a existe
      const presenca = await Presenca.findByPk(id);
      
      if (!presenca) {
        return res.status(404).json({ message: 'Registro de presenÃ§a nÃ£o encontrado' });
      }
      
      // Remove o registro de presenÃ§a
      await presenca.destroy();
      
      // Resposta sem conteÃºdo (204 - No Content) para operaÃ§Ã£o de sucesso
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
 *     summary: Registra mÃºltiplas presenÃ§as em uma Ãºnica requisiÃ§Ã£o
 *     tags: [PresenÃ§as]
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
 *                     - idAluno
 *                     - idAula
 *                     - status
 *                   properties:
 *                     idAluno:
 *                       type: integer
 *                       description: ID do aluno
 *                       example: 1
 *                     idAula:
 *                       type: integer
 *                       description: ID da aula
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [presente, falta, atraso, falta_justificada]
 *                       description: Status da presenÃ§a
 *                       example: "presente"
 *                     data_registro:
 *                       type: string
 *                       format: date
 *                       description: Data do registro (opcional, padrÃ£o Ã© a data atual)
 *                       example: "2024-07-30"
 *                     observacao:
 *                       type: string
 *                       description: ObservaÃ§Ãµes sobre a presenÃ§a (opcional)
 *                       example: "Chegou atrasado 15 minutos"
 *     responses:
 *       201:
 *         description: PresenÃ§as registradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessPresencas'
 *       400:
 *         description: Dados invÃ¡lidos
 *       401:
 *         description: NÃ£o autorizado
 *       404:
 *         description: Aluno ou Aula nÃ£o encontrado
 *       409:
 *         description: Conflito ao registrar presenÃ§as
 */
router.post('/bulk', autenticar, requireAdmin,
  autenticar,
  // opcional: validar corpo antes
  registrarPresencasBulk
);

export default router;



