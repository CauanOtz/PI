'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Detectar se é PostgreSQL ou SQLite
    const dialect = queryInterface.sequelize.getDialect();
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      if (dialect === 'sqlite') {
        // SQLite: recria a tabela
        await queryInterface.sequelize.query(`
          CREATE TABLE IF NOT EXISTS presencas_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_aluno INTEGER NOT NULL,
            id_aula INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'presente',
            data_registro DATE NOT NULL,
            observacao VARCHAR(500),
            created_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
            updated_at DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
            FOREIGN KEY (id_aluno) REFERENCES alunos(id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (id_aula) REFERENCES aulas(id) ON UPDATE CASCADE ON DELETE CASCADE
          );
        `, { transaction });

        await queryInterface.sequelize.query(`
          INSERT INTO presencas_new (id, id_aluno, id_aula, status, data_registro, observacao, created_at, updated_at)
          SELECT id, id_aluno, id_aula, status, data_registro, observacao, created_at, updated_at FROM presencas;
        `, { transaction });

        await queryInterface.sequelize.query(`DROP TABLE presencas;`, { transaction });
        await queryInterface.sequelize.query(`ALTER TABLE presencas_new RENAME TO presencas;`, { transaction });

        await queryInterface.sequelize.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS unique_presenca_aluno_aula_data ON presencas (id_aluno, id_aula, data_registro);
        `, { transaction });
        
      } else if (dialect === 'postgres') {
        // PostgreSQL: apenas remover constraints UNIQUE e criar índice composto
        // Verificar e remover constraints UNIQUE existentes
        const constraints = await queryInterface.sequelize.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'presencas' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name LIKE 'presencas_%_key';
        `, { type: Sequelize.QueryTypes.SELECT, transaction });

        for (const constraint of constraints) {
          await queryInterface.sequelize.query(
            `ALTER TABLE presencas DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}";`,
            { transaction }
          );
        }

        // Criar índice único composto
        await queryInterface.sequelize.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS unique_presenca_aluno_aula_data 
          ON presencas (id_aluno, id_aula, data_registro);
        `, { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    throw new Error('Migração irreversível: rollback manual requerido se necessário.');
  }
};
