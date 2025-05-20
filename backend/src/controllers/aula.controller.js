// src/controllers/aula.controller.js
import Aula from '../models/Aula.model.js'; // Importe o modelo Sequelize

export const listarAulas = async (req, res, next) => {
  try {
    const aulas = await Aula.findAll();
    res.status(200).json(aulas);
  } catch (error) {
    // Passa o erro para o middleware de tratamento de erros global
    next(error);
  }
};

export const criarAula = async (req, res, next) => {
  try {
    const { titulo, data, horario, descricao } = req.body;
    // Adicionar validação de entrada aqui (ex: com Joi ou express-validator)
    if (!titulo || !data || !horario) {
      return res.status(400).json({ message: 'Título, data e horário são obrigatórios.' });
    }
    const novaAula = await Aula.create({ titulo, data, horario, descricao });
    res.status(201).json(novaAula);
  } catch (error) {
    // Se for um erro de validação do Sequelize, pode ser mais específico
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: 'Erro de validação', errors: messages });
    }
    next(error);
  }
};

// Implementar getAulaPorId, atualizarAula, excluirAula