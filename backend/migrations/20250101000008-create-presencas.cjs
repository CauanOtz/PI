'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presencas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      id_atividade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'atividades',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('presente', 'falta', 'atraso', 'falta_justificada'),
        allowNull: false,
        defaultValue: 'presente'
      },
      data_registro: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      observacao: {
        type: Sequelize.STRING,
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

    // Adicionar índice único composto
    await queryInterface.addIndex('presencas', ['id_assistido', 'id_atividade', 'data_registro'], {
      unique: true,
      name: 'presencas_unique_assistido_atividade_data'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('presencas');
  }
};
