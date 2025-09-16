'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // recria a tabela `presencas` sem restrições UNIQUE por coluna.
    // este procedimento copia os dados para uma tabela temporária, remove a tabela antiga
    // e renomeia a tabela nova para preservar os dados e ajustar os índices.
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // cria uma nova tabela com o esquema desejado (sem UNIQUEs por coluna)
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

  // copia os dados existentes preservando os IDs
      await queryInterface.sequelize.query(`
        INSERT INTO presencas_new (id, id_aluno, id_aula, status, data_registro, observacao, created_at, updated_at)
        SELECT id, id_aluno, id_aula, status, data_registro, observacao, created_at, updated_at FROM presencas;
      `, { transaction });

      // remove a tabela antiga
      await queryInterface.sequelize.query(`DROP TABLE presencas;`, { transaction });

      // renomeia a tabela nova para o nome original
      await queryInterface.sequelize.query(`ALTER TABLE presencas_new RENAME TO presencas;`, { transaction });

      // cria apenas o índice único composto pretendido
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_presenca_aluno_aula_data ON presencas (id_aluno, id_aula, data_registro);
      `, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // a migração altera os índices e a estrutura da tabela de forma destrutiva
    // reverter automaticamente para o esquema anterior com índices únicos por coluna
    // não é trivial e pode ser inseguro. Reversão manual é necessária se for preciso
    throw new Error('Migração irreversível: rollback manual requerido se necessário.');
  }
};
