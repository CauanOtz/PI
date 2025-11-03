import { sequelize } from '../config/database.js';
import Aula from '../models/Aula.model.js';

export default class AulaService {
  static async listAll() {
    // Simple list, controller will map DTOs
    const aulas = await Aula.findAll({ order: [['data', 'ASC'], ['horario', 'ASC']] });
    return aulas;
  }

  static async getById(id) {
    const aulaId = parseInt(id);
    if (Number.isNaN(aulaId)) {
      const err = new Error('ID da aula inválido');
      err.status = 400;
      throw err;
    }
    const aula = await Aula.findByPk(aulaId);
    if (!aula) {
      const err = new Error('Aula não encontrada');
      err.status = 404;
      throw err;
    }
    return aula;
  }

  static async create({ titulo, data, horario, descricao }) {
    const transaction = await sequelize.transaction();
    try {
      const novo = await Aula.create({ titulo, data, horario, descricao }, { transaction });
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
      const aula = await Aula.findByPk(id);
      if (!aula) {
        await transaction.commit();
        return null;
      }

      await aula.update({ titulo, data, horario, descricao }, { transaction });
      await transaction.commit();
      return aula;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      const aula = await Aula.findByPk(id);
      if (!aula) {
        await transaction.commit();
        return null;
      }
      await aula.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}
