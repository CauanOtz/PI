'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('alunos', 'assistidos');

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