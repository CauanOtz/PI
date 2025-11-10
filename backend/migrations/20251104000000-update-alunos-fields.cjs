'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  // Primeiro removemos a coluna idade
  await queryInterface.removeColumn('alunos', 'idade');

  // Adicionamos as novas colunas
  await queryInterface.addColumn('alunos', 'data_nascimento', {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW // Temporário para registros existentes
  });

  await queryInterface.addColumn('alunos', 'sexo', {
    type: Sequelize.STRING(10),
    allowNull: false,
    defaultValue: 'Feminino', // Temporário para registros existentes
    validate: {
      isIn: [['Feminino', 'Masculino']]
    }
  });

  await queryInterface.addColumn('alunos', 'cartao_sus', {
    type: Sequelize.STRING(20),
    allowNull: true
  });

  await queryInterface.addColumn('alunos', 'rg', {
    type: Sequelize.STRING(20),
    allowNull: true
  });

  await queryInterface.addColumn('alunos', 'bairro', {
    type: Sequelize.STRING(100),
    allowNull: true
  });

  await queryInterface.addColumn('alunos', 'cep', {
    type: Sequelize.STRING(9),
    allowNull: true
  });

  await queryInterface.addColumn('alunos', 'cidade', {
    type: Sequelize.STRING(100),
    allowNull: true
  });

  await queryInterface.addColumn('alunos', 'problemas_saude', {
    type: Sequelize.STRING(1000),
    allowNull: true
  });
  },

  async down(queryInterface, Sequelize) {
  // Removemos todas as novas colunas
  await queryInterface.removeColumn('alunos', 'problemas_saude');
  await queryInterface.removeColumn('alunos', 'cidade');
  await queryInterface.removeColumn('alunos', 'cep');
  await queryInterface.removeColumn('alunos', 'bairro');
  await queryInterface.removeColumn('alunos', 'rg');
  await queryInterface.removeColumn('alunos', 'cartao_sus');
  await queryInterface.removeColumn('alunos', 'sexo');
  await queryInterface.removeColumn('alunos', 'data_nascimento');

  // Readicionamos a coluna idade
  await queryInterface.addColumn('alunos', 'idade', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  });
  }
};