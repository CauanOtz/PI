// test/helpers/initNotificacaoAssociations.js
import Notificacao from '../../src/models/Notificacao.model.js';
import Usuario from '../../src/models/Usuario.model.js';
import UsuarioNotificacao from '../../src/models/UsuarioNotificacao.model.js';

export function initNotificacaoAssociations() {
    // Initialize only the notification-related associations
    
    // Notificação pertence a um usuário (criador)
    Notificacao.belongsTo(Usuario, {
        foreignKey: 'criadoPor',
        as: 'criador',
        targetKey: 'cpf'
    });

    // Relação many-to-many via UsuarioNotificacao
    Notificacao.belongsToMany(Usuario, {
        through: UsuarioNotificacao,
        foreignKey: 'notificacaoId',
        otherKey: 'cpfUsuario',
        targetKey: 'cpf',
        as: 'destinatarios'
    });

    // Acesso direto às associações UsuarioNotificacao
    Notificacao.hasMany(UsuarioNotificacao, {
        foreignKey: 'notificacaoId',
        as: 'usuarioNotificacoes'
    });

    // Usuário pode ser o criador de várias notificações
    Usuario.hasMany(Notificacao, {
        foreignKey: 'criadoPor',
        sourceKey: 'cpf',
        as: 'notificacoesCriadas'
    });

    // Usuário pode receber muitas notificações via UsuarioNotificacao
    Usuario.belongsToMany(Notificacao, {
        through: UsuarioNotificacao,
        foreignKey: 'cpfUsuario',
        otherKey: 'notificacaoId',
        sourceKey: 'cpf',
        as: 'notificacoesRecebidas'
    });

    Usuario.hasMany(UsuarioNotificacao, {
        foreignKey: 'cpfUsuario',
        sourceKey: 'cpf',
        as: 'usuarioNotificacoes'
    });

    // UsuarioNotificacao associations
    UsuarioNotificacao.belongsTo(Notificacao, {
        foreignKey: 'notificacaoId',
        as: 'Notificacao'
    });

    UsuarioNotificacao.belongsTo(Usuario, {
        foreignKey: 'cpfUsuario',
        targetKey: 'cpf',
        as: 'Usuario'
    });
}