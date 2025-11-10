// src/controllers/presenca.controller.js
import { Op } from 'sequelize';
import Presenca from '../models/Presenca.model.js';
import Assistido from '../models/Assistido.model.js';
import Atividade from '../models/Atividade.model.js';
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
 *   description: Gerenciamento de presenças dos assistidos nas atividades
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
 *         description: Assistido ou Atividade não encontrado
 *       409:
 *         description: Já existe um registro de presença para este assistido nesta data
 */
export const registrarPresenca = async (req, res, next) => {
  try {
    console.log("RegistrarPresenca - body:", req.body);
    const { idAssistido, idAtividade, status, observacao, data_registro } = req.body;

    // coerção explícita e normalização da data para evitar mismatch
    const idAssistidoNum = Number(idAssistido);
    const idAtividadeNum = Number(idAtividade);
    const dataFormatada = formatDate(data_registro);

    console.log("Normalized inputs:", { 
      idAssistidoRaw: idAssistido, 
      idAtividadeRaw: idAtividade, 
      idAssistidoNum, 
      idAtividadeNum, 
      dataFormatada, 
      status, 
      observacao, 
      types: { 
        typeofIdAssistido: typeof idAssistido, 
        typeofIdAtividade: typeof idAtividade 
      } 
    });

    const result = await PresencaService.registrarPresenca({ 
      idAssistido: idAssistidoNum, 
      idAtividade: idAtividadeNum, 
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
      if (/id_atividade/i.test(constraint)) return handleNotFound('Atividade', res);
      return sendError(res, 404, 'Assistido ou Atividade não encontrado(a)');
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
    const { idAssistido, idAtividade, dataInicio, dataFim, status } = req.query;
    
    const whereClause = {};
    
    if (idAssistido) whereClause.idAssistido = idAssistido;
    if (idAtividade) whereClause.idAtividade = idAtividade;
    if (status) whereClause.status = status;
    
    if (dataInicio || dataFim) {
      whereClause.data_registro = {};
      if (dataInicio) whereClause.data_registro[Op.gte] = dataInicio;
      if (dataFim) whereClause.data_registro[Op.lte] = dataFim;
    }
    
    const presencas = await PresencaService.listAll({ idAssistido, idAtividade, dataInicio, dataFim, status });
    { const lista = PresencaDTO.list(presencas); return ok(res, { presencas: lista }); }
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /presencas/atividades/{idAtividade}:
 *   get:
 *     summary: Lista as presenças de uma atividade específica
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
 *         description: Data específica para filtrar as presenças (opcional)
 *     responses:
 *       200:
 *         description: Lista de presenças da atividade
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presenca'
 *       400:
 *         description: ID da atividade inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Atividade não encontrada
 */
export const listarPresencasPorAtividade = async (req, res, next) => {
  try {
    const { idAtividade } = req.params;
    const { data } = req.query;
    
    const result = await PresencaService.listByAtividade(idAtividade, { data });
    if (!result) return handleNotFound('Atividade', res);
    const { atividade, presencas } = result;
    { const lista = PresencaDTO.list(presencas); return ok(res, { atividade: { id: atividade.id, titulo: atividade.titulo, data: atividade.data }, presencas: lista }); }
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
    if (result && result.conflict) return res.status(409).json({ mensagem: 'Já existe presença para este assistido nesta atividade e data' });
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
 *                 idAtividade:
 *                   type: integer
 *                   description: ID da atividade
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
      const idAtividade = Number(it.idAtividade);
      const data_registro = formatDate(it.data_registro);
      const status = String(it.status ?? '').trim();
      if (!idAssistido || !idAtividade) continue;
      const normalized = { 
        idAssistido, 
        idAtividade, 
        status: allowedStatus.has(status) ? status : 'presente', 
        data_registro, 
        observacao: it.observacao ?? null 
      };
      dedupeMap.set(`${idAssistido}|${idAtividade}|${data_registro}`, normalized);
    }
    const items = Array.from(dedupeMap.values());
    if (items.length === 0) return sendError(res, 400, "Nenhum item válido para inserir");

    const results = await PresencaService.bulkRegister(items);
    const mapped = results.map((r) => ({
      sucesso: !r.error,
      dados: r.presenca ? PresencaDTO.from(r.presenca) : null,
      erro: r.error ? { mensagem: r.error } : null
    }));
    
    // Se houver algum erro de registro duplicado, retornar 409
    if (results.some(r => r.error && (
      r.error.includes('existe um registro') || 
      r.error.includes('duplicado')
    ))) {
      return res.status(409).json({
        sucesso: false,
        erro: { mensagem: "Alguns registros não puderam ser criados por já existirem" },
        resultados: mapped
      });
    }

    return ok(res, { resultados: mapped });
  } catch (err) {
    console.error('registrarPresencasBulk error:', err);
    if (err && err.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 409, 'Conflito de registro único ao inserir presenças');
    }
    next(err);
  }
};