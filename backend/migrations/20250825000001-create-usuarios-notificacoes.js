'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usuarios_notificacoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      notificacao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'notificacoes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cpf_usuario: {
        type: Sequelize.STRING(14), // CPF formatado
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'cpf'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      data_leitura: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Adiciona índices para melhorar a performance das consultas
    await queryInterface.addIndex('usuarios_notificacoes', ['notificacao_id']);
    await queryInterface.addIndex('usuarios_notificacoes', ['cpf_usuario']);
    await queryInterface.addIndex('usuarios_notificacoes', ['lida']);
    
    // Índice único para garantir que não haja duplicatas
    await queryInterface.addConstraint('usuarios_notificacoes', {
      fields: ['notificacao_id', 'cpf_usuario'],
      type: 'unique',
      name: 'unique_notificacao_usuario'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('usuarios_notificacoes');
  }
};
