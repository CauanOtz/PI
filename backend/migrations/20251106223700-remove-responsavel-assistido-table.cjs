'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // No SQLite não precisamos remover as constraints explicitamente
    // pois elas são removidas automaticamente quando a tabela é removida

    // Remove a tabela de relacionamento
    await queryInterface.dropTable('responsaveis_assistidos');
  },

  async down(queryInterface, Sequelize) {
    // Recria a tabela de relacionamento
    await queryInterface.createTable('responsaveis_assistidos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_assistido: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'assistidos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    });

    // Recria o índice único
    await queryInterface.addConstraint('responsaveis_assistidos', {
      fields: ['id_usuario', 'id_assistido'],
      type: 'unique',
      name: 'responsaveis_assistidos_id_usuario_id_assistido_unique'
    });
  }
};