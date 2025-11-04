// src/middlewares/validators/param.validator.js
import { param, validationResult } from 'express-validator';

export const validateIdParam = (name = 'id') => [
  param(name).isInt({ min: 1 }).withMessage(`${name} deve ser um inteiro positivo`).toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array().map(e => ({ campo: e.path, mensagem: e.msg })) });
    }
    next();
  }
];
