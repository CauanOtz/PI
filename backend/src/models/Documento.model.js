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
    validate: {
        notEmpty: {
          msg: 'O nome do documento é obrigatório'
        },
        len: {
          args: [3, 255],
          msg: 'O nome deve ter entre 3 e 255 caracteres'
        }
      }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'A descrição deve ter no máximo 1000 caracteres'
      }
    }
  },

  caminhoArquivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tamanho: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'documentos',
  timestamps: true,
  underscored: true,
  paranoid: true,
  defaultScope: {
    attributes: { exclude: ['caminhoArquivo'] }
  },
  scopes: {
    comArquivo: {
      attributes: { include: ['caminhoArquivo'] }
    }
  }
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