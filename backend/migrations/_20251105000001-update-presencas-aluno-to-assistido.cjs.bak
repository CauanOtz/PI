'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  // Remove o índice antigo
  await queryInterface.removeIndex('presencas', 'unique_presenca_aluno_aula_data');
  
  // Renomeia a coluna id_aluno para id_assistido
  await queryInterface.renameColumn('presencas', 'id_aluno', 'id_assistido');
  
  // Atualiza a referência da foreign key
  await queryInterface.removeConstraint('presencas', 'presencas_id_aluno_fkey');
  
  await queryInterface.addConstraint('presencas', {
    fields: ['id_assistido'],
    type: 'foreign key',
    name: 'presencas_id_assistido_fkey',
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
  await queryInterface.removeIndex('presencas', 'unique_presenca_assistido_aula_data');
  
  // Remove a nova foreign key
  await queryInterface.removeConstraint('presencas', 'presencas_id_assistido_fkey');
  
  // Renomeia a coluna de volta para id_aluno
  await queryInterface.renameColumn('presencas', 'id_assistido', 'id_aluno');
  
  // Recria a foreign key antiga
  await queryInterface.addConstraint('presencas', {
    fields: ['id_aluno'],
    type: 'foreign key',
    name: 'presencas_id_aluno_fkey',
    references: {
      table: 'alunos',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Recria o índice antigo
  await queryInterface.addIndex('presencas', 
    ['id_aluno', 'id_aula', 'data_registro'], 
    {
      unique: true,
      name: 'unique_presenca_aluno_aula_data'
    }
  );
  }
};