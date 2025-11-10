// src/middlewares/validators/presenca.validator.js
import { body, param, query, validationResult } from 'express-validator';

// Middleware genérico para processar resultados de validação
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};

// Validação para registrar presença
export const validateRegistrarPresenca = [
  body('idAssistido')
    .isInt({ min: 1 }).withMessage('ID do assistido deve ser um número inteiro positivo.')
    .toInt(),
  body('idAtividade')
    .isInt({ min: 1 }).withMessage('ID da atividade deve ser um número inteiro positivo.')
    .toInt(),
  body('status')
    .isIn(['presente', 'falta'])
    .withMessage('Status de presença inválido. Valores aceitos: presente, falta'),
  body('data_registro')
    .optional({ nullable: true })
    .isISO8601().withMessage('A data de registro deve estar no formato YYYY-MM-DD.'),
  body('observacao')
    .optional({ nullable: true })
    .isString().withMessage('A observação deve ser um texto.')
    .isLength({ max: 500 }).withMessage('A observação não pode exceder 500 caracteres.')
    .trim(),
  validateRequest
];

// Validação para listar presenças com filtros
export const validateListarPresencas = [
  query('idAssistido')
    .optional()
    .isInt({ min: 1 }).withMessage('ID do assistido deve ser um número inteiro positivo.')
    .toInt(),
  query('idAtividade')
    .optional()
    .isInt({ min: 1 }).withMessage('ID da atividade deve ser um número inteiro positivo.')
    .toInt(),
  query('dataInicio')
    .optional()
    .isISO8601().withMessage('A data de início deve estar no formato YYYY-MM-DD.'),
  query('dataFim')
    .optional()
    .isISO8601().withMessage('A data de fim deve estar no formato YYYY-MM-DD.'),
  query('status')
    .optional()
    .isIn(['presente', 'falta', 'atraso', 'falta_justificada'])
    .withMessage('Status de presença inválido. Valores aceitos: presente, falta, atraso, falta_justificada'),
  validateRequest
];

// Validação para obter uma presença específica
export const validateObterPresenca = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID da presença deve ser um número inteiro positivo.')
    .toInt(),
  validateRequest
];

// Validação para atualizar uma presença
export const validateAtualizarPresenca = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID da presença deve ser um número inteiro positivo.')
    .toInt(),
  body('status')
    .optional()
    .isIn(['presente', 'falta', 'atraso', 'falta_justificada'])
    .withMessage('Status de presença inválido. Valores aceitos: presente, falta, atraso, falta_justificada'),
  body('data_registro')
    .optional()
    .isISO8601().withMessage('A data de registro deve estar no formato YYYY-MM-DD.'),
  body('observacao')
    .optional()
    .isString().withMessage('A observação deve ser um texto.')
    .isLength({ max: 500 }).withMessage('A observação não pode exceder 500 caracteres.')
    .trim(),
  validateRequest
];

// Validação para listar histórico de presença de um aluno
export const validateHistoricoAssistido = [
  param('idAssistido')
    .isInt({ min: 1 }).withMessage('ID do assistido deve ser um número inteiro positivo.')
    .toInt(),
  query('dataInicio')
    .optional()
    .isISO8601().withMessage('A data de início deve estar no formato YYYY-MM-DD.'),
  query('dataFim')
    .optional()
    .isISO8601().withMessage('A data de fim deve estar no formato YYYY-MM-DD.'),
  validateRequest
];

// Validação para listar presenças de uma atividade específica
export const validatePresencasPorAtividade = [
  param('idAtividade')
    .isInt({ min: 1 }).withMessage('ID da atividade deve ser um número inteiro positivo.')
    .toInt(),
  query('data')
    .optional()
    .isISO8601().withMessage('A data deve estar no formato YYYY-MM-DD.'),
  validateRequest
];
