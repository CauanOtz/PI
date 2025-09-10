// src/middlewares/validators/usuario.validator.js
import { query, body, validationResult, param } from 'express-validator';

export const validarCPF = (cpf) => {
  if (!cpf) return false;
  cpf = cpf.toString().replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  
  // Validação do CPF
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) 
    soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
  resto = (soma * 10) % 11;

  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) 
    soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
  resto = (soma * 10) % 11;

  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

// Middleware para validar o registro de um novo usuário
export const validateRegistroUsuario = [
  body('nome')
    .trim()
    .notEmpty().withMessage('O nome é obrigatório.')
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.'),
  body('email')
    .trim()
    .notEmpty().withMessage('O e-mail é obrigatório.')
    .isEmail().withMessage('E-mail inválido.')
    .normalizeEmail(),
  body('senha')
    .notEmpty().withMessage('A senha é obrigatória.')
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
  body('telefone')
    .optional({ checkFalsy: true })
    .customSanitizer(v => (v ? v.toString().replace(/\D/g, '') : v))
    .custom(v => {
      if (v === undefined || v === null || v === '') return true;
      return typeof v === 'string' && (v.length === 10 || v.length === 11);
    }).withMessage('Telefone inválido. Informe 10 ou 11 dígitos.'),
  body('role')
    .optional()
    .isIn(['admin', 'responsavel']).withMessage('Papel inválido.'),

  // Middleware para processar os resultados da validação
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.param || error.path,
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    next();
  },
];


// Middleware para validar os parâmetros de busca
export const validateListarUsuarios = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('O número da página deve ser um inteiro maior que 0')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('O limite deve ser um inteiro entre 1 e 100')
    .toInt(),
  query('search')
    .optional()
    .isString()
    .trim(),
  query('role')
    .optional()
    .isIn(['admin', 'responsavel'])
    .withMessage('Papel inválido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.param || error.path,
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    next();
  },
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('senha')
    .isString()
    .withMessage('Senha é obrigatória')
    .notEmpty()
    .withMessage('Senha não pode estar vazia')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.param || error.path,
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    next();
  },
];

// Buscar por CPF: sanitiza para somente dígitos e valida comprimento (não exige algoritmo)
export const validateBuscarPorCPF = [
  param('cpf')
    .notEmpty().withMessage('CPF é obrigatório')
    .customSanitizer(v => (v ? v.toString().replace(/\D/g, '') : v))
    .isLength({ min: 11, max: 11 }).withMessage('CPF inválido'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Atualizar usuário: sanitiza param CPF e valida comprimento (não exige algoritmo)
export const validateAtualizarUsuario = [
  param('cpf')
    .notEmpty().withMessage('CPF é obrigatório')
    .customSanitizer(v => (v ? v.toString().replace(/\D/g, '') : v))
    .isLength({ min: 11, max: 11 }).withMessage('CPF inválido'),
  
  body('nome')
    .optional()
    .isLength({ min: 3 }).withMessage('O nome deve ter pelo menos 3 caracteres'),
  
  body('email')
    .optional()
    .isEmail().withMessage('E-mail inválido')
    .normalizeEmail(),
  
  // telefone: sanitizar e validar 10 ou 11 dígitos
  body('telefone')
    .optional({ nullable: true })
    .customSanitizer(v => (v ? v.toString().replace(/\D/g, '') : v))
    .custom(v => {
      if (v === undefined || v === null || v === '') return true;
      return typeof v === 'string' && (v.length === 10 || v.length === 11);
    }).withMessage('Telefone inválido. Informe 10 ou 11 dígitos.'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Excluir usuário: sanitiza param CPF e valida comprimento (não exige algoritmo)
export const validateExcluirUsuario = [
  param('cpf')
    .notEmpty().withMessage('CPF é obrigatório')
    .customSanitizer(v => (v ? v.toString().replace(/\D/g, '') : v))
    .isLength({ min: 11, max: 11 }).withMessage('CPF inválido'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];