// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Usuario from '../models/Usuario.model.js';

export const autenticar = async (req, res, next) => {
  try {
    // Verifica se o token foi enviado no header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ mensagem: 'Token não fornecido' });
    }

    // Formato: Bearer <token>
    const [, token] = authHeader.split(' ');

    try {
      // Verifica se o token é válido
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'sua_chave_secreta');
      
      // Busca o usuário no banco de dados
      const usuario = await Usuario.findByPk(decoded.id, {
        attributes: { exclude: ['senha'] }
      });

      if (!usuario) {
        return res.status(401).json({ mensagem: 'Usuário não encontrado' });
      }

      // Adiciona o usuário à requisição
      req.usuario = usuario;
      return next();
    } catch (error) {
      return res.status(401).json({ mensagem: 'Token inválido' });
    }
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro na autenticação', error: error.message });
  }
};