// src/models/Usuario.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
  },
  cpf: {
    type: DataTypes.STRING(14), // Formato: 000.000.000-00
    allowNull: false, // Ou false se for obrigatório
    unique: true,
    validate: {
      is: /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/ // Valida o formato do CPF
    }
  },
}, {
  tableName: 'usuarios',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['senha'] } // Por padrão, não retornar a senha
  },
  indexes: [
    {
      unique: true,
      fields: ['cpf']
    }
  ]
});

Usuario.associate = (models) => {


  // Association with Aluno (many-to-many through ResponsavelAluno)
  Usuario.belongsToMany(models.Aluno, {
    through: models.ResponsavelAluno,
    foreignKey: 'id_usuario',
    otherKey: 'id_aluno',
    as: 'alunos',
  });

  // If you need to access the join table directly
  Usuario.hasMany(models.ResponsavelAluno, {
    foreignKey: 'id_usuario',
    as: 'responsavelAlunos'
  });

  // Association with Documento
  Usuario.hasMany(models.Documento, {
    foreignKey: 'usuarioId',
    as: 'documentos'
  });

  // Association with Aula
  Usuario.hasMany(models.Aula, {
    foreignKey: 'responsavel_id',
    as: 'aulasResponsavel'
  });

  Usuario.hasMany(models.Aula, {
    foreignKey: 'professor_id',
    as: 'aulasProfessor'
  });

  // Usuário pode ser o criador de várias notificações
  Usuario.hasMany(models.Notificacao, {
    foreignKey: 'criadoPor',
    sourceKey: 'cpf',
    as: 'notificacoesCriadas'
  });

  // Usuário pode receber muitas notificações via UsuarioNotificacao
  Usuario.belongsToMany(models.Notificacao, {
    through: models.UsuarioNotificacao,
    foreignKey: 'cpfUsuario',
    otherKey: 'notificacaoId',
    sourceKey: 'cpf',
    as: 'notificacoesRecebidas'
  });

  Usuario.hasMany(models.UsuarioNotificacao, {
    foreignKey: 'cpfUsuario',
    sourceKey: 'cpf',
    as: 'usuarioNotificacoes'
  });
};

// Método para verificar a senha
Usuario.prototype.verificarSenha = function(senha) {
  return bcrypt.compareSync(senha, this.senha);
};

// Método para gerar token JWT
Usuario.prototype.gerarToken = function() {
  return jwt.sign(
    { 
      id: this.id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET || 'sua_chave_secreta',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

export default Usuario;