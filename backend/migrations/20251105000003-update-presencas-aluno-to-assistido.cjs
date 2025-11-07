'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove o índice antigo
    try {
      await queryInterface.removeIndex('presencas', 'unique_presenca_aluno_aula_data');
    } catch (error) {
      console.log('Aviso: Índice unique_presenca_aluno_aula_data não encontrado, continuando...');
    }
    
    // A foreign key é criada automaticamente pelo SQLite, então não precisamos removê-la explicitamente

    // Renomeia a coluna
    await queryInterface.renameColumn('presencas', 'id_aluno', 'id_assistido');

    // Adiciona a nova foreign key
    await queryInterface.addConstraint('presencas', {
      fields: ['id_assistido'],
      type: 'foreign key',
      name: 'presencas_id_assistido_foreign_idx',
      references: {
        table: 'assistidos',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Adiciona o novo índice único
    await queryInterface.addIndex('presencas', 
      ['id_assistido', 'id_aula', 'data_registro'],
      {
        unique: true,
        name: 'unique_presenca_assistido_aula_data'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove o índice novo
    try {
      await queryInterface.removeIndex('presencas', 'unique_presenca_assistido_aula_data');
    } catch (error) {
      console.log('Aviso: Índice unique_presenca_assistido_aula_data não encontrado, continuando...');
    }

    // A foreign key é criada automaticamente pelo SQLite, então não precisamos removê-la explicitamente

    // Renomeia a coluna de volta
    await queryInterface.renameColumn('presencas', 'id_assistido', 'id_aluno');

    // Adiciona a foreign key antiga
    await queryInterface.addConstraint('presencas', {
      fields: ['id_aluno'],
      type: 'foreign key',
      name: 'presencas_id_aluno_foreign_idx',
      references: {
        table: 'alunos',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Adiciona o índice antigo
    await queryInterface.addIndex('presencas', 
      ['id_aluno', 'id_aula', 'data_registro'],
      {
        unique: true,
        name: 'unique_presenca_aluno_aula_data'
      }
    );
  }
};