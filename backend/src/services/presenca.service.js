import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import Presenca from '../models/Presenca.model.js';
import Aluno from '../models/Aluno.model.js';
import Aula from '../models/Aula.model.js';

export default class PresencaService {
  static async registrarPresenca({ idAluno, idAula, status, observacao, data_registro }) {
    const idAlunoNum = Number(idAluno);
    const idAulaNum = Number(idAula);
    const data = data_registro || null;

    // Verifica existência de aluno e aula antes de tentar inserir para evitar erro de FK
    const aluno = await Aluno.findByPk(idAlunoNum);
    if (!aluno) return { notFound: 'Aluno' };
    const aula = await Aula.findByPk(idAulaNum);
    if (!aula) return { notFound: 'Aula' };

    const result = await sequelize.transaction(async (t) => {
      const [presenca, created] = await Presenca.findOrCreate({
        where: { idAluno: idAlunoNum, idAula: idAulaNum, data_registro: data },
        defaults: { status, observacao },
        transaction: t
      });
      return { presenca, created };
    });
    return result; // { presenca, created }
  }

  static async listAll(filters = {}) {
    const where = {};
    if (filters.idAluno) where.idAluno = filters.idAluno;
    if (filters.idAula) where.idAula = filters.idAula;
    if (filters.status) where.status = filters.status;
    if (filters.dataInicio || filters.dataFim) {
      where.data_registro = {};
      if (filters.dataInicio) where.data_registro[Op.gte] = filters.dataInicio;
      if (filters.dataFim) where.data_registro[Op.lte] = filters.dataFim;
    }

    const presencas = await Presenca.findAll({
      where,
      include: [
        { model: Aluno, as: 'aluno', attributes: ['id', 'nome'] },
        { model: Aula, as: 'aula', attributes: ['id', 'titulo'] }
      ],
      order: [['data_registro', 'DESC']]
    });
    return presencas;
  }

  static async listByAula(idAula, { data } = {}) {
    const aula = await Aula.findByPk(idAula);
    if (!aula) return null;
    const where = { idAula };
    if (data) where.data_registro = data;
    const presencas = await Presenca.findAll({ where, include: [{ model: Aluno, as: 'aluno', attributes: ['id', 'nome'] }], order: [[ 'aluno', 'nome', 'ASC' ]] });
    return { aula, presencas };
  }

  static async listByAluno(idAluno, { dataInicio, dataFim } = {}) {
    const aluno = await Aluno.findByPk(idAluno);
    if (!aluno) return null;
    const where = { idAluno };
    if (dataInicio || dataFim) {
      where.data_registro = {};
      if (dataInicio) where.data_registro[Op.gte] = dataInicio;
      if (dataFim) where.data_registro[Op.lte] = dataFim;
    }
    const presencas = await Presenca.findAll({ where, include: [{ model: Aula, as: 'aula', attributes: ['id', 'titulo', 'data'] }], order: [['data_registro', 'DESC']] });
    return { aluno, presencas };
  }

  static async getById(id) {
    const presenca = await Presenca.findByPk(id, { include: [ { model: Aluno, as: 'aluno', attributes: ['id','nome'] }, { model: Aula, as: 'aula', attributes: ['id','titulo','data'] } ] });
    if (!presenca) return null;
    return presenca;
  }

  static async update(id, { status, data_registro, observacao }) {
    const presenca = await Presenca.findByPk(id);
    if (!presenca) return null;

    const campos = {};
    if (status) campos.status = status;
    if (data_registro) campos.data_registro = data_registro;
    if (observacao !== undefined) campos.observacao = observacao;

    // check collision if changing date
    if (campos.data_registro) {
      const colisao = await Presenca.findOne({ where: { idAluno: presenca.idAluno, idAula: presenca.idAula, data_registro: campos.data_registro, id: { [Op.ne]: presenca.id } } });
      if (colisao) return { conflict: true };
    }

    await presenca.update(campos);
    await presenca.reload();
    return presenca;
  }

  static async bulkRegister(items = []) {
    // items already normalized by controller in real app; here assume array of objects with idAluno,idAula,status,data_registro,observacao
    const results = [];
    await sequelize.transaction(async (t) => {
      for (const it of items) {
        const idAlunoNum = Number(it.idAluno);
        const idAulaNum = Number(it.idAula);
        // verifica existência das entidades antes de tentar inserir
        const aluno = await Aluno.findByPk(idAlunoNum, { transaction: t });
        if (!aluno) {
          results.push({ presenca: null, error: 'Aluno' });
          continue;
        }
        const aula = await Aula.findByPk(idAulaNum, { transaction: t });
        if (!aula) {
          results.push({ presenca: null, error: 'Aula' });
          continue;
        }

        await Presenca.upsert({ idAluno: it.idAluno, idAula: it.idAula, status: it.status, data_registro: it.data_registro, observacao: it.observacao }, { transaction: t });
        const pres = await Presenca.findOne({ where: { idAluno: it.idAluno, idAula: it.idAula, data_registro: it.data_registro }, transaction: t });
        results.push({ presenca: pres });
      }
    });
    return results;
  }
}
