'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('filiacao_assistido', {
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
      tipo: {
        type: Sequelize.ENUM('mae', 'pai'),
        allowNull: false
      },
      nome_completo: {
        type: Sequelize.STRING(100),
        allowNull: false
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

    // Add unique constraint for assistido_id + tipo
    await queryInterface.addIndex('filiacao_assistido', ['assistido_id', 'tipo'], {
      unique: true,
      name: 'filiacao_assistido_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('filiacao_assistido');
  }
};
