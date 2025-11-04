// src/middlewares/error.middleware.js
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const code = err.code;
  const message = err.message || 'Erro interno do servidor';

  if (status >= 500) {
    logger.error(message, { status, code, stack: err.stack });
  } else {
    logger.warn(message, { status, code });
  }

  const payload = { error: { message, code } };
  if (process.env.NODE_ENV === 'development' && err.stack) {
    payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
};

export default errorHandler;
