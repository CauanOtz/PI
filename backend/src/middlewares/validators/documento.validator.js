// src/middlewares/validators/documento.validator.js
import { body, param, validationResult } from 'express-validator';

export const validateAdicionarDocumento = [
  param('alunoId')
    .isInt({ min: 1 })
    .withMessage('ID do aluno inválido'),
  
  body('descricao')
    .optional()
    .isString()
    .withMessage('A descrição deve ser um texto')
    .isLength({ max: 500 })
    .withMessage('A descrição deve ter no máximo 500 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];