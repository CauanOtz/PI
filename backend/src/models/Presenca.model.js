// src/models/Presenca.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Aluno from './Aluno.model.js';
import Aula from './Aula.model.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Presenca:
 *       type: object
 *       required:
 *         - idAluno
 *         - idAula
 *         - status
 *         - data_registro
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do registro de presença.
 *           example: 1
 *         idAluno:
 *           type: integer
 *           description: ID do aluno relacionado.
 *           example: 1
 *         idAula:
 *           type: integer
 *           description: ID da aula relacionada.
 *           example: 1
 *         status:
 *           type: string
 *           enum: [presente, falta]
 *           description: Status da presença (presente ou falta).
 *           example: "presente"
 *         data_registro:
 *           type: string
 *           format: date
 *           description: Data do registro da presença (YYYY-MM-DD).
 *           example: "2024-07-30"
 *         observacao:
 *           type: string
 *           maxLength: 500
 *           description: Observações sobre a presença.
 *           nullable: true
 *           example: "Chegou atrasado 15 minutos"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização do registro.
 */
const Presenca = sequelize.define('Presenca', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  idAluno: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alunos',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  idAula: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'aulas',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('presente', 'falta', 'atraso', 'falta_justificada'),
    allowNull: false,
    defaultValue: 'presente'
  },
  data_registro: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observacao: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'presencas',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['id_aluno', 'id_aula', 'data_registro'],
      name: 'unique_presenca_aluno_aula_data'
    }
  ]
});

// Associações
Presenca.associate = (models) => {
  Presenca.belongsTo(models.Aluno, {
    foreignKey: 'idAluno',
    as: 'aluno',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE' 
  });
  
  Presenca.belongsTo(models.Aula, {
    foreignKey: 'idAula',
    as: 'aula',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE' 
  });
};

export default Presenca;
