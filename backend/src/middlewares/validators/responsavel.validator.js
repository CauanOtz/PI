import { body, param, validationResult } from 'express-validator';


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

// Middleware para validação do ID do responsável nos parâmetros da rota
export const validateResponsavelId = [
  param('responsavelId')
    .isInt({ min: 1 }).withMessage('O ID do responsável deve ser um número inteiro positivo.')
    .toInt(),
  handleValidationErrors,
];