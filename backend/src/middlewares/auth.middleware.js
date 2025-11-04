// src/middlewares/auth.middleware.js
import { verifyToken } from '../utils/jwt.js';
import UsuarioService from '../services/usuario.service.js';

// src/middlewares/auth.middleware.js
export const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ mensagem: 'Token não fornecido' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2) return res.status(401).json({ mensagem: 'Token error' });
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ mensagem: 'Token mal formatado' });

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ mensagem: 'Token inválido', error: err.message });
    }

    const usuario = await UsuarioService.getById(decoded.id);
    if (!usuario) return res.status(401).json({ mensagem: 'Usuário não encontrado' });

    req.usuario = usuario;
    return next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token inválido', error: error.message });
  }
};