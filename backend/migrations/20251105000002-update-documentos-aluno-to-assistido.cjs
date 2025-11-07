'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove a foreign key existente se ela existir
    try {
      await queryInterface.removeConstraint('documentos', 'documentos_aluno_id_fkey');
    } catch (error) {
      console.log('Aviso: Constraint documentos_aluno_id_fkey não encontrada, continuando...');
    }

    // Renomeia a coluna alunoId para assistidoId
  await queryInterface.renameColumn('documentos', 'alunoId', 'assistidoId');

  // Adiciona a nova foreign key
  await queryInterface.addConstraint('documentos', {
    fields: ['assistidoId'],
    type: 'foreign key',
    name: 'documentos_assistido_id_fkey',
    references: {
      table: 'assistidos',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  },

  async down(queryInterface, Sequelize) {
    // Remove a nova foreign key se ela existir
    try {
      await queryInterface.removeConstraint('documentos', 'documentos_assistido_id_fkey');
    } catch (error) {
      console.log('Aviso: Constraint documentos_assistido_id_fkey não encontrada, continuando...');
    }

    // Renomeia a coluna de volta para alunoId
  await queryInterface.renameColumn('documentos', 'assistidoId', 'alunoId');

  // Adiciona a foreign key antiga
  await queryInterface.addConstraint('documentos', {
    fields: ['alunoId'],
    type: 'foreign key',
    name: 'documentos_aluno_id_fkey',
    references: {
      table: 'alunos',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  }
};