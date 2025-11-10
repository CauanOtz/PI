'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // SQLite não suporta ALTER TABLE DROP COLUMN, então precisamos recriar a tabela
    // 1. Criar tabela temporária sem a coluna responsavel_id
    await queryInterface.sequelize.query(`
      CREATE TABLE assistidos_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        data_nascimento DATE NOT NULL,
        sexo VARCHAR(10) NOT NULL CHECK(sexo IN ('Feminino', 'Masculino')),
        cartao_sus VARCHAR(20),
        rg VARCHAR(20),
        endereco VARCHAR(255),
        bairro VARCHAR(100),
        cep VARCHAR(9),
        cidade VARCHAR(100),
        contato VARCHAR(20),
        problemas_saude VARCHAR(1000),
        pai VARCHAR(100),
        mae VARCHAR(100),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
    `);

    // 2. Copiar dados da tabela antiga para a nova
    await queryInterface.sequelize.query(`
      INSERT INTO assistidos_new (
        id, nome, data_nascimento, sexo, cartao_sus, rg, endereco,
        bairro, cep, cidade, contato, problemas_saude, pai, mae,
        created_at, updated_at
      )
      SELECT 
        id, nome, data_nascimento, sexo, cartao_sus, rg, endereco,
        bairro, cep, cidade, contato, problemas_saude, pai, mae,
        created_at, updated_at
      FROM assistidos;
    `);

    // 3. Remover tabela antiga
    await queryInterface.sequelize.query('DROP TABLE assistidos;');

    // 4. Renomear tabela nova
    await queryInterface.sequelize.query('ALTER TABLE assistidos_new RENAME TO assistidos;');
  },

  async down(queryInterface, Sequelize) {
    // Como não temos mais acesso aos IDs dos responsáveis originais,
    // não podemos voltar atrás com essa migration
    throw new Error('This migration cannot be undone');
  }
};