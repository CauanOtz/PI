'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const senhaHash = await bcrypt.hash('Admin@123', 10);
    
    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Administrador',
      email: 'admin@ang.com',
      senha: senhaHash,
      telefone: '(11) 99999-9999',
      role: 'admin',
      cpf: '00000000000',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { cpf: '00000000000' }, {});
  }
};
