// src/models/Documento.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  caminhoArquivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('RG', 'CPF', 'CERTIDAO_NASCIMENTO', 'COMPROVANTE_ENDERECO', 'OUTRO'),
    allowNull: false
  },
  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alunos',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  dataUpload: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'documentos',
  timestamps: true,
  underscored: true,
  createdAt: 'data_upload',
  updatedAt: 'data_atualizacao',
  paranoid: true,
  deletedAt: 'data_exclusao'
});

Documento.associate = (models) => {
  // Association with Aluno
  Documento.belongsTo(models.Aluno, {
    foreignKey: 'alunoId',
    as: 'aluno',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Association with Usuario
  Documento.belongsTo(models.Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default Documento;