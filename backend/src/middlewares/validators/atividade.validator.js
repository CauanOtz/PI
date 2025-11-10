// src/middlewares/validators/atividade.validator.js
import { body, validationResult } from 'express-validator';

// Middleware para validar a criação de uma atividade
export const validateCreateAtividade = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('O título é obrigatório.')
    .isLength({ min: 3, max: 100 }).withMessage('O título deve ter entre 3 e 100 caracteres.'),
  body('data')
    .notEmpty().withMessage('A data é obrigatória.')
    .isISO8601().withMessage('A data deve estar no formato YYYY-MM-DD.')
    .toDate(), // Converte para objeto Date
  body('horario')
    .notEmpty().withMessage('O horário é obrigatório.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/).withMessage('O horário deve estar no formato HH:MM ou HH:MM:SS.'),
  body('descricao')
    .optional({ checkFalsy: true }) // Torna opcional, mas se vier, não pode ser só espaços em branco
    .trim()
    .isString().withMessage('A descrição deve ser um texto.')
    .isLength({ max: 500 }).withMessage('A descrição não pode exceder 500 caracteres.'),

  // Middleware para processar os resultados da validação
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Coleta as mensagens de erro
      const errorMessages = errors.array().map(error => ({
        field: error.path, // 'path' substitui 'param' em versões mais recentes
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    next(); // Se não houver erros, continua para o controller
  },
];

// Middleware para validar a atualização de uma atividade
export const validateUpdateAtividade = [
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('O título deve ter entre 3 e 100 caracteres.'),
  body('data')
    .optional()
    .isISO8601().withMessage('A data deve estar no formato YYYY-MM-DD.')
    .toDate(),
  body('horario')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)?)?$/).withMessage('O horário deve estar no formato HH:MM ou HH:MM:SS.'),
  body('descricao')
    .optional()
    .trim()
    .isString().withMessage('A descrição deve ser um texto.')
    .isLength({ max: 500 }).withMessage('A descrição não pode exceder 500 caracteres.'),

  // Middleware para processar os resultados da validação
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Coleta as mensagens de erro
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    next();
  },
];
