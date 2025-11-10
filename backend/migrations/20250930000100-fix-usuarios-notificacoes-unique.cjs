'use strict';

/**
 * Esta migração recria a tabela usuarios_notificacoes removendo as
 * restrições únicas em cada coluna individual (notificacao_id e cpf_usuario)
 * e mantendo apenas a restrição única composta (notificacao_id, cpf_usuario).
 *
 * O SQLite não permite remover constraints diretamente, por isso a estratégia é:
 *  - Renomear a tabela atual para um nome temporário
 *  - Criar uma nova tabela com o esquema correto
 *  - Copiar os dados (eliminando duplicatas, se existirem)
 *  - Remover a tabela antiga
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Se a tabela original não existir, nada a fazer
      const [tableInfo] = await queryInterface.sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios_notificacoes';",
        { transaction }
      );
      if (!tableInfo || tableInfo.length === 0) {
        await transaction.commit();
        return;
      }

      const tempTable = 'usuarios_notificacoes__old_unique';

      await queryInterface.renameTable('usuarios_notificacoes', tempTable, { transaction });

      await queryInterface.createTable('usuarios_notificacoes', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        notificacao_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'notificacoes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        cpf_usuario: {
          type: Sequelize.STRING(14),
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'cpf'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        lida: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        data_leitura: {
          type: Sequelize.DATE,
          allowNull: true
        },
        criado_em: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        atualizado_em: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addConstraint('usuarios_notificacoes', {
        fields: ['notificacao_id', 'cpf_usuario'],
        type: 'unique',
        name: 'unique_notificacao_usuario',
        transaction
      });

      await queryInterface.addIndex('usuarios_notificacoes', ['notificacao_id'], {
        name: 'idx_usuarios_notificacoes_notificacao_id',
        unique: false,
        transaction
      });

      await queryInterface.addIndex('usuarios_notificacoes', ['cpf_usuario'], {
        name: 'idx_usuarios_notificacoes_cpf_usuario',
        unique: false,
        transaction
      });

      await queryInterface.sequelize.query(
        `INSERT OR IGNORE INTO usuarios_notificacoes (notificacao_id, cpf_usuario, lida, data_leitura, criado_em, atualizado_em)
         SELECT notificacao_id, cpf_usuario, lida, data_leitura, criado_em, atualizado_em FROM ${tempTable};`,
        { transaction }
      );

      await queryInterface.dropTable(tempTable, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [tableInfo] = await queryInterface.sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios_notificacoes';",
        { transaction }
      );
      if (!tableInfo || tableInfo.length === 0) {
        await transaction.commit();
        return;
      }

      const tempTable = 'usuarios_notificacoes__temp_down';

      await queryInterface.renameTable('usuarios_notificacoes', tempTable, { transaction });

      await queryInterface.createTable('usuarios_notificacoes', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        notificacao_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'notificacoes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        cpf_usuario: {
          type: Sequelize.STRING(14),
          allowNull: false,
          unique: true,
          references: {
            model: 'usuarios',
            key: 'cpf'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        lida: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        data_leitura: {
          type: Sequelize.DATE,
          allowNull: true
        },
        criado_em: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        atualizado_em: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.sequelize.query(
        `INSERT OR IGNORE INTO usuarios_notificacoes (notificacao_id, cpf_usuario, lida, data_leitura, criado_em, atualizado_em)
         SELECT notificacao_id, cpf_usuario, lida, data_leitura, criado_em, atualizado_em FROM ${tempTable};`,
        { transaction }
      );

      await queryInterface.dropTable(tempTable, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
