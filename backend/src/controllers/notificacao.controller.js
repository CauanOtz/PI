import { NotificacaoDTO, PaginationDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';
import { Op } from 'sequelize';
import Notificacao from '../models/Notificacao.model.js';
import Usuario from '../models/Usuario.model.js';
import UsuarioNotificacao from '../models/UsuarioNotificacao.model.js';
import NotificacaoService from '../services/notificacao.service.js';
import { normalizeCpf, formatCpf } from '../utils/cpf.js';

/**
 * Cria uma nova notificação
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @param {Function} next - Próximo middleware
 */
// Allow tests to override the service constructor. Tests can call
// __setNotificacaoServiceForTests(() => mockServiceInstance)
// to make controller functions use a mocked service.
let NotificacaoServiceClass = NotificacaoService;
export const __setNotificacaoServiceForTests = (fn) => { NotificacaoServiceClass = fn; };
export const __resetNotificacaoServiceForTests = () => { NotificacaoServiceClass = NotificacaoService; };

export const criarNotificacao = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const { titulo, mensagem, tipo, dataExpiracao } = req.body;
    const criadoPorDigits = normalizeCpf(req.usuario?.cpf || '');
    const criadoPor = criadoPorDigits ? formatCpf(criadoPorDigits) : null;
    if (!criadoPor) {
      return res.status(400).json({ mensagem: 'CPF do usuário autenticado ausente ou inválido' });
    }

    const result = await service.criar({ titulo, mensagem, tipo, dataExpiracao, criadoPor });
    if (result && result.error) {
      return res.status(result.status || 400).json({ mensagem: result.message });
    }
    return created(res, NotificacaoDTO.from(result.notificacao));
  } catch (error) {
    if (error && error.name === 'SequelizeValidationError') {
      return res.status(400).json({ mensagem: error.message });
    }
    next(error);
  }
};

/**
 * Lista todas as notificações (para admin)
 */
export const listarNotificacoes = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const tipo = req.query.tipo;
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    if (limit > 100) limit = 100;

    const incluirDestinatarios = String(req.query.includeDestinatarios || '').toLowerCase() === 'false' ? false : true;

    const result = await service.listar({ page, limit, tipo, incluirDestinatarios });
    if (result && result.error) {
      return next(result);
    }

    const notificacoesDTO = NotificacaoDTO.list(result.notificacoes, { includeDestinatarios: incluirDestinatarios });
    const paginacao = new PaginationDTO({ total: result.total, paginaAtual: result.paginaAtual, totalPaginas: result.totalPaginas, itensPorPagina: result.itensPorPagina });
    return ok(res, { notificacoes: notificacoesDTO, paginacao });
  } catch (error) {
    if (error && error.name === 'SequelizeValidationError') {
      return res.status(400).json({ mensagem: error.message });
    }
    next(error);
  }
};

/**
 * Obtém uma notificação específica
 */
export const obterNotificacao = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const { id } = req.params;
    const result = await service.obter(id);
    if (result && result.error) {
      return res.status(result.status || 404).json({ mensagem: result.message });
    }
    return ok(res, NotificacaoDTO.from(result.notificacao));
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza uma notificação (apenas criador ou admin)
 */
export const atualizarNotificacao = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const { id } = req.params;
    const payload = req.body;
    const result = await service.atualizar(id, payload);
    if (result && result.error) {
      return res.status(result.status || 404).json({ mensagem: result.message });
    }
    return ok(res, NotificacaoDTO.from(result.notificacao));
  } catch (error) {
    next(error);
  }
};

/**
 * Exclui uma notificação
 */
export const excluirNotificacao = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const { id } = req.params;
    const result = await service.excluir(id);
    if (result && result.error) {
      return res.status(result.status || 404).json({ mensagem: result.message });
    }
    return res.status(200).json({ mensagem: 'Notificação excluída com sucesso' });
  } catch (error) {
    if (error && error.name === 'SequelizeValidationError') {
      return res.status(400).json({ mensagem: error.message });
    }
    next(error);
  }
};

/**
 * Lista notificações de um usuário específico
 */
export const listarNotificacoesUsuario = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const { cpfUsuario } = req.params;
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const lida = req.query.lida;
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    if (limit > 100) limit = 100;

    // Authorization
    if (cpfUsuario !== req.usuario.cpf && req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para acessar estas notificações' });
    }

    const result = await service.listarPorUsuario({ cpfUsuario, page, limit, lida });
    if (result && result.error) {
      return res.status(result.status || 400).json({ mensagem: result.message });
    }

    const notificacoesDTO = NotificacaoDTO.list(result.notificacoes);
    const paginacao = new PaginationDTO({ total: result.total, paginaAtual: result.paginaAtual, totalPaginas: result.totalPaginas, itensPorPagina: result.itensPorPagina });
    return ok(res, { notificacoes: notificacoesDTO, paginacao });
  } catch (error) {
    if (error && error.name === 'SequelizeValidationError') {
      return res.status(400).json({ mensagem: error.message });
    }
    next(error);
  }
};

/**
 * Marca uma notificação como lida
 */
export const marcarComoLida = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const idNumber = Number(req.params.id);
    const cpfUsuario = req.usuario.cpf;

    if (!Number.isInteger(idNumber) || idNumber < 1) {
      return res.status(404).json({ mensagem: 'ID inválido' });
    }

    const result = await service.marcarComoLida(idNumber, cpfUsuario);
    if (result && result.error) {
      return res.status(result.status || 404).json({ mensagem: result.message });
    }
    return res.status(200).json({ sucesso: true, dados: result.notificacao });
  } catch (error) {
    if (error && error.name === 'SequelizeValidationError') {
      return res.status(400).json({ mensagem: error.message });
    }
    next(error);
  }
};

/**
 * Envia/associa uma notificação a um ou mais usuários
 */
export const enviarNotificacao = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const idNotificacao = Number(req.params.id);
    const usuarios = req.body.usuarios;

    const result = await service.enviar(idNotificacao, usuarios);
    if (result && result.error) {
      return res.status(result.status || 404).json({ mensagem: result.message });
    }
    return res.status(201).json({ sucesso: true });
  } catch (error) {
    if (error && error.name === 'SequelizeValidationError') {
      return res.status(400).json({ mensagem: error.message });
    }
    next(error);
  }
};

/**
 * Lista usuários que receberam uma notificação específica
 */
export const listarUsuariosNotificacao = async (req, res, next) => {
  try {
  const service = new NotificacaoServiceClass();
    const idNotificacao = Number(req.params.id);
    const result = await service.listarUsuarios(idNotificacao);
    if (result && result.error) {
      return res.status(result.status || 404).json({ mensagem: result.message });
    }
    return ok(res, { usuarios: result.usuarios });
  } catch (error) {
    if (error && error.name === 'SequelizeValidationError') {
      return res.status(400).json({ mensagem: error.message });
    }
    next(error);
  }
};







