'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  // 1. Criar uma tabela temporária sem a restrição UNIQUE
  await queryInterface.addColumn('usuarios', 'cpf_temp', {
    type: Sequelize.STRING(14),
    allowNull: true
  });

  // 2. Copiar dados (se necessário)
  // Aqui você pode copiar dados de outra coluna ou deixar como null

  // 3. Remover a coluna antiga
  await queryInterface.removeColumn('usuarios', 'cpf');

  // 4. Renomear a coluna temporária
  await queryInterface.renameColumn('usuarios', 'cpf_temp', 'cpf');

  // 5. Adicionar a restrição UNIQUE
  await queryInterface.addConstraint('usuarios', {
    fields: ['cpf'],
    type: 'unique',
    name: 'usuarios_cpf_unique'
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('usuarios', 'usuarios_cpf_unique');
    await queryInterface.removeColumn('usuarios', 'cpf');
  }
};
