'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primeiro adiciona a coluna sem a restrição unique
    await queryInterface.addColumn('usuarios', 'cpf', {
      type: Sequelize.STRING(14),
      allowNull: true
    });

    // Depois adiciona o índice unique separadamente
    await queryInterface.addIndex('usuarios', ['cpf'], {
      unique: true,
      name: 'usuarios_cpf_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove o índice primeiro
    await queryInterface.removeIndex('usuarios', 'usuarios_cpf_unique');
    
    // Depois remove a coluna
    await queryInterface.removeColumn('usuarios', 'cpf');
  }
};
