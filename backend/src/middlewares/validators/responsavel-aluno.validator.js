// src/middlewares/validators/responsavel-aluno.validator.js
import { body, param, validationResult } from 'express-validator';
import { cpf } from 'cpf-cnpj-validator';

export const validateVincularResponsavel = [
  body('cpfUsuario')
    .notEmpty()
    .withMessage('CPF do responsável é obrigatório')
    .bail()
    .isString()
    .withMessage('CPF deve ser uma string')
    .bail()
    .custom(value => cpf.isValid(value))
    .withMessage('CPF inválido')
    .bail()
    .customSanitizer(value => value.replace(/\D/g, '')), // Remove formatação

  body('idAluno')
    .notEmpty()
    .withMessage('ID do aluno é obrigatório')
    .bail()
    .isInt({ min: 1 })
    .withMessage('ID do aluno deve ser um número inteiro positivo')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateDesvincularResponsavel = [
  param('cpfUsuario')
    .notEmpty()
    .withMessage('CPF do responsável é obrigatório')
    .bail()
    .isString()
    .withMessage('CPF deve ser uma string')
    .bail()
    .custom(value => cpf.isValid(value))
    .withMessage('CPF inválido')
    .bail()
    .customSanitizer(value => value.replace(/\D/g, '')), // Remove formatação

  param('idAluno')
    .notEmpty()
    .withMessage('ID do aluno é obrigatório')
    .bail()
    .isInt({ min: 1 })
    .withMessage('ID do aluno deve ser um número inteiro positivo')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateListarResponsaveis = [
    param('idAluno')
      .notEmpty()
      .withMessage('ID do aluno é obrigatório')
      .bail()
      .isInt({ min: 1 })
      .withMessage('ID do aluno deve ser um número inteiro positivo')
      .toInt(),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];