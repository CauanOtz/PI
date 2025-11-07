// src/models/Presenca.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Assistido from './Assistido.model.js';
import Aula from './Aula.model.js';
import Atividade from './Atividade.model.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Presenca:
 *       type: object
 *       required:
 *         - idAssistido
 *         - idAula
 *         - status
 *         - data_registro
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do registro de presença.
 *           example: 1
 *         idAssistido:
 *           type: integer
 *           description: ID do assistido relacionado.
 *           example: 1
 *         idAtividade:
 *           type: integer
 *           description: ID da atividade relacionada.
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
  idAssistido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_assistido',
    references: {
      model: 'assistidos',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  idAtividade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_atividade',
    references: {
      model: 'atividades',
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
    defaultValue: DataTypes.NOW,
    field: 'data_registro'
  },
  observacao: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'observacao'
  }
}, {
  tableName: 'presencas',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['id_assistido', 'id_atividade', 'data_registro'],
      name: 'unique_presenca_assistido_atividade_data'
    }
  ]
});

// Associações
Presenca.associate = (models) => {
  Presenca.belongsTo(models.Assistido, {
    foreignKey: 'idAssistido',
    as: 'assistido',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE' 
  });
  
  Presenca.belongsTo(models.Atividade, {
    foreignKey: 'idAtividade',
    as: 'atividade',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE' 
  });
};

export default Presenca;
