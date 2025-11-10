// src/middlewares/validators/documento.validator.js
import { body, param, validationResult } from 'express-validator';

const TIPOS = ['RG', 'CPF', 'CERTIDAO_NASCIMENTO', 'COMPROVANTE_ENDERECO', 'OUTRO'];

export const validateAdicionarDocumento = [
  param('assistidoId').isInt({ min: 1 }).withMessage('ID do assistido inválido'),
  body('descricao').optional().isString().isLength({ max: 500 }).withMessage('A descrição deve ter no máximo 500 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateListarDocumentos = [
  param('assistidoId').isInt({ min: 1 }).withMessage('ID do assistido inválido').toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateObterDocumento = [
  param('assistidoId').isInt({ min: 1 }).withMessage('O ID do assistido deve ser um número inteiro positivo.').toInt(),
  param('documentoId').isInt({ min: 1 }).withMessage('O ID do documento deve ser um número inteiro positivo.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateAtualizarDocumento = [
  param('assistidoId').isInt({ min: 1 }).withMessage('ID do assistido inválido').toInt(),
  param('documentoId').isInt({ min: 1 }).withMessage('ID do documento inválido'),
  body('nome').optional().isString().trim().isLength({ min: 3, max: 255 }).withMessage('O nome deve ter entre 3 e 255 caracteres'),
  body('descricao').optional().isString().trim().isLength({ max: 1000 }).withMessage('A descrição deve ter no máximo 1000 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateExcluirDocumento = [
  param('assistidoId').isInt({ min: 1 }).withMessage('ID do assistido inválido').toInt(),
  param('documentoId').isInt({ min: 1 }).withMessage('ID do documento inválido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateDownloadDocumento = [
  param('assistidoId').isInt({ min: 1 }).withMessage('ID do assistido inválido').toInt(),
  param('documentoId').isInt({ min: 1 }).withMessage('ID do documento inválido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

