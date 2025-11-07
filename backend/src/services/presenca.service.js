import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import Presenca from '../models/Presenca.model.js';
import Assistido from '../models/Assistido.model.js';
import Aula from '../models/Aula.model.js';

export default class PresencaService {
  static async registrarPresenca({ idAssistido, idAula, status, observacao, data_registro }) {
    const idAssistidoNum = Number(idAssistido);
    const idAulaNum = Number(idAula);
    const data = data_registro || null;

    // Verifica existência de assistido e aula antes de tentar inserir para evitar erro de FK
    const assistido = await Assistido.findByPk(idAssistidoNum);
    if (!assistido) return { notFound: 'Assistido' };
    const aula = await Aula.findByPk(idAulaNum);
    if (!aula) return { notFound: 'Aula' };

    const result = await sequelize.transaction(async (t) => {
      const [presenca, created] = await Presenca.findOrCreate({
        where: { idAssistido: idAssistidoNum, idAula: idAulaNum, data_registro: data },
        defaults: { status, observacao },
        transaction: t
      });
      return { presenca, created };
    });
    return result; // { presenca, created }
  }

  static async listAll(filters = {}) {
    const where = {};
    if (filters.idAssistido) where.idAssistido = filters.idAssistido;
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
        { model: Assistido, as: 'assistido', attributes: ['id', 'nome'] },
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
    const presencas = await Presenca.findAll({ where, include: [{ model: Assistido, as: 'assistido', attributes: ['id', 'nome'] }], order: [[ 'assistido', 'nome', 'ASC' ]] });
    return { aula, presencas };
  }

  static async listByAssistido(idAssistido, { dataInicio, dataFim } = {}) {
    const assistido = await Assistido.findByPk(idAssistido);
    if (!assistido) return null;
    const where = { idAssistido };
    if (dataInicio || dataFim) {
      where.data_registro = {};
      if (dataInicio) where.data_registro[Op.gte] = dataInicio;
      if (dataFim) where.data_registro[Op.lte] = dataFim;
    }
    const presencas = await Presenca.findAll({ where, include: [{ model: Aula, as: 'aula', attributes: ['id', 'titulo', 'data'] }], order: [['data_registro', 'DESC']] });
    return { assistido, presencas };
  }

  static async getById(id) {
    const presenca = await Presenca.findByPk(id, { include: [ { model: Assistido, as: 'assistido', attributes: ['id','nome'] }, { model: Aula, as: 'aula', attributes: ['id','titulo','data'] } ] });
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
      const colisao = await Presenca.findOne({ where: { idAssistido: presenca.idAssistido, idAula: presenca.idAula, data_registro: campos.data_registro, id: { [Op.ne]: presenca.id } } });
      if (colisao) return { conflict: true };
    }

    await presenca.update(campos);
    await presenca.reload();
    return presenca;
  }

  static async bulkRegister(items = []) {
    // items already normalized by controller in real app; here assume array of objects with idAssistido,idAula,status,data_registro,observacao
    const results = [];
    await sequelize.transaction(async (t) => {
      for (const it of items) {
        const idAssistidoNum = Number(it.idAssistido);
        const idAulaNum = Number(it.idAula);
        // verifica existência das entidades antes de tentar inserir
        const assistido = await Assistido.findByPk(idAssistidoNum, { transaction: t });
        if (!assistido) {
          results.push({ presenca: null, error: 'Assistido' });
          continue;
        }
        const aula = await Aula.findByPk(idAulaNum, { transaction: t });
        if (!aula) {
          results.push({ presenca: null, error: 'Aula' });
          continue;
        }

        await Presenca.upsert({ idAssistido: it.idAssistido, idAula: it.idAula, status: it.status, data_registro: it.data_registro, observacao: it.observacao }, { transaction: t });
        const pres = await Presenca.findOne({ where: { idAssistido: it.idAssistido, idAula: it.idAula, data_registro: it.data_registro }, transaction: t });
        results.push({ presenca: pres });
      }
    });
    return results;
  }
}
