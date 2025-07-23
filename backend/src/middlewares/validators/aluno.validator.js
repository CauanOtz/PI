// src/middlewares/validators/aluno.validator.js
import { body, param, validationResult } from 'express-validator';

// Validações comuns que podem ser reutilizadas
const nomeValidation = body('nome')
  .trim()
  .notEmpty().withMessage('O nome é obrigatório.')
  .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.');

const idadeValidation = body('idade')
  .notEmpty().withMessage('A idade é obrigatória.')
  .isInt({ min: 0, max: 120 }).withMessage('A idade deve ser um número entre 0 e 120.');

const enderecoValidation = body('endereco')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ max: 255 }).withMessage('O endereço não pode ter mais de 255 caracteres.');

const contatoValidation = body('contato')
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^(\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{10,11})?$/)
  .withMessage('Formato de contato inválido. Use (DD) 99999-9999 ou (DD) 9999-9999.');

const responsavelIdValidation = body('responsavel_id')
  .notEmpty().withMessage('O ID do responsável é obrigatório.')
  .isInt({ min: 1 }).withMessage('O ID do responsável deve ser um número inteiro positivo.');

// Middleware para validação de criação de aluno
export const validateCreateAluno = [
  nomeValidation,
  idadeValidation,
  enderecoValidation,
  contatoValidation,
  responsavelIdValidation,
  
  // Middleware para processar os resultados da validação
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    next();
  },
];

// Middleware para validação de atualização de aluno
export const validateUpdateAluno = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.'),
  body('idade')
    .optional()
    .isInt({ min: 0, max: 120 }).withMessage('A idade deve ser um número entre 0 e 120.'),
  enderecoValidation,
  contatoValidation,
  body('responsavel_id')
    .optional()
    .isInt({ min: 1 }).withMessage('O ID do responsável deve ser um número inteiro positivo.'),
  
  // Middleware para processar os resultados da validação
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    next();
  },
];

// Middleware para validar o ID do aluno nos parâmetros da rota
export const validateAlunoId = [
  param('id')
    .isInt({ min: 1 }).withMessage('O ID do aluno deve ser um número inteiro positivo.'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        }))
      });
    }
    next();
  },
];

// Middleware para validação de consulta (query params)
export const validateListarAlunos = [
  param('page').optional().isInt({ min: 1 }).withMessage('A página deve ser um número inteiro positivo.'),
  param('limit').optional().isInt({ min: 1, max: 100 }).withMessage('O limite deve ser um número entre 1 e 100.'),
  param('search').optional().trim().isString().withMessage('O termo de busca deve ser um texto.'),
  param('responsavel_id').optional().isInt({ min: 1 }).withMessage('O ID do responsável deve ser um número inteiro positivo.'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
        }))
      });
    }
    next();
  },
];
