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

export const validateListarDocumentos = [
    param('alunoId')
      .isInt({ min: 1 })
      .withMessage('ID do aluno inválido')
      .toInt(),
    
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

  export const validateObterDocumento = [
    param('alunoId')
      .isInt({ min: 1 })
      .withMessage('ID do aluno inválido')
      .toInt(),
    
    param('documentoId')
      .isUUID('4')
      .withMessage('ID do documento inválido'),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

  export const validateAtualizarDocumento = [
    param('alunoId')
      .isInt({ min: 1 })
      .withMessage('ID do aluno inválido')
      .toInt(),
    
    param('documentoId')
      .isUUID('4')
      .withMessage('ID do documento inválido'),
  
    body('nome')
      .optional()
      .isString()
      .withMessage('O nome deve ser um texto')
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('O nome deve ter entre 3 e 255 caracteres'),
  
    body('descricao')
      .optional()
      .isString()
      .withMessage('A descrição deve ser um texto')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('A descrição deve ter no máximo 1000 caracteres'),
  
    body('tipo')
      .optional()
      .isString()
      .withMessage('O tipo deve ser um texto')
      .isIn(['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt'])
      .withMessage('Tipo de arquivo não suportado'),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

  
export const validateExcluirDocumento = [
    param('alunoId')
      .isInt({ min: 1 })
      .withMessage('ID do aluno inválido')
      .toInt(),
    
    param('documentoId')
      .isUUID('4')
      .withMessage('ID do documento inválido'),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

  export const validateDownloadDocumento = [
    param('documentoId')
      .isUUID('4')
      .withMessage('ID do documento inválido'),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];