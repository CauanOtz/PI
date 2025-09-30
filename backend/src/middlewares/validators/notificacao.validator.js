import { body, param, query, validationResult } from 'express-validator';
import { formatCpf, isValidCpf } from '../../utils/cpf.js';
import Notificacao from '../../models/Notificacao.model.js';
import Usuario from '../../models/Usuario.model.js';
import UsuarioNotificacao from '../../models/UsuarioNotificacao.model.js';

// Validação para criar/atualizar notificação
export const validateCriarNotificacao = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('O título é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('O título deve ter entre 3 e 100 caracteres'),
  
  body('mensagem')
    .trim()
    .notEmpty().withMessage('A mensagem é obrigatória')
    .isLength({ min: 1, max: 1000 }).withMessage('A mensagem deve ter no máximo 1000 caracteres'),
  
  body('tipo')
    .optional()
    .isIn(['info', 'alerta', 'urgente', 'sistema']).withMessage('Tipo de notificação inválido'),
  
  body('dataExpiracao')
    .optional()
    .isISO8601().withMessage('Data de expiração inválida. Use o formato ISO8601')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('A data de expiração deve ser futura');
      }
      return true;
    }),
  // campo opcional para permitir já enviar destinatários na criação
  body('usuarios')
    .optional()
    .isArray({ min: 1 }).withMessage('usuarios deve ser um array com ao menos 1 CPF quando fornecido')
    .custom((value) => {
      if (!Array.isArray(value)) return true; // já tratei
      const normalized = value.map(v => (v ? String(v).replace(/\D/g, '') : ''));
      const invalid = normalized.filter(n => n.length !== 11);
      if (invalid.length > 0) {
        throw new Error('CPFs com formato/tamanho inválido: ' + invalid.join(', '));
      }
      const uniq = new Set(normalized);
      if (uniq.size !== normalized.length) {
        throw new Error('Existem CPFs duplicados na lista de usuarios');
      }
      return true;
    })
    .customSanitizer(value => Array.isArray(value) ? value.map(c => formatCpf(c)) : value),
  
  // Middleware para processar os erros
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  }
];

// Validação para listar notificações
export const validateListarNotificacoes = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('A página deve ser um número inteiro maior que 0')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('O limite deve ser um número entre 1 e 100')
    .toInt(),
  
  query('tipo')
    .optional()
    .isIn(['info', 'alerta', 'urgente', 'sistema']).withMessage('Tipo de notificação inválido'),
  
  // Middleware para processar os erros
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  }
];

// Validação para ID da notificação
// Validação e normalização do ID da notificação.
// Aceita tanto `:id` quanto `:idNotificacao` nas rotas e garante que
// os controllers tenham `req.params.id` como inteiro válido.
export const validateNotificacaoId = [
  // Primeiro passo: middleware que checa e normaliza o ID vindo dos params
  (req, res, next) => {
    const raw = req.params.id ?? req.params.idNotificacao;
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({
        errors: [ { field: 'id', message: 'ID da notificação inválido' } ]
      });
    }

    // Normaliza ambos os nomes de parâmetro para os controllers
    req.params.id = id;
    req.params.idNotificacao = id;
    next();
  },

  // Segundo passo: verifica existência e permissão
  async (req, res, next) => {
    try {
      const value = req.params.id;
      const notificacao = await Notificacao.findByPk(value);
      if (!notificacao) {
        return res.status(404).json({
          errors: [ { field: 'id', message: 'Notificação não encontrada' } ]
        });
      }

      // Se for admin, tudo bem
      if (req.usuario.role === 'admin') {
        return next();
      }

      // Se for o criador da notificação, também pode acessar
      if (notificacao.criadoPor === req.usuario.cpf) {
        return next();
      }

      // Caso contrário, permita acesso se o usuário for destinatário/recebedor da notificação
      try {
        const userCpfRaw = (req.usuario && req.usuario.cpf) ? String(req.usuario.cpf) : '';
        const userDigits = userCpfRaw.replace(/\D/g, '');

        // fetch recipients for the notification and compare normalized digits
        const rels = await UsuarioNotificacao.findAll({ where: { notificacaoId: value } });

        // DEBUG: print helpful info to diagnose 403 for recipients
        // try {
        //   console.log('[DEBUG validateNotificacaoId] req.usuario.cpf (raw):', req.usuario && req.usuario.cpf);
        //   console.log('[DEBUG validateNotificacaoId] req.usuario.cpf (digits):', userDigits);
        //   console.log('[DEBUG validateNotificacaoId] notificacao.criadoPor:', notificacao.criadoPor);
        //   console.log('[DEBUG validateNotificacaoId] found recipients count:', Array.isArray(rels) ? rels.length : 0);
        //   console.log('[DEBUG validateNotificacaoId] recipients (raw):', rels.map(r => r.cpfUsuario));
        //   console.log('[DEBUG validateNotificacaoId] recipients (digits):', rels.map(r => String(r.cpfUsuario || '').replace(/\D/g, '')));
        // } catch (logErr) {
        //   console.error('[DEBUG validateNotificacaoId] error printing debug info:', logErr);
        // }

        if (Array.isArray(rels) && rels.length > 0) {
          const match = rels.some(r => (String(r.cpfUsuario || '').replace(/\D/g, '')) === userDigits);
          if (match) return next();
        }
      } catch (e) {
        // ignore DB lookup errors here and fallthrough to permission denied
        console.error('Erro ao verificar relação UsuarioNotificacao:', e);
      }

      
      try {
        const destinatarios = await UsuarioNotificacao.count({ where: { notificacaoId: value } });
        if (destinatarios === 0) {
          return res.status(403).json({
            errors: [ { field: 'id', message: 'Notificação ainda não foi enviada a nenhum usuário. O administrador deve enviá-la antes que destinatários possam acessá-la.' } ]
          });
        }
      } catch(ignore) {}

      return res.status(403).json({
        errors: [ { field: 'id', message: 'Você não tem permissão para acessar esta notificação' } ]
      });

      next();
    } catch (err) {
      next(err);
    }
  }
];

