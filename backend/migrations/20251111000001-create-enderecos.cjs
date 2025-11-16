'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enderecos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cep: {
        type: Sequelize.STRING(9),
        allowNull: false
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('enderecos');
  }
};
