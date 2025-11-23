'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primeiro verifica se o usuário já existe
    const [results] = await queryInterface.sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email',
      {
        replacements: { email: 'admin@escola.com' }
      }
    );

    if (results.length === 0) {
      // Se não existe, cria o usuário
      const hashedPassword = await bcrypt.hash('admin052174', 10);
      await queryInterface.bulkInsert('usuarios', [{
        nome: 'Administrador do Sistema',
        email: 'admin@escola.com',
        senha: hashedPassword,
        cpf: '623.920.600-88',
        telefone: '(11) 99999-9999',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@escola.com' });
  }
};