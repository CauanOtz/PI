// src/models/index.js
import { sequelize } from '../config/database.js';

// Import all models
import Assistido from './Assistido.model.js';
import Usuario from './Usuario.model.js';
import Documento from './Documento.model.js';
import ResponsavelAssistido from './ResponsavelAssistido.model.js';
import Notificacao from './Notificacao.model.js';
import Presenca from './Presenca.model.js';
import Aula from './Aula.model.js';
import UsuarioNotificacao from './UsuarioNotificacao.model.js'; 

// Initialize models
const models = {
  Assistido,
  Usuario,
  Documento,
  ResponsavelAssistido,
  Notificacao,
  Presenca,
  Aula,
  UsuarioNotificacao,
};

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Sync all models with the database
const syncModels = async () => {
  try {
    // Avoid altering enums/types automatically at startup. Use migrations for schema changes.
    await sequelize.sync({ alter: false });
    console.log('Modelos sincronizados (sem alter) com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
};

export {
  sequelize,
  syncModels,
  Assistido,
  Usuario,
  Documento,
  ResponsavelAssistido,
  Notificacao,
  Presenca,
  Aula,
  UsuarioNotificacao,
};

export default models;
