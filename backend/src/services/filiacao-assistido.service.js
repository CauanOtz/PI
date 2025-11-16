import FiliacaoAssistido from '../models/FiliacaoAssistido.model.js';
import { sequelize } from '../config/database.js';

class FiliacaoAssistidoService {
  /**
   * Cria ou atualiza filiação (mãe ou pai)
   * @param {number} assistidoId
   * @param {string} tipo - 'mae' ou 'pai'
   * @param {string} nomeCompleto
   * @param {Object} transaction - Transação do Sequelize (opcional)
   * @returns {Promise<FiliacaoAssistido>}
   */
  static async createOrUpdate(assistidoId, tipo, nomeCompleto, transaction = null) {
    if (!nomeCompleto || !nomeCompleto.trim()) {
      return null;
    }

    const [filiacao, created] = await FiliacaoAssistido.findOrCreate({
      where: { assistidoId, tipo },
      defaults: { nomeCompleto: nomeCompleto.trim() },
      transaction
    });

    if (!created && filiacao.nomeCompleto !== nomeCompleto.trim()) {
      await filiacao.update({ nomeCompleto: nomeCompleto.trim() }, { transaction });
    }

    return filiacao;
  }

  /**
   * Cria filiação a partir de objeto com mae/pai
   * @param {number} assistidoId
   * @param {Object} filiacaoData - { mae: string, pai: string }
   * @param {Object} transaction
   * @returns {Promise<Array<FiliacaoAssistido>>}
   */
  static async createFromObject(assistidoId, filiacaoData, transaction = null) {
    const filiacoes = [];

    if (filiacaoData.mae) {
      const mae = await this.createOrUpdate(assistidoId, 'mae', filiacaoData.mae, transaction);
      if (mae) filiacoes.push(mae);
    }

    if (filiacaoData.pai) {
      const pai = await this.createOrUpdate(assistidoId, 'pai', filiacaoData.pai, transaction);
      if (pai) filiacoes.push(pai);
    }

    return filiacoes;
  }

  /**
   * Busca filiação de um assistido
   * @param {number} assistidoId
   * @returns {Promise<Array<FiliacaoAssistido>>}
   */
  static async findByAssistido(assistidoId) {
    return await FiliacaoAssistido.findAll({
      where: { assistidoId }
    });
  }

  /**
   * Retorna objeto com mae e pai separados
   * @param {number} assistidoId
   * @returns {Promise<{mae: string|null, pai: string|null}>}
   */
  static async getFiliacaoObject(assistidoId) {
    const filiacoes = await this.findByAssistido(assistidoId);
    
    const mae = filiacoes.find(f => f.tipo === 'mae');
    const pai = filiacoes.find(f => f.tipo === 'pai');

    return {
      mae: mae?.nomeCompleto || null,
      pai: pai?.nomeCompleto || null
    };
  }

  /**
   * Remove filiação específica
   * @param {number} assistidoId
   * @param {string} tipo - 'mae' ou 'pai'
   * @param {Object} transaction
   * @returns {Promise<number>}
   */
  static async delete(assistidoId, tipo, transaction = null) {
    return await FiliacaoAssistido.destroy({
      where: { assistidoId, tipo },
      transaction
    });
  }

  /**
   * Remove toda a filiação de um assistido
   * @param {number} assistidoId
   * @param {Object} transaction
   * @returns {Promise<number>}
   */
  static async deleteAll(assistidoId, transaction = null) {
    return await FiliacaoAssistido.destroy({
      where: { assistidoId },
      transaction
    });
  }
}

export default FiliacaoAssistidoService;
