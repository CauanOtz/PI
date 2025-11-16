import ContatoAssistido from '../models/ContatoAssistido.model.js';
import { sequelize } from '../config/database.js';

class ContatoAssistidoService {
  /**
   * Cria um novo contato para um assistido
   * @param {number} assistidoId
   * @param {Object} contatoData
   * @returns {Promise<ContatoAssistido>}
   */
  static async create(assistidoId, contatoData) {
    return await ContatoAssistido.create({
      assistidoId,
      telefone: contatoData.telefone,
      nomeContato: contatoData.nomeContato,
      parentesco: contatoData.parentesco,
      observacao: contatoData.observacao,
      ordemPrioridade: contatoData.ordemPrioridade || 1
    });
  }

  /**
   * Cria múltiplos contatos para um assistido
   * @param {number} assistidoId
   * @param {Array} contatosArray - Array de objetos de contato
   * @param {Object} transaction - Transação do Sequelize (opcional)
   * @returns {Promise<Array<ContatoAssistido>>}
   */
  static async createMultiple(assistidoId, contatosArray, transaction = null) {
    if (!contatosArray || contatosArray.length === 0) {
      return [];
    }

    const contatosComId = contatosArray.map((contato, index) => ({
      assistidoId,
      telefone: contato.telefone,
      nomeContato: contato.nomeContato || null,
      parentesco: contato.parentesco || null,
      observacao: contato.observacao || null,
      ordemPrioridade: contato.ordemPrioridade || index + 1
    }));

    return await ContatoAssistido.bulkCreate(contatosComId, { transaction });
  }

  /**
   * Atualiza um contato existente
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<ContatoAssistido>}
   */
  static async update(id, data) {
    const contato = await ContatoAssistido.findByPk(id);
    if (!contato) {
      throw new Error('Contato não encontrado');
    }
    return await contato.update(data);
  }

  /**
   * Remove um contato
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const contato = await ContatoAssistido.findByPk(id);
    if (!contato) {
      throw new Error('Contato não encontrado');
    }
    await contato.destroy();
    return true;
  }

  /**
   * Lista todos os contatos de um assistido ordenados por prioridade
   * @param {number} assistidoId
   * @returns {Promise<Array<ContatoAssistido>>}
   */
  static async findByAssistido(assistidoId) {
    return await ContatoAssistido.findAll({
      where: { assistidoId },
      order: [['ordemPrioridade', 'ASC']]
    });
  }

  /**
   * Remove todos os contatos de um assistido
   * @param {number} assistidoId
   * @param {Object} transaction
   * @returns {Promise<number>}
   */
  static async deleteByAssistido(assistidoId, transaction = null) {
    return await ContatoAssistido.destroy({
      where: { assistidoId },
      transaction
    });
  }

  /**
   * Atualiza todos os contatos de um assistido
   * (Remove os antigos e cria novos)
   * @param {number} assistidoId
   * @param {Array} novosContatos
   * @param {Object} transaction
   * @returns {Promise<Array<ContatoAssistido>>}
   */
  static async replaceAll(assistidoId, novosContatos, transaction = null) {
    await this.deleteByAssistido(assistidoId, transaction);
    return await this.createMultiple(assistidoId, novosContatos, transaction);
  }
}

export default ContatoAssistidoService;
