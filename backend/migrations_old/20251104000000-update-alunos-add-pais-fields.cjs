'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Adicionar campos pai e mae
    await queryInterface.addColumn('alunos', 'pai', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('alunos', 'mae', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remover campos pai e mae
    await queryInterface.removeColumn('alunos', 'pai');
    await queryInterface.removeColumn('alunos', 'mae');
  }
};