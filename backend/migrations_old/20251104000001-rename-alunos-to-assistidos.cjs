'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    
    // Verificar se a tabela 'alunos' existe
    let tableExists = false;
    
    if (dialect === 'sqlite') {
      const [tables] = await queryInterface.sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='alunos';"
      );
      tableExists = tables && tables.length > 0;
    } else if (dialect === 'postgres') {
      const [tables] = await queryInterface.sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alunos';",
        { type: Sequelize.QueryTypes.SELECT }
      );
      tableExists = tables && tables.length > 0;
    }
    
    // Se a tabela 'alunos' não existe, significa que já foi renomeada
    // ou que estamos usando as migrações 3FN que já criam 'assistidos'
    if (!tableExists) {
      console.log('Tabela "alunos" não encontrada. Assumindo que já foi renomeada para "assistidos".');
      return;
    }

    // Se chegou aqui, tabela alunos existe e precisa ser renomeada
    if (dialect === 'postgres') {
      // PostgreSQL: usar ALTER TABLE RENAME
      await queryInterface.renameTable('alunos', 'assistidos');
      
      // Renomear coluna id_aluno para id_assistido em presencas
      await queryInterface.renameColumn('presencas', 'id_aluno', 'id_assistido');
      
      // Renomear coluna id_aluno para id_assistido em responsaveis_alunos
      await queryInterface.renameColumn('responsaveis_alunos', 'id_aluno', 'id_assistido');
      
      // Renomear tabela responsaveis_alunos para responsaveis_assistidos
      await queryInterface.renameTable('responsaveis_alunos', 'responsaveis_assistidos');
      
    } else if (dialect === 'sqlite') {
      // SQLite: recriar tabelas (código original)
      await queryInterface.renameTable('alunos', 'assistidos');

      // Presencas
      await queryInterface.sequelize.query(`
        CREATE TABLE presencas_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_assistido INTEGER NOT NULL,
          id_aula INTEGER NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('presente', 'falta', 'atraso', 'falta_justificada')),
          data_registro DATE NOT NULL,
          observacao VARCHAR(500),
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (id_aula) REFERENCES aulas(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE(id_assistido, id_aula, data_registro)
        );
      `);

      await queryInterface.sequelize.query(`
        INSERT INTO presencas_new (id, id_assistido, id_aula, status, data_registro, observacao, created_at, updated_at)
        SELECT id, id_aluno, id_aula, status, data_registro, observacao, created_at, updated_at FROM presencas;
      `);

      await queryInterface.sequelize.query('DROP TABLE presencas;');
      await queryInterface.sequelize.query('ALTER TABLE presencas_new RENAME TO presencas;');

      // ResponsaveisAlunos
      await queryInterface.sequelize.query(`
        CREATE TABLE responsaveis_assistidos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_usuario INTEGER NOT NULL,
          id_assistido INTEGER NOT NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE(id_usuario, id_assistido)
        );
      `);

      await queryInterface.sequelize.query(`
        INSERT INTO responsaveis_assistidos (id, id_usuario, id_assistido, created_at, updated_at)
        SELECT id, id_usuario, id_aluno, created_at, updated_at FROM responsaveis_alunos;
      `);

      await queryInterface.sequelize.query('DROP TABLE responsaveis_alunos;');

      // Documentos
      await queryInterface.sequelize.query(`
        CREATE TABLE documentos_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_assistido INTEGER NOT NULL,
          tipo_documento VARCHAR(50) NOT NULL,
          caminho_arquivo VARCHAR(255) NOT NULL,
          data_envio DATE NOT NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);

      await queryInterface.sequelize.query(`
        INSERT INTO documentos_new (id, id_assistido, tipo_documento, caminho_arquivo, data_envio, created_at, updated_at)
        SELECT id, id_aluno, tipo_documento, caminho_arquivo, data_envio, created_at, updated_at FROM documentos;
      `);

      await queryInterface.sequelize.query('DROP TABLE documentos;');
      await queryInterface.sequelize.query('ALTER TABLE documentos_new RENAME TO documentos;');
    }
  },

  async down(queryInterface, Sequelize) {
    throw new Error('Rollback não suportado para esta migração.');
  }
};


    // SQLite não suporta renomear colunas diretamente, então precisamos recriar as tabelas
    // Presencas
    await queryInterface.sequelize.query(`
      CREATE TABLE presencas_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_assistido INTEGER NOT NULL,
        id_aula INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('presente', 'falta', 'atraso', 'falta_justificada')),
        data_registro DATE NOT NULL,
        observacao VARCHAR(500),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_aula) REFERENCES aulas(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(id_assistido, id_aula, data_registro)
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO presencas_new (id, id_assistido, id_aula, status, data_registro, observacao, created_at, updated_at)
      SELECT id, id_aluno, id_aula, status, data_registro, observacao, created_at, updated_at FROM presencas;
    `);

    await queryInterface.sequelize.query('DROP TABLE presencas;');
    await queryInterface.sequelize.query('ALTER TABLE presencas_new RENAME TO presencas;');

    // ResponsaveisAlunos
    await queryInterface.sequelize.query(`
      CREATE TABLE responsaveis_assistidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_assistido INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(id_usuario, id_assistido)
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO responsaveis_assistidos (id, id_usuario, id_assistido, created_at, updated_at)
      SELECT id, id_usuario, id_aluno, created_at, updated_at FROM responsaveis_alunos;
    `);

    await queryInterface.sequelize.query('DROP TABLE responsaveis_alunos;');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('assistidos', 'alunos');

    // Presencas
    await queryInterface.sequelize.query(`
      CREATE TABLE presencas_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_aluno INTEGER NOT NULL,
        id_aula INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('presente', 'falta', 'atraso', 'falta_justificada')),
        data_registro DATE NOT NULL,
        observacao VARCHAR(500),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (id_aluno) REFERENCES alunos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_aula) REFERENCES aulas(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(id_aluno, id_aula, data_registro)
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO presencas_new (id, id_aluno, id_aula, status, data_registro, observacao, created_at, updated_at)
      SELECT id, id_assistido, id_aula, status, data_registro, observacao, created_at, updated_at FROM presencas;
    `);

    await queryInterface.sequelize.query('DROP TABLE presencas;');
    await queryInterface.sequelize.query('ALTER TABLE presencas_new RENAME TO presencas;');

    // ResponsaveisAlunos
    await queryInterface.sequelize.query(`
      CREATE TABLE responsaveis_alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_aluno INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_aluno) REFERENCES alunos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE(id_usuario, id_aluno)
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO responsaveis_alunos (id, id_usuario, id_aluno, created_at, updated_at)
      SELECT id, id_usuario, id_assistido, created_at, updated_at FROM responsaveis_assistidos;
    `);

    await queryInterface.sequelize.query('DROP TABLE responsaveis_assistidos;');
  }
};