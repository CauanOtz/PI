'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  // Cria a tabela de junção
  await queryInterface.createTable('responsaveis_alunos', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
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

  // Adiciona um índice único composto para evitar duplicatas
  await queryInterface.addConstraint('responsaveis_alunos', {
    fields: ['id_usuario', 'id_aluno'],
    type: 'unique',
    name: 'unique_responsavel_aluno'
  });
  },
  async down(queryInterface, Sequelize) {
    // Remove a restrição de chave estrangeira primeiro
    await queryInterface.removeConstraint('responsaveis_alunos', 'unique_responsavel_aluno');
    // Depois remove a tabela
    await queryInterface.dropTable('responsaveis_alunos');
  }
};