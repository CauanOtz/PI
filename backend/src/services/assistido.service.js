// src/services/assistido.service.js
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import Assistido from '../models/Assistido.model.js';
import Documento from '../models/Documento.model.js';

export default class AssistidoService {
  static async listAll({ page = 1, limit = 10, search, responsavelId }) {
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
      attributes: [
        'id',
        'nome',
        'dataNascimento',
        'sexo',
        'cartaoSus',
        'rg',
        'endereco',
        'bairro',
        'cep',
        'cidade',
        'contato',
        'problemasSaude',
        'pai',
        'mae',
        'created_at',
        'updated_at'
      ],
      where: whereClause,
      // Removida a inclusão de responsáveis
      limit: safeLimit,
      offset,
      order: [['nome', 'ASC']],
    });
    return { count, rows, page: safePage, limit: safeLimit };
  }

  static async getById(id) {
    const assistidoId = parseInt(id);
    if (isNaN(assistidoId)) {
      const err = new Error('ID do assistido inválido');
      err.status = 400;
      throw err;
    }
    const assistido = await Assistido.findByPk(assistidoId, {
      attributes: [
        'id',
        'nome',
        'dataNascimento',
        'sexo',
        'cartaoSus',
        'rg',
        'endereco',
        'bairro',
        'cep',
        'cidade',
        'contato',
        'problemasSaude',
        'pai',
        'mae',
        'created_at',
        'updated_at'
      ],
    });
    if (!assistido) {
      const err = new Error('Assistido não encontrado');
      err.status = 404;
      throw err;
    }
    return assistido;
  }

  // Método removido pois não é mais necessário após a remoção da funcionalidade de responsáveis

  static async create({ 
    nome, 
    dataNascimento, 
    sexo, 
    cartaoSus, 
    rg, 
    endereco, 
    bairro, 
    cep, 
    cidade, 
    contato, 
    problemasSaude, 
    pai, 
    mae 
  }) {
    // Primeiro, vamos verificar os índices da tabela
    try {
      const [indexes] = await sequelize.query(`
        SELECT * FROM sqlite_master 
        WHERE type = 'index' 
        AND tbl_name = 'assistidos';
      `);
      console.log('Índices encontrados:', indexes);

      const [indexInfo] = await sequelize.query(`
        PRAGMA index_list('assistidos');
      `);
      console.log('Informações dos índices:', indexInfo);

      if (cartaoSus) {
        const [existingAssistido] = await sequelize.query(`
          SELECT id FROM assistidos WHERE cartao_sus = :cartaoSus;
        `, {
          replacements: { cartaoSus }
        });
        console.log('Assistidos com mesmo cartão SUS:', existingAssistido);
      }
    } catch (error) {
      console.error('Erro ao verificar índices:', error);
    }

    const transaction = await sequelize.transaction();
    
    try {
      console.log('Dados recebidos:', {
        nome, 
        dataNascimento, 
        sexo, 
        cartaoSus, 
        rg, 
        endereco, 
        bairro, 
        cep, 
        cidade, 
        contato, 
        problemasSaude, 
        pai, 
        mae
      });

      // Primeiro valida os dados antes de tentar criar
      const assistido = Assistido.build({ 
        nome, 
        dataNascimento, 
        sexo, 
        cartaoSus, 
        rg, 
        endereco, 
        bairro, 
        cep, 
        cidade, 
        contato, 
        problemasSaude, 
        pai, 
        mae 
      });
      
      try {
        await assistido.validate();
      } catch (validationError) {
        console.error('Detalhes do erro de validação:', {
          name: validationError.name,
          message: validationError.message,
          errors: validationError.errors?.map(err => ({
            path: err.path,
            value: err.value,
            message: err.message,
            type: err.type
          }))
        });
        throw validationError;
      }

      // Se passou na validação, tenta criar usando o modelo
      try {
        const novoAssistido = await assistido.save({ transaction });
        await transaction.commit();
        return novoAssistido;
      } catch (modelError) {
        console.error('Erro ao criar usando modelo:', modelError);
        
        // Se falhou, tenta inserção direta via SQL
        const [result] = await sequelize.query(`
          INSERT INTO assistidos (
            nome, 
            data_nascimento, 
            sexo, 
            cartao_sus, 
            rg, 
            endereco, 
            bairro, 
            cep, 
            cidade, 
            contato, 
            problemas_saude, 
            pai, 
            mae,
            created_at,
            updated_at
          ) VALUES (
            :nome,
            :dataNascimento,
            :sexo,
            :cartaoSus,
            :rg,
            :endereco,
            :bairro,
            :cep,
            :cidade,
            :contato,
            :problemasSaude,
            :pai,
            :mae,
            datetime('now'),
            datetime('now')
          )
          RETURNING id;
        `, {
          replacements: {
            nome, 
            dataNascimento, 
            sexo,
            cartaoSus,
            rg,
            endereco,
            bairro,
            cep,
            cidade,
            contato,
            problemasSaude,
            pai,
            mae
          },
          transaction,
          type: sequelize.QueryTypes.INSERT
        });

        if (result && result[0]?.id) {
          const assistidoCriado = await Assistido.findByPk(result[0].id);
          await transaction.commit();
          return assistidoCriado;
        }
        
        throw new Error('Não foi possível criar o assistido');
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(id, { 
    nome, 
    dataNascimento, 
    sexo, 
    cartaoSus, 
    rg, 
    endereco, 
    bairro, 
    cep, 
    cidade, 
    contato, 
    problemasSaude, 
    pai, 
    mae 
  }) {
    const transaction = await sequelize.transaction();
    try {
      const assistido = await Assistido.findByPk(id);

      if (!assistido) {
        await transaction.commit();
        return null;
      }

      await assistido.update({ 
        nome, 
        dataNascimento, 
        sexo, 
        cartaoSus, 
        rg, 
        endereco, 
        bairro, 
        cep, 
        cidade, 
        contato, 
        problemasSaude, 
        pai, 
        mae 
      }, { transaction });

      await transaction.commit();
      return assistido;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  static async remove(id) {
    const transaction = await sequelize.transaction();
    try {
      const assistido = await Assistido.findByPk(id);
      if (!assistido) {
        await transaction.commit();
        return null;
      }

      // Remove documentos relacionados
      await Documento.destroy({
        where: { assistido_id: id },
        transaction
      });

      // Remove presencas relacionadas
      await sequelize.models.Presenca.destroy({
        where: { id_assistido: id },
        transaction
      });

      // Removemos a limpeza de responsáveis pois a tabela não existe mais

      // Remove o assistido
      await assistido.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }
}