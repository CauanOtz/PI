// src/models/Usuario.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * @openapi
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do usuário.
 *           example: 1
 *         nome:
 *           type: string
 *           maxLength: 100
 *           description: Nome completo do usuário.
 *           example: "João da Silva"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 100
 *           description: E-mail do usuário (deve ser único).
 *           example: "joao@escola.com"
 *         senha:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário (será armazenada como hash).
 *           example: "senha123"
 *         telefone:
 *           type: string
 *           maxLength: 20
 *           nullable: true
 *           description: Telefone do usuário.
 *           example: "(11) 99999-9999"
 *         role:
 *           type: string
 *           enum: [admin, responsavel]
 *           description: Papel do usuário no sistema.
 *           example: "responsavel"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização do registro.
 */
const Usuario = sequelize.define('Usuario', {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  nome: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING(100), 
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: { 
    type: DataTypes.STRING, 
    allowNull: false,
    set(value) {
      // Hash da senha antes de salvar
      const hash = bcrypt.hashSync(value, 10);
      this.setDataValue('senha', hash);
    }
  },
  telefone: { 
    type: DataTypes.STRING(20), 
    allowNull: true 
  },
  role: { 
    type: DataTypes.ENUM('admin', 'responsavel'), 
    allowNull: false,
    defaultValue: 'responsavel'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['senha'] } // Por padrão, não retornar a senha
  }
});

// Método para verificar a senha
Usuario.prototype.verificarSenha = function(senha) {
  return bcrypt.compareSync(senha, this.senha);
};

export default Usuario;