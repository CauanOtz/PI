import { sequelize } from '../config/database.js';
import Atividade from '../models/Atividade.model.js';

export default class AtividadeService {
  static async listAll() {
    // Simple list, controller will map DTOs
    const atividades = await Atividade.findAll({ order: [['data', 'ASC'], ['horario', 'ASC']] });
    return atividades;
  }

  static async getById(id) {
    const atividadeId = parseInt(id);
    if (Number.isNaN(atividadeId)) {
      const err = new Error('ID da atividade inválido');
      err.status = 400;
      throw err;
    }
    const atividade = await Atividade.findByPk(atividadeId);
    if (!atividade) {
      const err = new Error('Atividade não encontrada');
      err.status = 404;
      throw err;
    }
    return atividade;
  }

  static async create({ titulo, data, horario, descricao }) {
    const transaction = await sequelize.transaction();
    try {
      const novo = await Atividade.create({ titulo, data, horario, descricao }, { transaction });
      await transaction.commit();
      return novo;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async update(id, { titulo, data, horario, descricao }) {
    const transaction = await sequelize.transaction();
    try {
      const atividade = await Atividade.findByPk(id);
      if (!atividade) {
        await transaction.commit();
        return null;
      }

      await atividade.update({ titulo, data, horario, descricao }, { transaction });
      await transaction.commit();
      return atividade;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      const atividade = await Atividade.findByPk(id);
      if (!atividade) {
        await transaction.commit();
        return null;
      }
      await atividade.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}
