// src/controllers/presenca.controller.js
import { Op } from 'sequelize';
import Presenca from '../models/Presenca.model.js';
import Assistido from '../models/Assistido.model.js';
import Aula from '../models/Aula.model.js';
import { sequelize } from '../config/database.js';
import { PresencaDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';
import PresencaService from '../services/presenca.service.js';

// Funções auxiliares para respostas padronizadas
const sendError = (res, status, message) => {
  return res.status(status).json({ erros: [{ mensagem: message }] });
};

const sendSuccess = (res, status, data) => {
  return res.status(status).json(data);
};

const handleNotFound = (entity, res) => {
  return sendError(res, 404, `${entity} não encontrado(a)`);
};

// Função para formatar a data para YYYY-MM-DD
const formatDate = (date) => {
  if (!date) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  }
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * @openapi
 * tags:
 *   name: Presenças
 *   description: Gerenciamento de presenças dos assistidos nas aulas
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
 *               - idAssistido
 *               - idAula
 *               - status
 *             properties:
 *               idAssistido:
 *                 type: integer
 *                 description: ID do assistido
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
 *         description: Assistido ou Aula não encontrado
 *       409:
 *         description: Já existe um registro de presença para este assistido nesta data
 */
export const registrarPresenca = async (req, res, next) => {
  try {
    console.log("RegistrarPresenca - body:", req.body);
    const { idAssistido, idAula, status, observacao, data_registro } = req.body;

    // coerção explícita e normalização da data para evitar mismatch
    const idAssistidoNum = Number(idAssistido);
    const idAulaNum = Number(idAula);
    const dataFormatada = formatDate(data_registro);

    console.log("Normalized inputs:", { 
      idAssistidoRaw: idAssistido, 
      idAulaRaw: idAula, 
      idAssistidoNum, 
      idAulaNum, 
      dataFormatada, 
      status, 
      observacao, 
      types: { 
        typeofIdAssistido: typeof idAssistido, 
        typeofIdAula: typeof idAula 
      } 
    });

    const result = await PresencaService.registrarPresenca({ 
      idAssistido: idAssistidoNum, 
      idAula: idAulaNum, 
      status, 
      observacao, 
      data_registro: dataFormatada 
    });

    if (result && result.notFound) {
      return handleNotFound(result.notFound, res);
    }
    if (!result.created) {
      return sendError(res, 409, 'Já existe um registro de presença para este assistido nesta data');
    }
    return created(res, PresencaDTO.from(result.presenca));
  } catch (createErr) {
    if (createErr && createErr.name === "SequelizeUniqueConstraintError") {
      return sendError(res, 409, "Já existe um registro de presença para este assistido nesta data");
    }
    if (createErr && createErr.name === 'SequelizeForeignKeyConstraintError') {
      const constraint = createErr.constraint || '';
      if (/id_assistido/i.test(constraint)) return handleNotFound('Assistido', res);
      if (/id_aula/i.test(constraint)) return handleNotFound('Aula', res);
      return sendError(res, 404, 'Assistido ou Aula não encontrado(a)');
    }
    throw createErr;
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
 *         name: idAssistido
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do assistido
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
    const { idAssistido, idAula, dataInicio, dataFim, status } = req.query;
    
    const whereClause = {};
    
    if (idAssistido) whereClause.idAssistido = idAssistido;
    if (idAula) whereClause.idAula = idAula;
    if (status) whereClause.status = status;
    
    if (dataInicio || dataFim) {
      whereClause.data_registro = {};
      if (dataInicio) whereClause.data_registro[Op.gte] = dataInicio;
      if (dataFim) whereClause.data_registro[Op.lte] = dataFim;
    }
    
    const presencas = await PresencaService.listAll({ idAssistido, idAula, dataInicio, dataFim, status });
    { const lista = PresencaDTO.list(presencas); return ok(res, { presencas: lista }); }
  } catch (error) {
    next(error);
  }
};

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
export const listarPresencasPorAula = async (req, res, next) => {
  try {
    const { idAula } = req.params;
    const { data } = req.query;
    
    const result = await PresencaService.listByAula(idAula, { data });
    if (!result) return handleNotFound('Aula', res);
    const { aula, presencas } = result;
    { const lista = PresencaDTO.list(presencas); return ok(res, { aula: { id: aula.id, titulo: aula.titulo, data: aula.data }, presencas: lista }); }
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /presencas/assistidos/{idAssistido}:
 *   get:
 *     summary: Lista o histórico de presença de um assistido
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
 *         description: Histórico de presenças do assistido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presenca'
 *       400:
 *         description: ID do assistido inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Assistido não encontrado
 */
export const listarHistoricoAssistido = async (req, res, next) => {
  try {
    const { idAssistido } = req.params;
    const { dataInicio, dataFim } = req.query;
    
    const result = await PresencaService.listByAssistido(idAssistido, { dataInicio: formatDate(dataInicio), dataFim: formatDate(dataFim) });
    if (!result) return handleNotFound('Assistido', res);
    const { assistido, presencas } = result;
    { const hist = PresencaDTO.list(presencas); return ok(res, { assistido: { id: assistido.id, nome: assistido.nome }, historico: hist }); }
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
    
    const presenca = await PresencaService.getById(id);
    if (!presenca) return handleNotFound('Registro de presença', res);
    return ok(res, PresencaDTO.from(presenca));
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
    
    const result = await PresencaService.update(id, { status, data_registro: data_registro ? formatDate(data_registro) : undefined, observacao });
    if (result === null) return handleNotFound('Registro de presença', res);
    if (result && result.conflict) return res.status(409).json({ mensagem: 'Já existe presença para este assistido nesta aula e data' });
    return ok(res, PresencaDTO.from(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /presencas/bulk:
 *   post:
 *     summary: Registra múltiplas presenças em uma única requisição
 *     tags: [Presenças]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - idAssistido
 *                 - idAula
 *                 - status
 *               properties:
 *                 idAssistido:
 *                   type: integer
 *                   description: ID do assistido
 *                   example: 1
 *                 idAula:
 *                   type: integer
 *                   description: ID da aula
 *                   example: 1
 *                 status:
 *                   type: string
 *                   enum: [presente, falta, atraso, falta_justificada]
 *                   description: Status da presença
 *                   example: "presente"
 *                 data_registro:
 *                   type: string
 *                   format: date
 *                   description: Data do registro (opcional, padrão é a data atual)
 *                   example: "2024-07-30"
 *                 observacao:
 *                   type: string
 *                   description: Observações sobre a presença (opcional)
 *                   example: "Chegou atrasado 15 minutos"
 *     responses:
 *       200:
 *         description: Presenças registradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       presenca:
 *                         $ref: '#/components/schemas/Presenca'
 *                       created:
 *                         type: boolean
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       409:
 *         description: Conflito de registro único ao inserir presenças
 */
export const registrarPresencasBulk = async (req, res, next) => {
  try {
    const itemsRaw = Array.isArray(req.body) ? req.body : [];
    if (itemsRaw.length === 0) return sendError(res, 400, "Nenhum item fornecido");

    const allowedStatus = new Set(['presente', 'falta', 'atraso', 'falta_justificada']);
    const dedupeMap = new Map();
    for (const it of itemsRaw) {
      const idAssistido = Number(it.idAssistido);
      const idAula = Number(it.idAula);
      const data_registro = formatDate(it.data_registro);
      const status = String(it.status ?? '').trim();
      if (!idAssistido || !idAula) continue;
      const normalized = { 
        idAssistido, 
        idAula, 
        status: allowedStatus.has(status) ? status : 'presente', 
        data_registro, 
        observacao: it.observacao ?? null 
      };
      dedupeMap.set(`${idAssistido}|${idAula}|${data_registro}`, normalized);
    }
    const items = Array.from(dedupeMap.values());
    if (items.length === 0) return sendError(res, 400, "Nenhum item válido para inserir");

    const results = await PresencaService.bulkRegister(items);
    const mapped = results.map((r) => ({ presenca: r.presenca ? PresencaDTO.from(r.presenca) : null }));
    return ok(res, { resultados: mapped });
  } catch (err) {
    console.error('registrarPresencasBulk error:', err);
    if (err && err.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 409, 'Conflito de registro único ao inserir presenças');
    }
    next(err);
  }
};