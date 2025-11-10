// src/middlewares/error.middleware.js
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log detalhado do erro para debug
  console.error('Erro completo:', {
    name: err.name,
    message: err.message,
    errors: err.errors,
    stack: err.stack
  });

  // Trata erros de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      sucesso: false,
      erro: {
        mensagem: 'Erro de validação',
        detalhes: err.errors.map(error => ({
          campo: error.path,
          valor: error.value,
          mensagem: error.message,
          tipo: error.type
        }))
      }
    });
  }

  // Trata erros de banco de dados do Sequelize
  if (err.name === 'SequelizeDatabaseError') {
    logger.error('Erro de banco de dados:', err);
    return res.status(400).json({
      sucesso: false,
      erro: {
        mensagem: 'Erro ao executar operação no banco de dados',
        detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }

  const status = err.status || err.statusCode || 500;
  const code = err.code;
  const message = err.message || 'Erro interno do servidor';

  if (status >= 500) {
    logger.error(message, { status, code, stack: err.stack });
  } else {
    logger.warn(message, { status, code });
  }

  const payload = { 
    sucesso: false,
    erro: { 
      mensagem: message,
      codigo: code
    } 
  };
  
  if (process.env.NODE_ENV === 'development') {
    payload.erro.stack = err.stack;
    if (err.errors) {
      payload.erro.detalhes = err.errors;
    }
  }

  res.status(status).json(payload);
};

export default errorHandler;
