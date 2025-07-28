// src/models/ResponsavelAluno.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ResponsavelAluno = sequelize.define('ResponsavelAluno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cpfUsuario: {
    type: DataTypes.STRING(11),
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'cpf'
    }
  },
  idAluno: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alunos',
      key: 'id'
    }
  }
}, {
  tableName: 'responsaveis_alunos',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['cpf_usuario', 'id_aluno']
    }
  ]
});

export default ResponsavelAluno;