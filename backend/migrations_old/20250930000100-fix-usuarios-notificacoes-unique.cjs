'use strict';

/**
 * Esta migração recria a tabela usuarios_notificacoes removendo as
 * restrições únicas em cada coluna individual (notificacao_id e cpf_usuario)
 * e mantendo apenas a restrição única composta (notificacao_id, cpf_usuario).
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      if (dialect === 'sqlite') {
        // SQLite: verificar se tabela existe
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
            references: { model: 'notificacoes', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          cpf_usuario: {
            type: Sequelize.STRING(14),
            allowNull: false,
            references: { model: 'usuarios', key: 'cpf' },
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

        await queryInterface.sequelize.query(
          `INSERT OR IGNORE INTO usuarios_notificacoes (notificacao_id, cpf_usuario, lida, data_leitura, criado_em, atualizado_em)
           SELECT notificacao_id, cpf_usuario, lida, data_leitura, criado_em, atualizado_em FROM ${tempTable};`,
          { transaction }
        );

        await queryInterface.dropTable(tempTable, { transaction });
        
      } else if (dialect === 'postgres') {
        // PostgreSQL: verificar se tabela existe
        const [tableInfo] = await queryInterface.sequelize.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios_notificacoes';",
          { type: Sequelize.QueryTypes.SELECT, transaction }
        );
        
        if (!tableInfo || tableInfo.length === 0) {
          await transaction.commit();
          return;
        }

        // Remover constraints UNIQUE existentes (se houver)
        const constraints = await queryInterface.sequelize.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'usuarios_notificacoes' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name LIKE 'usuarios_notificacoes_%_key';
        `, { type: Sequelize.QueryTypes.SELECT, transaction });

        for (const constraint of constraints) {
          await queryInterface.sequelize.query(
            `ALTER TABLE usuarios_notificacoes DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}";`,
            { transaction }
          );
        }

        // Criar constraint única composta (se não existir)
        await queryInterface.sequelize.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'unique_notificacao_usuario'
            ) THEN
              ALTER TABLE usuarios_notificacoes
              ADD CONSTRAINT unique_notificacao_usuario UNIQUE (notificacao_id, cpf_usuario);
            END IF;
          END $$;
        `, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    throw new Error('Migração irreversível: rollback manual requerido.');
  }
};
