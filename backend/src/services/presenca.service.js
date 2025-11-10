import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import Presenca from '../models/Presenca.model.js';
import Assistido from '../models/Assistido.model.js';
import Atividade from '../models/Atividade.model.js';

export default class PresencaService {
  static async registrarPresenca({ idAssistido, idAtividade, status, observacao, data_registro }) {
    const idAssistidoNum = Number(idAssistido);
    const idAtividadeNum = Number(idAtividade);
    const data = data_registro || null;

    // Verifica existência de assistido e atividade antes de tentar inserir para evitar erro de FK
    const assistido = await Assistido.findByPk(idAssistidoNum);
    if (!assistido) return { notFound: 'Assistido' };
    const atividade = await Atividade.findByPk(idAtividadeNum);
    if (!atividade) return { notFound: 'Atividade' };

    const result = await sequelize.transaction(async (t) => {
      const [presenca, created] = await Presenca.findOrCreate({
        where: { idAssistido: idAssistidoNum, idAtividade: idAtividadeNum, data_registro: data },
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
    if (filters.idAtividade) where.idAtividade = filters.idAtividade;
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
        { model: Atividade, as: 'atividade', attributes: ['id', 'titulo'] }
      ],
      order: [['data_registro', 'DESC']]
    });
    return presencas;
  }

  static async listByAtividade(idAtividade, { data } = {}) {
    const atividade = await Atividade.findByPk(idAtividade);
    if (!atividade) return null;
    const where = { idAtividade };
    if (data) where.data_registro = data;
    const presencas = await Presenca.findAll({ where, include: [{ model: Assistido, as: 'assistido', attributes: ['id', 'nome'] }], order: [[ 'assistido', 'nome', 'ASC' ]] });
    return { atividade, presencas };
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
    const presencas = await Presenca.findAll({ where, include: [{ model: Atividade, as: 'atividade', attributes: ['id', 'titulo', 'data'] }], order: [['data_registro', 'DESC']] });
    return { assistido, presencas };
  }

  static async getById(id) {
    const presenca = await Presenca.findByPk(id, { include: [ { model: Assistido, as: 'assistido', attributes: ['id','nome'] }, { model: Atividade, as: 'atividade', attributes: ['id','titulo','data'] } ] });
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
      const colisao = await Presenca.findOne({ where: { idAssistido: presenca.idAssistido, idAtividade: presenca.idAtividade, data_registro: campos.data_registro, id: { [Op.ne]: presenca.id } } });
      if (colisao) return { conflict: true };
    }

    await presenca.update(campos);
    await presenca.reload();
    return presenca;
  }

  static async bulkRegister(items = []) {
    const results = [];
    await sequelize.transaction(async (t) => {
      // Primeiro verificamos todas as combinações únicas de assistido/atividade/data
      const existingMap = new Map();
      for (const it of items) {
        const key = `${it.idAssistido}-${it.idAtividade}-${it.data_registro}`;
        const idAssistidoNum = Number(it.idAssistido);
        const idAtividadeNum = Number(it.idAtividade);

        // Verifica existência das entidades antes de tentar inserir
        const assistido = await Assistido.findByPk(idAssistidoNum, { transaction: t });
        if (!assistido) {
          results.push({ presenca: null, error: 'Assistido não encontrado' });
          continue;
        }
        const atividade = await Atividade.findByPk(idAtividadeNum, { transaction: t });
        if (!atividade) {
          results.push({ presenca: null, error: 'Atividade não encontrada' });
          continue;
        }

        // Verifica se já existe uma presença para esta combinação
        const existingPresenca = await Presenca.findOne({
          where: {
            idAssistido: idAssistidoNum,
            idAtividade: idAtividadeNum,
            data_registro: it.data_registro
          },
          transaction: t
        });

        if (existingPresenca) {
          results.push({ 
            presenca: null, 
            error: 'Já existe um registro de presença para este assistido nesta atividade e data' 
          });
          continue;
        }

        // Se não existe presença prévia e não é duplicata no mesmo bulk, cria a presença
        if (!existingMap.has(key)) {
          existingMap.set(key, true);
          const presenca = await Presenca.create({
            idAssistido: idAssistidoNum,
            idAtividade: idAtividadeNum,
            status: it.status,
            data_registro: it.data_registro,
            observacao: it.observacao
          }, { transaction: t });
          results.push({ presenca });
        } else {
          results.push({ 
            presenca: null, 
            error: 'Registro duplicado na mesma requisição' 
          });
        }
      }
    });
    return results;
  }
}
