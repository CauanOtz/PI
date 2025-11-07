// src/models/Atividade.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Usuario from './Usuario.model.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Atividade:
 *       type: object
 *       required:
 *         - titulo
 *         - data
 *         - horario
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado da atividade.
 *           example: 1
 *         titulo:
 *           type: string
 *           maxLength: 100
 *           description: Título da atividade.
 *           example: "Matemática Básica"
 *         data:
 *           type: string
 *           format: date
 *           description: Data da atividade (YYYY-MM-DD).
 *           example: "2024-09-02"
 *         horario:
 *           type: string
 *           format: time
 *           description: Horário da atividade (HH:MM:SS).
 *           example: "14:30:00"
 *         descricao:
 *           type: string
 *           nullable: true
 *           description: Descrição opcional da atividade.
 *           example: "Atividade introdutória sobre conceitos básicos"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização do registro.
 *     NovaAtividade:
 *       type: object
 *       required:
 *         - titulo
 *         - data
 *         - horario
 *       properties:
 *         titulo:
 *           type: string
 *           maxLength: 100
 *           description: Título da atividade.
 *           example: "Matemática Básica"
 *         data:
 *           type: string
 *           format: date
 *           description: Data da atividade (YYYY-MM-DD).
 *           example: "2024-09-02"
 *         horario:
 *           type: string
 *           format: time
 *           description: Horário da atividade (HH:MM:SS).
 *           example: "14:30:00"
 *         descricao:
 *           type: string
 *           nullable: true
 *           description: Descrição opcional da atividade.
 *           example: "Atividade introdutória sobre conceitos básicos"
 */
const Atividade = sequelize.define('Atividade', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING(100), allowNull: false },
  data: { type: DataTypes.DATEONLY, allowNull: false },
  horario: { type: DataTypes.TIME, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'atividades',
  timestamps: true,
});

Atividade.associate = (models) => {
  // Relacionamento com Presenca
  Atividade.hasMany(models.Presenca, {
    foreignKey: 'idAtividade',
    as: 'presencas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default Atividade;
