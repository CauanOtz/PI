// src/models/ResponsavelAluno.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ResponsavelAluno = sequelize.define('ResponsavelAluno', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    
  },

  id_usuario: { // Renomeado de cpf_usuario para id_usuario
    type: DataTypes.INTEGER, // Tipo alterado para INTEGER
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id' // Referência alterada para a chave primária 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  id_aluno: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alunos',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
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
  tableName: 'responsaveis_alunos',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

ResponsavelAluno.associate = (models) => {
  // Association with Usuario
  // --- CORREÇÃO AQUI ---
  ResponsavelAluno.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario', // Chave estrangeira atualizada
    as: 'usuario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Association with Aluno
  ResponsavelAluno.belongsTo(models.Aluno, {
    foreignKey: 'id_aluno',
    as: 'aluno',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default ResponsavelAluno;