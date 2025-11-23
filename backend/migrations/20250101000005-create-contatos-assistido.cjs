'use strict';

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
        type: Sequelize.STRING,
        allowNull: false
      },
      nome_contato: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parentesco: {
        type: Sequelize.STRING,
        allowNull: true
      },
      observacao: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ordem_prioridade: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contatos_assistido');
  }
};
