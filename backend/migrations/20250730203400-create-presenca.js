'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presencas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_aluno: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'alunos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_aula: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'aulas',
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
        defaultValue: Sequelize.NOW
      },
      observacao: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Adiciona índice único para evitar duplicatas
    await queryInterface.addIndex('presencas', 
      ['id_aluno', 'id_aula', 'data_registro'],
      {
        unique: true,
        name: 'unique_presenca_aluno_aula_data'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('presencas');
  }
};
