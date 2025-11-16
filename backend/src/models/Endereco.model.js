import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Endereco = sequelize.define('Endereco', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: false,
    // Removido unique: true para permitir múltiplos endereços com mesmo CEP
    // mas endereços completos diferentes (3FN por endereço completo)
    validate: {
      notEmpty: {
        msg: 'O CEP é obrigatório.'
      },
      is: {
        args: /^\d{5}-?\d{3}$/,
        msg: 'Formato de CEP inválido. Use 12345-678.'
      }
    }
  },
  logradouro: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: 'O logradouro não pode ter mais de 255 caracteres.'
      }
    }
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'O bairro não pode ter mais de 100 caracteres.'
      }
    }
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'A cidade não pode ter mais de 100 caracteres.'
      }
    }
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: {
        args: [2, 2],
        msg: 'O estado deve ter 2 caracteres (UF).'
      },
      isUppercase: {
        msg: 'O estado deve estar em letras maiúsculas.'
      }
    }
  }
}, {
  tableName: 'enderecos',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Endereco;