// Validação para CPF do usuário
export const validateUsuarioCpf = [
  param('cpfUsuario')
    .trim()
    .notEmpty().withMessage('CPF do usuário é obrigatório')
    .customSanitizer(v => (v ? String(v).replace(/\D/g, '') : v))
    .custom(value => {
      if (!value || value.length !== 11) throw new Error('CPF inválido');
      // Ignorando checksum para permitir CPFs de teste
      return true;
    })
    .customSanitizer(value => formatCpf(value)) 
    .custom(async (value, { req }) => {
      // Se não for admin, só pode ver as próprias notificações
      if (req.usuario.role !== 'admin' && value !== req.usuario.cpf) {
        throw new Error('Você só pode ver suas próprias notificações');
      }
      
      // Verifica se o usuário existe
      const usuario = await Usuario.findOne({ where: { cpf: value } });
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      
      return true;
    }),
  
  // Query params para listar notificações do usuário
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('A página deve ser um número inteiro maior que 0')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('O limite deve ser um número entre 1 e 100')
    .toInt(),
  
  query('lida')
    .optional()
    .isBoolean().withMessage('O parâmetro lida deve ser um booleano')
    .toBoolean(),
  
  // Middleware para processar os erros
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const status = errors.array().some(e => e.param === 'cpfUsuario') ? 404 : 400;
      return res.status(status).json({ 
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  }
];

// Validação para enviar notificação a usuários
export const validateEnviarNotificacao = [
  body('usuarios')
    .isArray({ min: 1 }).withMessage('É necessário informar pelo menos um usuário')
    .custom(async (value) => {
      // Normaliza para dígitos e faz validação mínima (apenas tamanho)
      const normalized = value.map(v => (v ? String(v).replace(/\D/g, '') : ''));
      const cpfsFormatoInvalido = normalized.filter(n => n.length !== 11);
      if (cpfsFormatoInvalido.length > 0) {
        throw new Error(`CPFs com formato/tamanho inválido: ${cpfsFormatoInvalido.join(', ')}`);
      }

      // Mantemos verificação de duplicados (mesmo que checksum seja ignorado)
      const cpfsUnicos = [...new Set(normalized)];
      if (cpfsUnicos.length !== normalized.length) {
        throw new Error('Existem CPFs duplicados na lista');
      }

      // Checksum NÃO é obrigatório aqui para permitir CPFs de teste.
      return true;
    })
    .customSanitizer(value => value.map(cpfStr => formatCpf(cpfStr))), // Formata todos os CPFs
  
  // Middleware para processar os erros
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  }
];
