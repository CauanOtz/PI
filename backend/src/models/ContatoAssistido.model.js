import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ContatoAssistido = sequelize.define('ContatoAssistido', {
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
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O telefone é obrigatório.'
      },
      is: {
        args: /^(\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{10,11})$/,
        msg: 'Formato de telefone inválido. Use (DD) 99999-9999.'
      }
    }
  },
  nomeContato: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'nome_contato',
    validate: {
      len: {
        args: [0, 100],
        msg: 'O nome do contato não pode ter mais de 100 caracteres.'
      }
    }
  },
  parentesco: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: {
        args: [0, 50],
        msg: 'O parentesco não pode ter mais de 50 caracteres.'
      }
    }
  },
  observacao: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: 'A observação não pode ter mais de 255 caracteres.'
      }
    }
  },
  ordemPrioridade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'ordem_prioridade',
    validate: {
      min: {
        args: [1],
        msg: 'A ordem de prioridade deve ser no mínimo 1.'
      }
    }
  }
}, {
  tableName: 'contatos_assistido',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['assistido_id', 'telefone'],
      name: 'contatos_assistido_telefone_unique'
    }
  ]
});

export default ContatoAssistido;
