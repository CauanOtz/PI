import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Notificacao:
 *       type: object
 *       required:
 *         - titulo
 *         - mensagem
 *         - tipo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado da notificação
 *         titulo:
 *           type: string
 *           maxLength: 100
 *           description: Título da notificação
 *         mensagem:
 *           type: text
 *           description: Conteúdo da mensagem da notificação
 *         tipo:
 *           type: string
 *           enum: [info, alerta, urgente, sistema]
 *           description: Tipo da notificação
 *         dataEnvio:
 *           type: string
 *           format: date-time
 *           description: Data e hora do envio da notificação
 *         dataExpiracao:
 *           type: string
 *           format: date-time
 *           description: Data de expiração da notificação (opcional)
 *         criadoPor:
 *           type: string
 *           format: cpf
 *           description: CPF do usuário que criou a notificação
 */

const Notificacao = sequelize.define('Notificacao', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O título da notificação é obrigatório.'
      },
      len: {
        args: [3, 100],
        msg: 'O título deve ter entre 3 e 100 caracteres.'
      }
    }
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A mensagem da notificação é obrigatória.'
      }
    }
  },
  tipo: {
    type: DataTypes.ENUM('info', 'alerta', 'urgente', 'sistema'),
    allowNull: false,
    defaultValue: 'info'
  },
  dataEnvio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dataExpiracao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  criadoPor: {
    type: DataTypes.STRING(14), // Formato: 000.000.000-00
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'cpf'
    },
    validate: {
      is: /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/
    }
  }
}, {
  tableName: 'notificacoes',
  timestamps: true,
  createdAt: 'criadoEm',
  updatedAt: 'atualizadoEm'
});

export default Notificacao;
