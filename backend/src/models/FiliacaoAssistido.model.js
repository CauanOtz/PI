import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const FiliacaoAssistido = sequelize.define('FiliacaoAssistido', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  tipo: {
    type: DataTypes.ENUM('mae', 'pai'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['mae', 'pai']],
        msg: 'O tipo deve ser "mae" ou "pai".'
      }
    }
  },
  nomeCompleto: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nome_completo',
    validate: {
      notEmpty: {
        msg: 'O nome completo é obrigatório.'
      },
      len: {
        args: [3, 100],
        msg: 'O nome completo deve ter entre 3 e 100 caracteres.'
      }
    }
  }
}, {
  tableName: 'filiacao_assistido',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['assistido_id', 'tipo'],
      name: 'filiacao_assistido_unique'
    }
  ]
});

export default FiliacaoAssistido;
