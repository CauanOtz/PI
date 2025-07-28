// src/models/Documento.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  caminhoArquivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING, // Ex: 'pdf', 'docx', 'jpg', etc.
    allowNull: false,
  },
  tamanho: {
    type: DataTypes.INTEGER, // Tamanho em bytes
    allowNull: false,
  },
  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Alunos',
      key: 'id',
    },
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
  },
}, {
  tableName: 'documentos',
  timestamps: true,  
  underscored: true,
  paranoid: true
});

// Associações
Documento.associate = (models) => {
    Documento.belongsTo(models.Aluno, {
      foreignKey: 'alunoId',
      as: 'aluno'
    });
    Documento.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario'
    });
};

export default Documento;