// src/models/ResponsavelAssistido.model.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ResponsavelAssistido = sequelize.define('ResponsavelAssistido', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  id_assistido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assistidos',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
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
  tableName: 'responsaveis_assistidos',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

ResponsavelAssistido.associate = (models) => {
  ResponsavelAssistido.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario',
    as: 'usuario',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  ResponsavelAssistido.belongsTo(models.Assistido, {
    foreignKey: 'id_assistido',
    as: 'assistido',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default ResponsavelAssistido;