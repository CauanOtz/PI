// test/helpers/initAssociations.js
import Notificacao from '../../src/models/Notificacao.model.js';
import Usuario from '../../src/models/Usuario.model.js';
import UsuarioNotificacao from '../../src/models/UsuarioNotificacao.model.js';

export function initAssociations() {
    const models = { Notificacao, Usuario, UsuarioNotificacao };
    
    // Initialize associations
    Object.values(models).forEach(model => {
        if (typeof model.associate === 'function') {
            model.associate(models);
        }
    });
}