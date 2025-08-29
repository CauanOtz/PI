// src/models/index.js
import { sequelize } from '../config/database.js';

// Import all models
import Aluno from './Aluno.model.js';
import Usuario from './Usuario.model.js';
import Documento from './Documento.model.js';
import ResponsavelAluno from './ResponsavelAluno.model.js';
import Notificacao from './Notificacao.model.js';
import Presenca from './Presenca.model.js';
import Aula from './Aula.model.js';
import UsuarioNotificacao from './UsuarioNotificacao.model.js';

// Initialize models
const models = {
  Aluno,
  Usuario,
  Documento,
  ResponsavelAluno,
  Notificacao,
  Presenca,
  Aula,
  UsuarioNotificacao,
};

// Run associations
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Sync all models with the database
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar modelos:', error);
  }
};

export {
  sequelize,
  syncModels,
  Aluno,
  Usuario,
  Documento,
  ResponsavelAluno,
  Notificacao,
  Presenca,
  Aula,
  UsuarioNotificacao,
};

export default models;
