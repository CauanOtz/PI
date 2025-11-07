'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin052174', 10);
    
    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Administrador do Sistema',
      email: 'admin@escola.com',
      senha: hashedPassword,
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@escola.com' });
  }
};
    };

    // Primeiro verifica se o usuário já existe
    const [results] = await queryInterface.sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email',
      {
        replacements: { email: adminData.email }
      }
    );

    if (results.length === 0) {
      // Se não existe, cria o usuário
      const hashedPassword = await bcrypt.hash(adminData.senha, 10);
      await queryInterface.sequelize.query(
        `INSERT INTO usuarios (nome, email, senha, cpf, telefone, role, "createdAt", "updatedAt")
         VALUES (:nome, :email, :senha, :cpf, :telefone, :role, :createdAt, :updatedAt)`,
        {
          replacements: {
            ...adminData,
            senha: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM usuarios WHERE email = 'admin@escola.com'
    `);
  }
};