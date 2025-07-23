'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alunos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'O nome do aluno é obrigatório.'
          },
          len: {
            args: [3, 100],
            msg: 'O nome deve ter entre 3 e 100 caracteres.'
          }
        }
      },
      idade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: 'A idade deve ser um número inteiro.'
          },
          min: {
            args: [0],
            msg: 'A idade não pode ser negativa.'
          },
          max: {
            args: [120],
            msg: 'A idade não pode ser maior que 120 anos.'
          }
        }
      },
      endereco: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'O endereço não pode ter mais de 255 caracteres.'
          }
        }
      },
      contato: {
        type: Sequelize.STRING(20),
        allowNull: true,
        validate: {
          is: {
            args: /^(\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{10,11})?$/,
            msg: 'Formato de contato inválido. Use (DD) 99999-9999 ou (DD) 9999-9999.'
          }
        }
      },
      responsavel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Adicionando índice para melhorar a performance das consultas por responsável
    await queryInterface.addIndex('alunos', ['responsavel_id']);
  },

  async down(queryInterface, Sequelize) {
    // Remover a tabela alunos
    await queryInterface.dropTable('alunos');
  }
};
