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
      if (!responsaveisIds || !Array.isArray(responsaveisIds) || responsaveisIds.length === 0) {
        const err = new Error('É necessário fornecer pelo menos um ID de responsável.');
        err.status = 400;
        throw err;
      }

      const responsaveisExistentes = await Usuario.findAll({
        where: { id: responsaveisIds },
        transaction,
      });
      if (responsaveisExistentes.length !== responsaveisIds.length) {
        const foundIds = responsaveisExistentes.map(r => r.id);
        const missingIds = responsaveisIds.filter(id => !foundIds.includes(id));
        const err = new Error(`IDs de responsáveis não encontrados: ${missingIds.join(', ')}`);
        err.status = 404;
        throw err;
      }

      const novoAluno = await Aluno.create({ nome, idade, endereco, contato }, { transaction });
      if (responsaveisExistentes.length > 0) {
        await novoAluno.addResponsaveis(responsaveisExistentes, { transaction });
      }
      await transaction.commit();

      const alunoComResponsaveis = await Aluno.findByPk(novoAluno.id, {
        include: [{
          model: Usuario,
          as: 'responsaveis',
          attributes: ['id', 'nome', 'email', 'telefone'],
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
      const alunoId = parseInt(id);
      if (isNaN(alunoId)) {
        const err = new Error('ID do aluno inválido');
        err.status = 400;
        throw err;
      }
      const aluno = await Aluno.findByPk(alunoId, { transaction });
      if (!aluno) {
        const err = new Error('Aluno não encontrado');
        err.status = 404;
        throw err;
      }

      const camposParaAtualizar = {};
      if (nome !== undefined) camposParaAtualizar.nome = nome;
      if (idade !== undefined) camposParaAtualizar.idade = idade;
      if (endereco !== undefined) camposParaAtualizar.endereco = endereco;
      if (contato !== undefined) camposParaAtualizar.contato = contato;
      await aluno.update(camposParaAtualizar, { transaction });

      if (responsaveisIds !== undefined) {
        if (!Array.isArray(responsaveisIds)) {
          const err = new Error('A lista de responsáveis deve ser um array de IDs.');
          err.status = 400;
          throw err;
        }
        if (responsaveisIds.length > 0) {
          const responsaveisExistentes = await Usuario.findAll({ where: { id: responsaveisIds }, transaction });
          if (responsaveisExistentes.length !== responsaveisIds.length) {
            const foundIds = responsaveisExistentes.map(r => r.id);
            const missingIds = responsaveisIds.filter(v => !foundIds.includes(v));
            const err = new Error(`IDs de responsáveis não encontrados: ${missingIds.join(', ')}`);
            err.status = 404;
            throw err;
          }
          await aluno.setResponsaveis(responsaveisExistentes, { transaction });
        } else {
          await aluno.setResponsaveis([], { transaction });
        }
      }

      await transaction.commit();

      const alunoAtualizado = await Aluno.findByPk(aluno.id, {
        include: [{
          model: Usuario,
          as: 'responsaveis',
          attributes: ['id', 'nome', 'email', 'telefone'],
          through: { attributes: [] },
        }],
      });
      return alunoAtualizado;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      const alunoId = parseInt(id);
      if (isNaN(alunoId)) {
        const err = new Error('ID do aluno inválido');
        err.status = 400;
        throw err;
      }
      const aluno = await Aluno.findByPk(alunoId, { transaction });
      if (!aluno) {
        const err = new Error('Aluno não encontrado');
        err.status = 404;
        throw err;
      }

      await Documento.destroy({ where: { alunoId }, transaction });
      if (sequelize.models.Presenca) {
        await sequelize.models.Presenca.destroy({ where: { idAluno: alunoId }, transaction });
      } else {
        await sequelize.query('DELETE FROM presencas WHERE id_aluno = ?', { replacements: [alunoId], transaction });
      }
      await ResponsavelAluno.destroy({ where: { id_aluno: alunoId }, transaction });
      await aluno.destroy({ transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}

