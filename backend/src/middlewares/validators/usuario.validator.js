// src/middlewares/validators/usuario.validator.js
import { body, validationResult } from 'express-validator';

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
    .trim()
    .matches(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/).withMessage('Telefone inválido.'),
  body('role')
    .optional()
    .isIn(['admin', 'responsavel']).withMessage('Papel inválido.'),

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