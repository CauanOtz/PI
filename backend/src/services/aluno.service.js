// src/services/aluno.service.js
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import Aluno from '../models/Aluno.model.js';
import Usuario from '../models/Usuario.model.js';
import Documento from '../models/Documento.model.js';
import ResponsavelAluno from '../models/ResponsavelAluno.model.js';

export default class AlunoService {
  static async listAll({ page = 1, limit = 10, search, responsavelId }) {
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = {};
    if (search && typeof search === 'string') {
      const s = search.trim().toLowerCase();
      whereClause[Op.and] = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('Aluno.nome')),
        { [Op.like]: `%${s}%` }
      );
    }

    const includeClause = [
      {
        model: Usuario,
        as: 'responsaveis',
        attributes: ['id', 'nome', 'email', 'telefone'],
        through: { attributes: [] },
      },
    ];
    if (responsavelId && !isNaN(parseInt(responsavelId))) {
      includeClause[0].where = { id: parseInt(responsavelId) };
    }

    const { count, rows } = await Aluno.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: safeLimit,
      offset,
      order: [['nome', 'ASC']],
    });
    return { count, rows, page: safePage, limit: safeLimit };
  }

  static async getById(id) {
    const alunoId = parseInt(id);
    if (isNaN(alunoId)) {
      const err = new Error('ID do aluno inválido');
      err.status = 400;
      throw err;
    }
    const aluno = await Aluno.findByPk(alunoId, {
      include: [{
        model: Usuario,
        as: 'responsaveis',
        attributes: ['id', 'nome', 'email', 'telefone'],
        through: { attributes: [] },
      }],
    });
    if (!aluno) {
      const err = new Error('Aluno não encontrado');
      err.status = 404;
      throw err;
    }
    return aluno;
  }

  static async listByResponsavelId(responsavelId, { page = 1, limit = 10 }) {
    const id = parseInt(responsavelId);
    if (isNaN(id)) {
      const err = new Error('ID do responsável inválido');
      err.status = 400;
      throw err;
    }
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    const responsavel = await Usuario.findByPk(id);
    if (!responsavel) {
      const err = new Error('Responsável não encontrado');
      err.status = 404;
      throw err;
    }

    const { count, rows } = await Aluno.findAndCountAll({
      include: [{
        model: Usuario,
        as: 'responsaveis',
        where: { id },
        attributes: [],
        through: { attributes: [] },
      }],
      limit: safeLimit,
      offset,
      order: [['nome', 'ASC']],
      distinct: true,
    });
    return { count, rows, page: safePage, limit: safeLimit };
  }

  static async create({ nome, idade, endereco, contato, responsaveisIds }) {
    const transaction = await sequelize.transaction();
    try {
      const novoAluno = await Aluno.create({ nome, idade, endereco, contato }, { transaction });

      if (responsaveisIds && Array.isArray(responsaveisIds) && responsaveisIds.length > 0) {
        const responsaveis = await Usuario.findAll({
          where: { id: responsaveisIds },
          transaction,
        });
        // attach responsaveis
        await novoAluno.addResponsaveis(responsaveis, { transaction });
      }

      await transaction.commit();

      const alunoComResponsaveis = await Aluno.findByPk(novoAluno.id, {
        include: [{
          model: Usuario,
          as: 'responsaveis',
          attributes: ['id', 'nome'],
          through: { attributes: [] },
        }],
      });

      return alunoComResponsaveis;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async update(id, { nome, idade, endereco, contato, responsaveisIds }) {
    const transaction = await sequelize.transaction();
    try {
      const aluno = await Aluno.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'responsaveis',
          through: { attributes: [] }
        }]
      });

      if (!aluno) {
        await transaction.commit();
        return null;
      }

      await aluno.update({ nome, idade, endereco, contato }, { transaction });

      if (responsaveisIds && Array.isArray(responsaveisIds)) {
        const responsaveis = await Usuario.findAll({
          where: { id: responsaveisIds },
          transaction
        });
        await aluno.setResponsaveis(responsaveis, { transaction });
      }

      await transaction.commit();
      return aluno;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      const aluno = await Aluno.findByPk(id);
      if (!aluno) {
        await transaction.commit();
        return null;
      }

      // Remove documentos relacionados
      await Documento.destroy({
        where: { aluno_id: id },
        transaction
      });

      // Remove presencas relacionadas
      await sequelize.models.Presenca.destroy({
        where: { id_aluno: id },
        transaction
      });

      // Remove relacionamentos com responsáveis
      await ResponsavelAluno.destroy({
        where: { id_aluno: id },
        transaction
      });

      // Remove o aluno
      await aluno.destroy({ transaction });
      await transaction.commit();
  // Return truthy value so controller knows deletion succeeded
  return true;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}

