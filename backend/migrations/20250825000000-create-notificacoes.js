'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notificacoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      titulo: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      mensagem: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('info', 'alerta', 'urgente', 'sistema'),
        allowNull: false,
        defaultValue: 'info'
      },
      data_envio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      data_expiracao: {
        type: Sequelize.DATE,
        allowNull: true
      },
      criado_por: {
        type: Sequelize.STRING(14), // CPF formatado
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'cpf'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Adiciona índices
    await queryInterface.addIndex('notificacoes', ['tipo']);
    await queryInterface.addIndex('notificacoes', ['criado_por']);
    await queryInterface.addIndex('notificacoes', ['data_envio']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notificacoes');
  }
};
