import { body, param, query, validationResult } from 'express-validator';
import { cpf } from 'cpf-cnpj-validator';
import Notificacao from '../../models/Notificacao.model.js';
import Usuario from '../../models/Usuario.model.js';

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
export const validateNotificacaoId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID da notificação inválido')
    .toInt()
    .custom(async (value, { req }) => {
      const notificacao = await Notificacao.findByPk(value);
      if (!notificacao) {
        throw new Error('Notificação não encontrada');
      }
      
      // Se não for admin, verifica se é o criador da notificação
      if (req.usuario.role !== 'admin' && notificacao.criadoPor !== req.usuario.cpf) {
        throw new Error('Você não tem permissão para acessar esta notificação');
      }
      
      return true;
    }),
  
  // Middleware para processar os erros
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ 
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }
    next();
  }
];

// Validação para CPF do usuário
export const validateUsuarioCpf = [
  param('cpfUsuario')
    .trim()
    .notEmpty().withMessage('CPF do usuário é obrigatório')
    .custom(value => {
      if (!cpf.isValid(value)) {
        throw new Error('CPF inválido');
      }
      return true;
    })
    .customSanitizer(value => cpf.format(value)) // Formata o CPF
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
      // Verifica se todos os CPFs são válidos
      const cpfsInvalidos = value.filter(cpfStr => !cpf.isValid(cpfStr));
      if (cpfsInvalidos.length > 0) {
        throw new Error(`CPFs inválidos: ${cpfsInvalidos.join(', ')}`);
      }
      
      // Verifica se existem CPFs duplicados
      const cpfsUnicos = [...new Set(value)];
      if (cpfsUnicos.length !== value.length) {
        throw new Error('Existem CPFs duplicados na lista');
      }
      
      return true;
    })
    .customSanitizer(value => value.map(cpfStr => cpf.format(cpfStr))), // Formata todos os CPFs
  
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
