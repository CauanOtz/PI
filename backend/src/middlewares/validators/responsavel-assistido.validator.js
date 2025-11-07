// src/middlewares/validators/responsavel-assistido.validator.js
import { body, param, validationResult } from 'express-validator';
import { cpf } from 'cpf-cnpj-validator';

// Middleware genérico para lidar com os erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Erro de validação',
      erros: errorMessages
    });
  }
  next();
};

// Valida o CORPO (body) da requisição POST para vincular
export const validateVincularResponsavel = [
  body('idUsuario')
    .notEmpty().withMessage('O ID do responsável é obrigatório.')
    .isInt({ min: 1 }).withMessage('O ID do responsável deve ser um número inteiro positivo.')
    .toInt(),

  body('idAssistido')
    .notEmpty().withMessage('O ID do assistido é obrigatório.')
    .isInt({ min: 1 }).withMessage('O ID do assistido deve ser um número inteiro positivo.')
    .toInt(),

  handleValidationErrors
];

// Valida os PARÂMETROS (param) da requisição DELETE para desvincular
export const validateDesvincularResponsavel = [
  param('idUsuario')
    .notEmpty().withMessage('O ID do responsável é obrigatório.')
    .isInt({ min: 1 }).withMessage('O ID do responsável deve ser um número inteiro positivo.')
    .toInt(),

  param('idAssistido')
    .notEmpty().withMessage('O ID do assistido é obrigatório.')
    .isInt({ min: 1 }).withMessage('O ID do assistido deve ser um número inteiro positivo.')
    .toInt(),

  handleValidationErrors
];