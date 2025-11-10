'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('documentos');
    
    // Renomear coluna alunoId para assistidoId se existir
    if (tableDescription.alunoId) {
      await queryInterface.renameColumn('documentos', 'alunoId', 'assistidoId');
    }
    
    // Adicionar coluna ativo se não existir
    if (!tableDescription.ativo) {
      await queryInterface.addColumn('documentos', 'ativo', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    }
    
    // Remover coluna tamanho se existir
    if (tableDescription.tamanho) {
      await queryInterface.removeColumn('documentos', 'tamanho');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documentos', 'ativo');
    await queryInterface.renameColumn('documentos', 'assistidoId', 'alunoId');
  }
};
