'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  await queryInterface.createTable('responsaveis_assistidos', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
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

  // Adiciona índice único para evitar duplicatas
  await queryInterface.addIndex('responsaveis_assistidos', ['id_usuario', 'id_assistido'], {
    unique: true,
    name: 'unique_responsavel_assistido'
  });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('responsaveis_assistidos');
  }
};