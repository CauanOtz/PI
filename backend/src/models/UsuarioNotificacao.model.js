import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     UsuarioNotificacao:
 *       type: object
 *       required:
 *         - notificacaoId
 *         - cpfUsuario
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-gerado do relacionamento
 *         notificacaoId:
 *           type: integer
 *           description: ID da notificação
 *         cpfUsuario:
 *           type: string
 *           format: cpf
 *           description: CPF do usuário que recebeu a notificação
 *         lida:
 *           type: boolean
 *           description: Indica se a notificação foi lida
 *           default: false
 *         dataLeitura:
 *           type: string
 *           format: date-time
 *           description: Data e hora em que a notificação foi lida
 */

const UsuarioNotificacao = sequelize.define('UsuarioNotificacao', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  notificacaoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notificacoes',
      key: 'id'
    },
    field: 'notificacao_id'
  },
  cpfUsuario: {
    type: DataTypes.STRING(14), // Formato: 000.000.000-00
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'cpf'
    },
    validate: {
      is: /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/
    },
    field: 'cpf_usuario'
  },
  lida: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dataLeitura: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_leitura'
  }
}, {
  tableName: 'usuarios_notificacoes',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  indexes: [
    {
      unique: true,
      fields: ['notificacao_id', 'cpf_usuario']
    }
  ]
});

export default UsuarioNotificacao;
