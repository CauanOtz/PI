// create-responsaveis-alunos.js
import { sequelize } from './src/config/database.js';

async function createResponsaveisAlunosTable() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS responsaveis_alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        id_aluno INTEGER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_aluno) REFERENCES alunos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE (id_usuario, id_aluno)
      );
    `);

    console.log('Tabela responsaveis_alunos criada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar a tabela responsaveis_alunos:', error);
    process.exit(1);
  }
}

createResponsaveisAlunosTable();