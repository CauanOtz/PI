'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contatos_assistido', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      assistido_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'assistidos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      telefone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      nome_contato: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      parentesco: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      observacao: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ordem_prioridade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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

    // Add unique constraint for assistido_id + telefone
    await queryInterface.addIndex('contatos_assistido', ['assistido_id', 'telefone'], {
      unique: true,
      name: 'contatos_assistido_telefone_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contatos_assistido');
  }
};
