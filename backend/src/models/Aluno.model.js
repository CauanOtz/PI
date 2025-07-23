// src/models/Aluno.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Aluno:
 *       type: object
 *       required:
 *         - nome
 *         - idade
 *         - responsavel_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do aluno.
 *           example: 1
 *         nome:
 *           type: string
 *           maxLength: 100
 *           description: Nome completo do aluno.
 *           example: "Maria Oliveira"
 *         idade:
 *           type: integer
 *           minimum: 0
 *           maximum: 120
 *           description: Idade do aluno.
 *           example: 10
 *         endereco:
 *           type: string
 *           maxLength: 255
 *           description: Endereço completo do aluno.
 *           example: "Rua das Flores, 123 - Centro"
 *           nullable: true
 *         contato:
 *           type: string
 *           maxLength: 20
 *           description: Telefone para contato.
 *           example: "(11) 98765-4321"
 *           nullable: true
 *         responsavel_id:
 *           type: integer
 *           description: ID do responsável pelo aluno (referência ao modelo Usuario).
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro.
 *           example: "2025-07-22T12:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do registro.
 *           example: "2025-07-22T12:00:00.000Z"
 */

const Aluno = sequelize.define('Aluno', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
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
    type: DataTypes.INTEGER,
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
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: 'O endereço não pode ter mais de 255 caracteres.'
      }
    }
  },
  contato: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^(\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{10,11})?$/,
        msg: 'Formato de contato inválido. Use (DD) 99999-9999 ou (DD) 9999-9999.'
      }
    }
  },
  responsavel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'alunos',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Aluno;
