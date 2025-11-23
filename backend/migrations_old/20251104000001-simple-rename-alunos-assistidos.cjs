'use strict';

/**
 * Migração simplificada: Renomeia tabela 'alunos' para 'assistidos'
 * Compatible com PostgreSQL e SQLite
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    
    // Verificar se a tabela 'alunos' existe
    let alunosExists = false;
    let assistidosExists = false;
    
    if (dialect === 'sqlite') {
      const [tables] = await queryInterface.sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND (name='alunos' OR name='assistidos');"
      );
      alunosExists = tables.some(t => t.name === 'alunos');
      assistidosExists = tables.some(t => t.name === 'assistidos');
    } else if (dialect === 'postgres') {
      const [tables] = await queryInterface.sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name = 'alunos' OR table_name = 'assistidos');",
        { type: Sequelize.QueryTypes.SELECT }
      );
      alunosExists = tables.some(t => t.table_name === 'alunos');
      assistidosExists = tables.some(t => t.table_name === 'assistidos');
    }
    
    // Se 'assistidos' já existe, não fazer nada
    if (assistidosExists) {
      console.log('Tabela "assistidos" já existe. Pulando migração.');
      return;
    }
    
    // Se 'alunos' existe, renomear para 'assistidos'
    if (alunosExists) {
      console.log('Renomeando tabela "alunos" para "assistidos"...');
      await queryInterface.renameTable('alunos', 'assistidos');
      return;
    }
    
    // Se nem alunos nem assistidos existem, não fazer nada
    console.log('Nenhuma tabela "alunos" ou "assistidos" encontrada. Pulando migração.');
  },

  async down(queryInterface, Sequelize) {
    // Reverter: renomear 'assistidos' de volta para 'alunos'
    await queryInterface.renameTable('assistidos', 'alunos');
  }
};
