// src/services/assistido.service.js
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import Assistido from '../models/Assistido.model.js';
import Endereco from '../models/Endereco.model.js';
import ContatoAssistido from '../models/ContatoAssistido.model.js';
import FiliacaoAssistido from '../models/FiliacaoAssistido.model.js';
import EnderecoService from './endereco.service.js';
import ContatoAssistidoService from './contato-assistido.service.js';
import FiliacaoAssistidoService from './filiacao-assistido.service.js';

export default class AssistidoService {
  /**
   * Lista todos os assistidos com paginação e includes
   */
  static async listAll({ page = 1, limit = 10, search }) {
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = {};
    if (search && typeof search === 'string') {
      const s = search.trim().toLowerCase();
      whereClause[Op.and] = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('Assistido.nome')),
        { [Op.like]: `%${s}%` }
      );
    }

    const { count, rows } = await Assistido.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Endereco,
          as: 'endereco',
          required: false
        },
        {
          model: ContatoAssistido,
          as: 'contatos',
          required: false,
          separate: true,
          order: [['ordem_prioridade', 'ASC']]
        },
        {
          model: FiliacaoAssistido,
          as: 'filiacao',
          required: false,
          separate: true
        }
      ],
      limit: safeLimit,
      offset,
      order: [['nome', 'ASC']],
      distinct: true
    });

    return { count, rows, page: safePage, limit: safeLimit };
  }

  /**
   * Busca assistido por ID com todos os relacionamentos
   */
  static async getById(id) {
    const assistidoId = parseInt(id);
    if (isNaN(assistidoId) || assistidoId <= 0) {
      throw new Error('ID do assistido inválido');
    }

    const assistido = await Assistido.findByPk(assistidoId, {
      include: [
        {
          model: Endereco,
          as: 'endereco',
          required: false
        },
        {
          model: ContatoAssistido,
          as: 'contatos',
          required: false,
          order: [['ordem_prioridade', 'ASC']]
        },
        {
          model: FiliacaoAssistido,
          as: 'filiacao',
          required: false
        }
      ]
    });

    if (!assistido) {
      throw new Error('Assistido não encontrado');
    }

    return assistido;
  }

  /**
   * Cria novo assistido com endereço, contatos e filiação
   */
  static async create({ 
    nome, 
    dataNascimento, 
    sexo, 
    cartaoSus = null, 
    rg = null, 
    endereco = null, // { cep, logradouro, bairro, cidade, estado }
    numero = null,
    complemento = null,
    contatos = [], // Array de contatos
    filiacao = null, // { mae, pai }
    problemasSaude = null
  }) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('Dados recebidos:', {
        nome, dataNascimento, sexo, cartaoSus, rg,
        endereco, numero, complemento, contatos, filiacao, problemasSaude
      });
      console.log('Tipo de contatos:', typeof contatos);
      console.log('contatos é array?', Array.isArray(contatos));
      console.log('contatos length:', contatos ? contatos.length : 'undefined/null');
      console.log('contatos value:', JSON.stringify(contatos));

      let enderecoId = null;

      // 1. Criar ou buscar endereço se fornecido
      if (endereco && endereco.cep) {
        const enderecoModel = await EnderecoService.findOrCreate(endereco);
        enderecoId = enderecoModel.id;
      }

      // 2. Criar assistido
      const assistido = await Assistido.create({
        nome,
        dataNascimento,
        sexo,
        cartaoSus,
        rg,
        enderecoId,
        numero,
        complemento,
        problemasSaude
      }, { transaction });

      // 3. Criar contatos (mínimo 1 obrigatório)
      if (!contatos || contatos.length === 0) {
        throw new Error('É obrigatório cadastrar pelo menos um contato');
      }

      await ContatoAssistidoService.createMultiple(
        assistido.id,
        contatos,
        transaction
      );

      // 4. Criar filiação (opcional)
      if (filiacao) {
        await FiliacaoAssistidoService.createFromObject(
          assistido.id,
          filiacao,
          transaction
        );
      }

      await transaction.commit();

      // Retornar assistido completo com relacionamentos
      return await this.getById(assistido.id);
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao criar assistido:', error);
      throw error;
    }
  }

  /**
   * Atualiza assistido existente
   */
  static async update(id, { 
    nome, 
    dataNascimento, 
    sexo, 
    cartaoSus = null, 
    rg = null, 
    endereco = null,
    numero = null,
    complemento = null,
    contatos = null,
    filiacao = null,
    problemasSaude = null
  }) {
    const transaction = await sequelize.transaction();
    
    try {
      const assistido = await Assistido.findByPk(id, { transaction });
      if (!assistido) {
        throw new Error('Assistido não encontrado');
      }

      // 1. Atualizar ou criar novo endereço
      let enderecoId = assistido.enderecoId;
      if (endereco && endereco.cep) {
        const enderecoModel = await EnderecoService.findOrCreate(endereco);
        enderecoId = enderecoModel.id;
      }

      // 2. Atualizar dados básicos do assistido
      await assistido.update({
        nome,
        dataNascimento,
        sexo,
        cartaoSus,
        rg,
        enderecoId,
        numero,
        complemento,
        problemasSaude
      }, { transaction });

      // 3. Atualizar contatos (se fornecidos)
      if (contatos && Array.isArray(contatos)) {
        if (contatos.length === 0) {
          throw new Error('É obrigatório ter pelo menos um contato');
        }
        await ContatoAssistidoService.replaceAll(id, contatos, transaction);
      }

      // 4. Atualizar filiação (se fornecida)
      if (filiacao) {
        await FiliacaoAssistidoService.createFromObject(id, filiacao, transaction);
      }

      await transaction.commit();

      // Retornar assistido atualizado com relacionamentos
      return await this.getById(id);
      
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar assistido:', error);
      throw error;
    }
  }

  /**
   * Remove assistido
   */
  static async delete(id) {
    const assistido = await Assistido.findByPk(id);
    if (!assistido) {
      throw new Error('Assistido não encontrado');
    }
    
    await assistido.destroy();
    return true;
  }

  /**
   * Conta total de assistidos
   */
  static async count() {
    return await Assistido.count();
  }
}
