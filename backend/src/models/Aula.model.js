// src/models/Aula.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Aula:
 *       type: object
 *       required:
 *         - titulo
 *         - data
 *         - horario
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado da aula.
 *           example: 1
 *         titulo:
 *           type: string
 *           maxLength: 100
 *           description: Título da aula.
 *           example: "Matemática Básica"
 *         data:
 *           type: string
 *           format: date
 *           description: Data da aula (YYYY-MM-DD).
 *           example: "2024-09-02"
 *         horario:
 *           type: string
 *           format: time
 *           description: Horário da aula (HH:MM:SS).
 *           example: "14:30:00"
 *         descricao:
 *           type: string
 *           nullable: true
 *           description: Descrição opcional da aula.
 *           example: "Aula introdutória sobre conceitos básicos"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização do registro.
 *     NovaAula:
 *       type: object
 *       required:
 *         - titulo
 *         - data
 *         - horario
 *       properties:
 *         titulo:
 *           type: string
 *           maxLength: 100
 *           description: Título da aula.
 *           example: "Matemática Básica"
 *         data:
 *           type: string
 *           format: date
 *           description: Data da aula (YYYY-MM-DD).
 *           example: "2024-09-02"
 *         horario:
 *           type: string
 *           format: time
 *           description: Horário da aula (HH:MM:SS).
 *           example: "14:30:00"
 *         descricao:
 *           type: string
 *           nullable: true
 *           description: Descrição opcional da aula.
 *           example: "Aula introdutória sobre conceitos básicos"
 */
const Aula = sequelize.define('Aula', {
  // ... (definição do modelo como antes)
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING(100), allowNull: false },
  data: { type: DataTypes.DATEONLY, allowNull: false },
  horario: { type: DataTypes.TIME, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'aulas',
  timestamps: true,
});

export default Aula;