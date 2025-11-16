import Endereco from '../models/Endereco.model.js';
import { sequelize } from '../config/database.js';

class EnderecoService {
  /**
   * Busca ou cria um endereço baseado em TODOS os campos
   * Só compartilha se o endereço completo for idêntico (mantém 3FN)
   * @param {Object} enderecoData - Dados do endereço { cep, logradouro, bairro, cidade, estado }
   * @param {Transaction} transaction - Transação do Sequelize (opcional)
   * @returns {Promise<Endereco>}
   */
  static async findOrCreate(enderecoData, transaction = null) {
    try {
      const options = {
        where: {
          cep: enderecoData.cep,
          logradouro: enderecoData.logradouro,
          bairro: enderecoData.bairro,
          cidade: enderecoData.cidade,
          estado: enderecoData.estado
        },
        defaults: {
          cep: enderecoData.cep,
          logradouro: enderecoData.logradouro,
          bairro: enderecoData.bairro,
          cidade: enderecoData.cidade,
          estado: enderecoData.estado
        }
      };

      // Se uma transação foi fornecida, usa ela
      if (transaction) {
        options.transaction = transaction;
      }

      const [endereco, created] = await Endereco.findOrCreate(options);

      return endereco;
    } catch (error) {
      console.error('Erro ao buscar/criar endereço:', error);
      throw error;
    }
  }

  /**
   * Busca endereço por CEP
   * @param {string} cep
   * @returns {Promise<Endereco|null>}
   */
  static async findByCep(cep) {
    return await Endereco.findOne({ where: { cep } });
  }

  /**
   * Atualiza endereço existente
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Endereco>}
   */
  static async update(id, data) {
    const endereco = await Endereco.findByPk(id);
    if (!endereco) {
      throw new Error('Endereço não encontrado');
    }
    return await endereco.update(data);
  }

  /**
   * Busca endereço por ID
   * @param {number} id
   * @returns {Promise<Endereco|null>}
   */
  static async findById(id) {
    return await Endereco.findByPk(id);
  }
}

export default EnderecoService;
