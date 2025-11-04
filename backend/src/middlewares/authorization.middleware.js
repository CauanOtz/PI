// src/middlewares/authorization.middleware.js
export const requireAdmin = (req, res, next) => {
  try {
    const role = req?.usuario?.role;
    if (role === 'admin') return next();
    return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
  } catch (err) {
    return res.status(403).json({ mensagem: 'Acesso negado.' });
  }
};
