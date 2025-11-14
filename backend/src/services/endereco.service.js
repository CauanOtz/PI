import Endereco from '../models/Endereco.model.js';
import { sequelize } from '../config/database.js';

class EnderecoService {
  /**
   * Busca ou cria um endereço baseado no CEP
   * @param {Object} enderecoData - Dados do endereço { cep, logradouro, bairro, cidade, estado }
   * @returns {Promise<Endereco>}
   */
  static async findOrCreate(enderecoData) {
    try {
      const [endereco, created] = await Endereco.findOrCreate({
        where: { cep: enderecoData.cep },
        defaults: {
          logradouro: enderecoData.logradouro,
          bairro: enderecoData.bairro,
          cidade: enderecoData.cidade,
          estado: enderecoData.estado
        }
      });

      // Se não foi criado mas os dados são diferentes, atualiza
      if (!created) {
        const needsUpdate = 
          (enderecoData.logradouro && endereco.logradouro !== enderecoData.logradouro) ||
          (enderecoData.bairro && endereco.bairro !== enderecoData.bairro) ||
          (enderecoData.cidade && endereco.cidade !== enderecoData.cidade) ||
          (enderecoData.estado && endereco.estado !== enderecoData.estado);

        if (needsUpdate) {
          await endereco.update({
            logradouro: enderecoData.logradouro || endereco.logradouro,
            bairro: enderecoData.bairro || endereco.bairro,
            cidade: enderecoData.cidade || endereco.cidade,
            estado: enderecoData.estado || endereco.estado
          });
        }
      }

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
