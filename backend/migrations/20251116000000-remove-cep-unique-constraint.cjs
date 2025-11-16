/**
 * Migration para remover constraint UNIQUE do campo CEP
 * Permite múltiplos endereços com mesmo CEP mas dados diferentes (Opção 2)
 * Mantém 3FN: compartilha apenas quando endereço completo for idêntico
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // SQLite não suporta DROP CONSTRAINT diretamente
    // Precisamos recriar a tabela sem o UNIQUE no CEP
    
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Criar tabela temporária sem o UNIQUE no CEP
      await queryInterface.createTable('enderecos_temp', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        cep: {
          type: Sequelize.STRING(9),
          allowNull: false
          // UNIQUE removido
        },
        logradouro: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        bairro: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        cidade: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        estado: {
          type: Sequelize.STRING(2),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 2. Copiar dados da tabela antiga para a nova
      await queryInterface.sequelize.query(
        `INSERT INTO enderecos_temp (id, cep, logradouro, bairro, cidade, estado, created_at, updated_at)
         SELECT id, cep, logradouro, bairro, cidade, estado, created_at, updated_at
         FROM enderecos`,
        { transaction }
      );

      // 3. Remover tabela antiga
      await queryInterface.dropTable('enderecos', { transaction });

      // 4. Renomear tabela temporária
      await queryInterface.renameTable('enderecos_temp', 'enderecos', { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverter: recriar com UNIQUE no CEP
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Criar tabela temporária COM UNIQUE no CEP
      await queryInterface.createTable('enderecos_temp', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        cep: {
          type: Sequelize.STRING(9),
          allowNull: false,
          unique: true
        },
        logradouro: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        bairro: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        cidade: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        estado: {
          type: Sequelize.STRING(2),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 2. Copiar apenas primeiro registro de cada CEP (para evitar constraint violation)
      await queryInterface.sequelize.query(
        `INSERT INTO enderecos_temp (id, cep, logradouro, bairro, cidade, estado, created_at, updated_at)
         SELECT id, cep, logradouro, bairro, cidade, estado, created_at, updated_at
         FROM enderecos
         WHERE id IN (SELECT MIN(id) FROM enderecos GROUP BY cep)`,
        { transaction }
      );

      // 3. Remover tabela atual
      await queryInterface.dropTable('enderecos', { transaction });

      // 4. Renomear tabela temporária
      await queryInterface.renameTable('enderecos_temp', 'enderecos', { transaction });
    });
  }
};
