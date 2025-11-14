// src/models/Assistido.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Documento from './Documento.model.js';
import { validarCartaoSUS, formatarCartaoSUS } from '../utils/validacoes.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Assistido:
 *       type: object
 *       required:
 *         - nome
 *         - dataNascimento
 *         - sexo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do assistido.
 *           example: 1
 *         nome:
 *           type: string
 *           maxLength: 100
 *           description: Nome completo do assistido.
 *           example: "Maria Oliveira"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do assistido.
 *           example: "2015-07-22"
 *         sexo:
 *           type: string
 *           enum: ['Feminino', 'Masculino']
 *           description: Sexo do assistido.
 *           example: "Feminino"
 *         cartaoSus:
 *           type: string
 *           maxLength: 20
 *           description: Número do cartão do SUS.
 *           example: "163704163610004"
 *           nullable: true
 *         rg:
 *           type: string
 *           maxLength: 20
 *           description: Número do RG.
 *           example: "12.345.678-9"
 *           nullable: true
 *         endereco:
 *           type: string
 *           maxLength: 255
 *           description: Logradouro e número.
 *           example: "Rua das Flores, 123"
 *           nullable: true
 *         bairro:
 *           type: string
 *           maxLength: 100
 *           description: Bairro de residência.
 *           example: "Centro"
 *           nullable: true
 *         cep:
 *           type: string
 *           maxLength: 9
 *           description: CEP da residência.
 *           example: "12345-678"
 *           nullable: true
 *         cidade:
 *           type: string
 *           maxLength: 100
 *           description: Cidade de residência.
 *           example: "São Paulo"
 *           nullable: true
 *         contato:
 *           type: string
 *           maxLength: 20
 *           description: Telefone para contato.
 *           example: "(11) 98765-4321"
 *           nullable: true
 *         problemasSaude:
 *           type: string
 *           maxLength: 1000
 *           description: Descrição de problemas de saúde, alergias ou condições especiais.
 *           example: "Alergia a amendoim"
 *           nullable: true
 *         pai:
 *           type: string
 *           maxLength: 100
 *           description: Nome completo do pai.
 *           example: "João Oliveira"
 *           nullable: true
 *         mae:
 *           type: string
 *           maxLength: 100
 *           description: Nome completo da mãe.
 *           example: "Maria Silva Oliveira"
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro.
 *           example: "2025-07-22T12:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do registro.
 *           example: "2025-07-22T12:00:00.000Z"
 */

const Assistido = sequelize.define('Assistido', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome do assistido é obrigatório.'
      },
      len: {
        args: [3, 100],
        msg: 'O nome deve ter entre 3 e 100 caracteres.'
      }
    }
  },
  dataNascimento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'data_nascimento',
    validate: {
      isDate: {
        msg: 'Data de nascimento inválida.'
      },
      isNotFuture(value) {
        const hoje = new Date();
        const dataNasc = new Date(value);
        if (dataNasc > hoje) {
          throw new Error('A data de nascimento não pode ser no futuro.');
        }
      }
    },
    get() {
      return this.getDataValue('dataNascimento');
    },
    set(value) {
      if (value) {
        // Converte para YYYY-MM-DD se vier em outro formato
        const data = new Date(value);
        const dataFormatada = data.toISOString().split('T')[0];
        this.setDataValue('dataNascimento', dataFormatada);
      }
    }
  },
  sexo: {
    type: DataTypes.ENUM('Feminino', 'Masculino'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Feminino', 'Masculino']],
        msg: 'O sexo deve ser Feminino ou Masculino.'
      }
    }
  },
  pai: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'O nome do pai não pode ter mais de 100 caracteres.'
      }
    }
  },
  mae: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'O nome da mãe não pode ter mais de 100 caracteres.'
      }
    }
  },
  cartaoSus: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'cartao_sus',
    validate: {
      isValidCartaoSUS(value) {
        if (value && !validarCartaoSUS(value)) {
          throw new Error('Número do cartão SUS inválido.');
        }
      }
    },
    get() {
      const rawValue = this.getDataValue('cartaoSus');
      return rawValue ? formatarCartaoSUS(rawValue) : null;
    },
    set(value) {
      this.setDataValue('cartaoSus', value ? value.replace(/\D/g, '') : null);
    }
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'O RG não pode ter mais de 20 caracteres.'
      }
    }
  },
  enderecoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'endereco_id',
    references: {
      model: 'enderecos',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  numero: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'O número não pode ter mais de 20 caracteres.'
      }
    }
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'O complemento não pode ter mais de 100 caracteres.'
      }
    }
  },
  problemasSaude: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'problemas_saude'
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
  tableName: 'assistidos',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (assistido) => {
      console.log('Dados antes da validação:', assistido.toJSON());
    },
    beforeCreate: (assistido) => {
      console.log('Dados antes de criar:', assistido.toJSON());
    }
  }
});

Assistido.associate = (models) => {
  // Association with Endereco
  Assistido.belongsTo(models.Endereco, {
    foreignKey: 'enderecoId',
    as: 'endereco',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Association with ContatoAssistido
  Assistido.hasMany(models.ContatoAssistido, {
    foreignKey: 'assistidoId',
    as: 'contatos',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Association with FiliacaoAssistido
  Assistido.hasMany(models.FiliacaoAssistido, {
    foreignKey: 'assistidoId',
    as: 'filiacao',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Association with Documento
  Assistido.hasMany(models.Documento, {
    foreignKey: 'assistidoId',
    as: 'documentos',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Association with Presenca
  Assistido.hasMany(models.Presenca, {
    foreignKey: 'idAssistido',
    as: 'presencas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export { Assistido as default };