// src/controllers/presenca.controller.js
import { Op } from 'sequelize';
import Presenca from '../models/Presenca.model.js';
import Aluno from '../models/Aluno.model.js';
import Aula from '../models/Aula.model.js';
import { sequelize } from '../config/database.js';
import { PresencaDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';

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
  // aceita string "YYYY-MM-DD" sem conversão
  if (!date) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  }
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // se receber Date ou outra string, converte para data local (evita deslocamento UTC)
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
    console.log("RegistrarPresenca - body:", req.body);
    const { idAluno, idAula, status, observacao, data_registro } = req.body;

    // coerção explícita e normalização da data para evitar mismatch (string vs number / timezone)
    const idAlunoNum = Number(idAluno);
    const idAulaNum = Number(idAula);
    const dataFormatada = (function(d) {
      if (!d) {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      }
      if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const dt = d instanceof Date ? d : new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    })(data_registro);

    console.log("Normalized inputs:", { idAlunoRaw: idAluno, idAulaRaw: idAula, idAlunoNum, idAulaNum, dataFormatada, status, observacao, types: { typeofIdAluno: typeof idAluno, typeofIdAula: typeof idAula } });

    const where = { idAluno: idAlunoNum, idAula: idAulaNum, data_registro: dataFormatada };
    const existing = await Presenca.findAll({ where });
    console.log("Presenca.findAll result count:", existing.length, existing.map(e => ({ id: e.id, idAluno: e.idAluno, idAula: e.idAula, data_registro: e.data_registro, createdAt: e.createdAt })));

    // then do atomic create
    const result = await sequelize.transaction(async (t) => {
      const [presenca, created] = await Presenca.findOrCreate({
        where,
        defaults: { status, observacao },
        transaction: t
      });
      return { presenca, created };
    });

    if (!result.created) {
      return sendError(res, 409, 'Já existe um registro de presença para este aluno nesta data');
    }
    return created(res, PresencaDTO.from(result.presenca));
  } catch (createErr) {
    if (createErr && createErr.name === "SequelizeUniqueConstraintError") {
      return sendError(res, 409, "Já existe um registro de presença para este aluno nesta data");
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
        { model: Aula, as: 'aula', attributes: ['id', 'titulo'] }
      ],
      order: [['data_registro', 'DESC']]
    });
    
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
    
    { const lista = PresencaDTO.list(presencas); return ok(res, { aula: { id: aula.id, titulo: aula.titulo, data: aula.data }, presencas: lista }); }
  } catch (error) {
    next(error);
  }
};

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
    
    { const hist = PresencaDTO.list(presencas); return ok(res, { aluno: { id: aluno.id, nome: aluno.nome, matricula: aluno.id }, historico: hist }); }
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
    
    return ok(res, PresencaDTO.from(presenca));
    
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

    // Evitar colis�o com constraint �nica ao alterar data_registro
    if (camposAtualizados.data_registro) {
      const colisao = await Presenca.findOne({
        where: {
          idAluno: presenca.idAluno,
          idAula: presenca.idAula,
          data_registro: camposAtualizados.data_registro,
          id: { [Op.ne]: presenca.id },
        },
      });
      if (colisao) {
        return res.status(409).json({ mensagem: 'J� existe presen�a para este aluno nesta aula e data' });
      }
    }
    
    // Atualiza apenas os campos que foram fornecidos
    await presenca.update(camposAtualizados);
    
    // Recarrega o registro para garantir que temos os dados mais recentes
    const presencaAtualizada = await presenca.reload();
    
    return ok(res, PresencaDTO.from(presencaAtualizada));
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
 *                 - idAluno
 *                 - idAula
 *                 - status
 *               properties:
 *                 idAluno:
 *                   type: integer
 *                   description: ID do aluno
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

    // Normaliza e valida itens, cria chave composta para deduplicar
    const allowedStatus = new Set(['presente', 'falta', 'atraso', 'falta_justificada']);
    const dedupeMap = new Map(); // key => normalized item

    for (const it of itemsRaw) {
      const idAluno = Number(it.idAluno);
      const idAula = Number(it.idAula);
      const data_registro = formatDate(it.data_registro);
      const status = String(it.status ?? '').trim();

      if (!idAluno || !idAula) {
        // Ignora entradas inválidas (ou poderia retornar 400)
        console.warn('registrarPresencasBulk: item ignorado por id inválido', it);
        continue;
      }
      if (!allowedStatus.has(status)) {
        console.warn('registrarPresencasBulk: status inválido, usando "presente" por padrão', status, it);
      }

      const normalized = {
        idAluno,
        idAula,
        status: allowedStatus.has(status) ? status : 'presente',
        data_registro,
        observacao: it.observacao ?? null
      };

      const key = `${idAluno}|${idAula}|${data_registro}`;
      // mantêm o último item para a mesma chave (pode trocar para first se preferir)
      dedupeMap.set(key, normalized);
    }

    const items = Array.from(dedupeMap.values());
    if (items.length === 0) return sendError(res, 400, "Nenhum item válido para inserir");

    const results = [];
    await sequelize.transaction(async (t) => {
      // Use upsert para inserir ou atualizar conforme a constraint única composta
      // Faz sequencialmente para evitar conflitos com múltiplas operações concorrentes
      for (const it of items) {
        // upsert usa a constraint única para decidir insert vs update
        await Presenca.upsert({
          idAluno: it.idAluno,
          idAula: it.idAula,
          status: it.status,
          data_registro: it.data_registro,
          observacao: it.observacao
        }, { transaction: t });

        // Recupera o registro atual para retornar no resultado
        const pres = await Presenca.findOne({
          where: { idAluno: it.idAluno, idAula: it.idAula, data_registro: it.data_registro },
          transaction: t
        });
        results.push({ presenca: pres ? PresencaDTO.from(pres) : null });
      }
    });

    return ok(res, { resultados: results });
  } catch (err) {
    console.error('registrarPresencasBulk error:', err);
    if (err && err.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 409, 'Conflito de registro único ao inserir presenças');
    }
    next(err);
  }
};






