// src/models/index.js
import { sequelize } from '../config/database.js';

// Import all models
import Assistido from './Assistido.model.js';
import Usuario from './Usuario.model.js';
import Documento from './Documento.model.js';
import Presenca from './Presenca.model.js';
import Atividade from './Atividade.model.js';
import Endereco from './Endereco.model.js';
import ContatoAssistido from './ContatoAssistido.model.js';
import FiliacaoAssistido from './FiliacaoAssistido.model.js';

// Initialize models
const models = {
  Assistido,
  Usuario,
  Documento,
  Presenca,
  Atividade,
  Endereco,
  ContatoAssistido,
  FiliacaoAssistido,
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
  Presenca,
  Atividade,
  Endereco,
  ContatoAssistido,
  FiliacaoAssistido,
};

export default models;
