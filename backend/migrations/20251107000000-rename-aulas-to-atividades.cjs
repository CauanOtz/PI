// migrations/20251107000000-rename-aulas-to-atividades.cjs
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Para SQLite, precisamos recriar as tabelas devido às limitações
    const dialect = queryInterface.sequelize.options.dialect;
    
    if (dialect === 'sqlite') {
      // Verificar se a tabela atividades já existe
      const [tables] = await queryInterface.sequelize.query(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='atividades';
      `);
      
      if (tables.length === 0) {
        // Se não existe, renomear tabela aulas para atividades
        await queryInterface.renameTable('aulas', 'atividades');
      }
      
      // Verificar se id_atividade já existe na tabela presencas
      const [columns] = await queryInterface.sequelize.query(`
        PRAGMA table_info(presencas);
      `);
      
      const hasIdAtividade = columns.some(col => col.name === 'id_atividade');
      
      if (!hasIdAtividade) {
        // Recriar tabela presencas com a nova foreign key
        await queryInterface.sequelize.query(`
          CREATE TABLE presencas_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_assistido INTEGER NOT NULL,
            id_atividade INTEGER NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'presente',
            data_registro DATE NOT NULL,
            observacao TEXT,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (id_atividade) REFERENCES atividades(id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE(id_assistido, id_atividade, data_registro)
          );
        `);
        
        // Copiar dados da tabela antiga para a nova
        await queryInterface.sequelize.query(`
          INSERT INTO presencas_new (id, id_assistido, id_atividade, status, data_registro, observacao, created_at, updated_at)
          SELECT id, id_assistido, id_aula, status, data_registro, observacao, created_at, updated_at FROM presencas;
        `);
        
        // Remover tabela antiga e renomear a nova
        await queryInterface.sequelize.query('DROP TABLE presencas;');
        await queryInterface.sequelize.query('ALTER TABLE presencas_new RENAME TO presencas;');
        
        // Recriar índices
        await queryInterface.sequelize.query(`
          CREATE INDEX IF NOT EXISTS presencas_id_assistido ON presencas (id_assistido);
        `);
        await queryInterface.sequelize.query(`
          CREATE INDEX IF NOT EXISTS presencas_id_atividade ON presencas (id_atividade);
        `);
        await queryInterface.sequelize.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS unique_presenca_assistido_atividade_data ON presencas (id_assistido, id_atividade, data_registro);
        `);
      }
    } else {
      // Para PostgreSQL e MySQL
      const [tables] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name='atividades';
      `);
      
      if (tables.length === 0) {
        await queryInterface.renameTable('aulas', 'atividades');
      }
      
      // Verificar se a coluna id_atividade existe
      const [columns] = await queryInterface.sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='presencas' AND column_name='id_atividade';
      `);
      
      if (columns.length === 0) {
        await queryInterface.renameColumn('presencas', 'id_aula', 'id_atividade');
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.options.dialect;
    
    if (dialect === 'sqlite') {
      // Verificar se tem id_atividade
      const [columns] = await queryInterface.sequelize.query(`
        PRAGMA table_info(presencas);
      `);
      
      const hasIdAtividade = columns.some(col => col.name === 'id_atividade');
      
      if (hasIdAtividade) {
        // Recriar tabela presencas com a foreign key antiga
        await queryInterface.sequelize.query(`
          CREATE TABLE presencas_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_assistido INTEGER NOT NULL,
            id_aula INTEGER NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'presente',
            data_registro DATE NOT NULL,
            observacao TEXT,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (id_aula) REFERENCES aulas(id) ON DELETE CASCADE ON UPDATE CASCADE,
            UNIQUE(id_assistido, id_aula, data_registro)
          );
        `);
        
        // Copiar dados da tabela atual para a nova
        await queryInterface.sequelize.query(`
          INSERT INTO presencas_new (id, id_assistido, id_aula, status, data_registro, observacao, created_at, updated_at)
          SELECT id, id_assistido, id_atividade, status, data_registro, observacao, created_at, updated_at FROM presencas;
        `);
        
        // Remover tabela atual e renomear a nova
        await queryInterface.sequelize.query('DROP TABLE presencas;');
        await queryInterface.sequelize.query('ALTER TABLE presencas_new RENAME TO presencas;');
        
        // Recriar índices
        await queryInterface.sequelize.query(`
          CREATE INDEX IF NOT EXISTS presencas_id_assistido ON presencas (id_assistido);
        `);
        await queryInterface.sequelize.query(`
          CREATE INDEX IF NOT EXISTS presencas_id_aula ON presencas (id_aula);
        `);
        await queryInterface.sequelize.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS unique_presenca_assistido_aula_data ON presencas (id_assistido, id_aula, data_registro);
        `);
      }
      
      // Verificar se a tabela atividades existe
      const [tables] = await queryInterface.sequelize.query(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='atividades';
      `);
      
      if (tables.length > 0) {
        // Renomear tabela atividades de volta para aulas
        await queryInterface.renameTable('atividades', 'aulas');
      }
    } else {
      // Para PostgreSQL e MySQL
      const [columns] = await queryInterface.sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='presencas' AND column_name='id_atividade';
      `);
      
      if (columns.length > 0) {
        await queryInterface.renameColumn('presencas', 'id_atividade', 'id_aula');
      }
      
      const [tables] = await queryInterface.sequelize.query(`
        SELECT table_name FROM information_schema.tables WHERE table_name='atividades';
      `);
      
      if (tables.length > 0) {
        await queryInterface.renameTable('atividades', 'aulas');
      }
    }
  }
};

