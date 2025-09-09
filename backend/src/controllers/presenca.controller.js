// src/controllers/presenca.controller.js
import { Op } from 'sequelize';
import Presenca from '../models/Presenca.model.js';
import Aluno from '../models/Aluno.model.js';
import Aula from '../models/Aula.model.js';

// Funções auxiliares para respostas padronizadas
const sendError = (res, status, message) => {
  return res.status(status).json({ message });
};

const sendSuccess = (res, status, data) => {
  return res.status(status).json(data);
};

const handleNotFound = (entity, res) => {
  return sendError(res, 404, `${entity} não encontrado(a)`);
};

// Função para formatar a data para YYYY-MM-DD
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

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
export const registrarPresenca = async (req, res, next) => {
  try {
    const { idAluno, idAula, status, observacao, data_registro } = req.body;
    
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(idAluno);
    if (!aluno) return handleNotFound('Aluno', res);
    
    // Verifica se a aula existe
    const aula = await Aula.findByPk(idAula);
    if (!aula) return handleNotFound('Aula', res);
    
    // Verifica se já existe um registro de presença para este aluno nesta data
    const dataFormatada = formatDate(data_registro || new Date());
    
    const presencaExistente = await Presenca.findOne({
      where: { idAluno, data_registro: dataFormatada, idAula }
    });
    
    if (presencaExistente) {
      return sendError(res, 409, 'Já existe um registro de presença para este aluno nesta data');
    }
    
    // Cria o registro de presença
    const presenca = await Presenca.create({
      idAluno,
      idAula,
      status,
      observacao,
      data_registro: dataFormatada
    });
    
    return sendSuccess(res, 201, presenca);
  } catch (error) {
    next(error);
  }
};

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
export const listarPresencas = async (req, res, next) => {
  try {
    const { idAluno, idAula, dataInicio, dataFim, status } = req.query;
    
    const whereClause = {};
    
    if (idAluno) whereClause.idAluno = idAluno;
    if (idAula) whereClause.idAula = idAula;
    if (status) whereClause.status = status;
    
    // Filtro por data
    if (dataInicio || dataFim) {
      whereClause.data_registro = {};
      if (dataInicio) whereClause.data_registro[Op.gte] = dataInicio;
      if (dataFim) whereClause.data_registro[Op.lte] = dataFim;
    }
    
    const presencas = await Presenca.findAll({
      where: whereClause,
      include: [
        { model: Aluno, as: 'aluno', attributes: ['id', 'nome'] },
        { model: Aula, as: 'aula', attributes: ['id', 'nome'] }
      ],
      order: [['data_registro', 'DESC']]
    });
    
    return sendSuccess(res, 200, presencas);
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /aulas/{idAula}/presencas:
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
export const listarPresencasPorAula = async (req, res, next) => {
  try {
    const { idAula } = req.params;
    const { data } = req.query;
    
    // Verifica se a aula existe
    const aula = await Aula.findByPk(idAula);
    if (!aula) return handleNotFound('Aula', res);
    
    const whereClause = { idAula };
    
    // Filtro por data se fornecido
    if (data) {
      whereClause.data_registro = formatDate(data);
    }
    
    const presencas = await Presenca.findAll({
      where: whereClause,
      include: [
        { 
          model: Aluno, 
          as: 'aluno', 
          attributes: ['id', 'nome'] 
        }
      ],
      order: [[ 'aluno', 'nome', 'ASC' ]]
    });
    
    return sendSuccess(res, 200, {
      aula: {
        id: aula.id,
        titulo: aula.titulo,
        data: aula.data
      },
      presencas
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /alunos/{idAluno}/presencas:
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
export const listarHistoricoAluno = async (req, res, next) => {
  try {
    const { idAluno } = req.params;
    const { dataInicio, dataFim } = req.query;
    
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(idAluno);
    if (!aluno) return handleNotFound('Aluno', res);
    
    const whereClause = { idAluno };
    
    // Filtro por data
    if (dataInicio || dataFim) {
      whereClause.data_registro = {};
      if (dataInicio) whereClause.data_registro[Op.gte] = formatDate(dataInicio);
      if (dataFim) whereClause.data_registro[Op.lte] = formatDate(dataFim);
    }
    
    const presencas = await Presenca.findAll({
      where: whereClause,
      include: [
        { 
          model: Aula, 
          as: 'aula', 
          attributes: ['id', 'titulo', 'data'] 
        }
      ],
      order: [['data_registro', 'DESC']]
    });
    
    return sendSuccess(res, 200, {
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.id // Substituído por ID, já que matrícula não existe
      },
      historico: presencas
    });
  } catch (error) {
    next(error);
  }
};

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
export const obterPresenca = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const presenca = await Presenca.findByPk(id, {
      include: [
        { model: Aluno, as: 'aluno', attributes: ['id', 'nome'] },
        { model: Aula, as: 'aula', attributes: ['id', 'titulo', 'data'] }
      ]
    });
    
    if (!presenca) return handleNotFound('Registro de presença', res);
    
    return sendSuccess(res, 200, presenca);
    
    res.json(presenca);
  } catch (error) {
    next(error);
  }
};

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
export const atualizarPresenca = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, data_registro, observacao } = req.body;
    
    // Verifica se o registro de presença existe
    const presenca = await Presenca.findByPk(id, {
      include: [
        { model: Aluno, as: 'aluno', attributes: ['id', 'nome'] },
        { model: Aula, as: 'aula', attributes: ['id', 'titulo', 'data'] }
      ]
    });
    
    if (!presenca) return handleNotFound('Registro de presença', res);
    
    // Atualiza os campos fornecidos
    const camposAtualizados = {};
    if (status) camposAtualizados.status = status;
    if (data_registro) camposAtualizados.data_registro = formatDate(data_registro);
    if (observacao !== undefined) camposAtualizados.observacao = observacao;
    
    // Atualiza apenas os campos que foram fornecidos
    await presenca.update(camposAtualizados);
    
    // Recarrega o registro para garantir que temos os dados mais recentes
    const presencaAtualizada = await presenca.reload();
    
    return sendSuccess(res, 200, presencaAtualizada);
  } catch (error) {
    next(error);
  }
};
