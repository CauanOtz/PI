// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Usuario from '../models/Usuario.model.js';

// src/middlewares/auth.middleware.js
export const autenticar = async (req, res, next) => {
    try {
      console.log('Headers recebidos:', req.headers); // Log dos headers
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        console.log('Nenhum token fornecido');
        return res.status(401).json({ mensagem: 'Token não fornecido' });
      }
  
      const parts = authHeader.split(' ');
      console.log('Parts do token:', parts); // Verificar se o split está correto
      
      if (parts.length !== 2) {
        console.log('Token com formato inválido');
        return res.status(401).json({ mensagem: 'Token error' });
      }
  
      const [scheme, token] = parts;
  
      if (!/^Bearer$/i.test(scheme)) {
        console.log('Token mal formatado');
        return res.status(401).json({ mensagem: 'Token mal formatado' });
      }
  
      console.log('Token antes da verificação:', token); // Verificar o token recebido
      
      const decoded = await promisify(jwt.verify)(
        token, 
        process.env.JWT_SECRET || 'sua_chave_secreta'
      );
      
      console.log('Token decodificado:', decoded); // Verificar o conteúdo decodificado
  
      const usuario = await Usuario.findByPk(decoded.id, {
        attributes: { exclude: ['senha'] }
      });
  
      if (!usuario) {
        console.log('Usuário não encontrado para o token fornecido');
        return res.status(401).json({ mensagem: 'Usuário não encontrado' });
      }
  
      req.usuario = usuario;
      return next();
    } catch (error) {
      console.error('Erro na autenticação:', error.message); // Log do erro específico
      return res.status(401).json({ 
        mensagem: 'Token inválido',
        error: error.message
      });
    }
  };