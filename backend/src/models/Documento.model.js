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
    allowNull: false,
    field: 'caminho_arquivo'
  },
  tipo: {
    type: DataTypes.ENUM('RG', 'CPF', 'CERTIDAO_NASCIMENTO', 'COMPROVANTE_ENDERECO', 'OUTRO'),
    allowNull: false
  },
  assistidoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'assistido_id',
    references: {
      model: 'assistidos',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'usuario_id',
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'documentos',
  timestamps: true,
  underscored: false,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  paranoid: false
});

Documento.associate = (models) => {
  // Association with Assistido
  Documento.belongsTo(models.Assistido, {
    foreignKey: 'assistidoId',
    as: 'assistido',
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