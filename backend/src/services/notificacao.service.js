// src/services/notificacao.service.js
import Notificacao from '../models/Notificacao.model.js';
import UsuarioNotificacao from '../models/UsuarioNotificacao.model.js';
import Usuario from '../models/Usuario.model.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

// Allow tests to override models and sequelize instance. Tests can call
// NotificacaoService.__setModelsForTests({ Notificacao, Usuario, UsuarioNotificacao, sequelize })
// to inject mock objects. This avoids relying on module-mocking ordering in ESM.
let NotificacaoModel = Notificacao;
let UsuarioNotificacaoModel = UsuarioNotificacao;
let UsuarioModel = Usuario;
let sequelizeDB = sequelize;

export const __setModelsForTests = ({ Notificacao: N, Usuario: U, UsuarioNotificacao: UN, sequelize: S }) => {
    if (N) NotificacaoModel = N;
    if (U) UsuarioModel = U;
    if (UN) UsuarioNotificacaoModel = UN;
    if (S) sequelizeDB = S;
};

export const __resetModelsForTests = () => {
    NotificacaoModel = Notificacao;
    UsuarioNotificacaoModel = UsuarioNotificacao;
    UsuarioModel = Usuario;
    sequelizeDB = sequelize;
};

class NotificacaoService {
    /**
     * Cria uma nova notificação
     */
    async criar({ titulo, mensagem, tipo = 'info', dataExpiracao, criadoPor }) {
        try {
            const notificacao = await NotificacaoModel.create({
                titulo,
                mensagem,
                tipo,
                dataExpiracao: dataExpiracao || null,
                criadoPor
            });

            // If this is a Sequelize instance, return a plain object to keep the service
            // contract simple for callers/tests.
            const plain = typeof notificacao.get === 'function' ? notificacao.get({ plain: true }) : notificacao;
            return { notificacao: plain };
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return {
                    error: true,
                    status: 400,
                    message: error.message
                };
            }
            throw error;
        }
    }

    /**
     * Lista notificações com paginação e filtros
     */
    async listar({ page = 1, limit = 10, tipo, incluirDestinatarios = true }) {
        const where = {};
        if (tipo) {
            where.tipo = tipo;
        }

        const offset = Math.max(0, (page - 1) * limit);
        const include = [{
            model: UsuarioModel,
            as: 'criador',
            attributes: ['nome', 'email']
        }];

        if (incluirDestinatarios) {
            include.push({
                model: UsuarioModel,
                as: 'destinatarios',
                attributes: ['cpf', 'nome', 'email'],
                through: {
                    attributes: ['lida', 'dataLeitura']
                }
            });
        }

    const { count, rows: notificacoes } = await NotificacaoModel.findAndCountAll({
            where,
            include,
            order: [['criadoEm', 'DESC']],
            limit,
            offset
        });

        if (incluirDestinatarios) {
            const processedNotificacoes = notificacoes.map(n => {
                const plain = n.get({ plain: true });
                const destinatarios = plain.destinatarios || [];
                const totalDest = destinatarios.length;
                const lidas = destinatarios.filter(d => d.UsuarioNotificacao?.lida).length;
                
                return {
                    ...plain,
                    metaEntrega: {
                        totalDestinatarios: totalDest,
                        lidas,
                        naoLidas: totalDest - lidas,
                        porcentagemLidas: totalDest > 0 ? Number(((lidas / totalDest) * 100).toFixed(1)) : 0
                    }
                };
            });

            return { 
                notificacoes: processedNotificacoes, 
                total: count,
                totalPaginas: Math.ceil(count / limit),
                paginaAtual: page,
                itensPorPagina: limit
            };
        }

        return { 
            notificacoes,
            total: count,
            totalPaginas: Math.ceil(count / limit),
            paginaAtual: page,
            itensPorPagina: limit
        };
    }

    /**
     * Lista notificações de um usuário específico
     */
    async listarPorUsuario({ cpfUsuario, page = 1, limit = 10, lida }) {
        const where = { cpfUsuario };
        if (lida !== undefined) {
            where.lida = lida === true || lida === 'true';
        }

        const offset = Math.max(0, (page - 1) * limit);

        const { count, rows: usuarioNotificacoes } = await UsuarioNotificacaoModel.findAndCountAll({
            where,
            include: [{
                model: NotificacaoModel,
                as: 'Notificacao',
                include: [
                    {
                        model: UsuarioModel,
                        as: 'criador',
                        attributes: ['nome']
                    },
                    {
                        model: UsuarioModel,
                        as: 'destinatarios',
                        attributes: ['cpf'],
                        through: { attributes: ['lida'] }
                    }
                ]
            }],
            order: [[NotificacaoModel, 'criadoEm', 'DESC']],
            limit,
            offset
        });

        const notificacoes = usuarioNotificacoes.map(un => {
            const notifPlain = un.Notificacao.get({ plain: true });
            const dest = Array.isArray(notifPlain.destinatarios) ? notifPlain.destinatarios : [];
            const totalDest = dest.length;
            const lidas = dest.filter(d => d.UsuarioNotificacao?.lida).length;
            
            return {
                ...notifPlain,
                lida: un.lida,
                dataLeitura: un.dataLeitura,
                metaEntrega: {
                    totalDestinatarios: totalDest,
                    lidas,
                    naoLidas: totalDest - lidas,
                    porcentagemLidas: totalDest > 0 ? Number(((lidas / totalDest) * 100).toFixed(1)) : 0
                }
            };
        });

        return {
            notificacoes,
            total: count,
            totalPaginas: Math.ceil(count / limit),
            paginaAtual: page,
            itensPorPagina: limit
        };
    }

    /**
     * Obtém uma notificação específica
     */
    async obter(id) {
    const notificacao = await NotificacaoModel.findByPk(id, {
            include: [
                {
                    model: UsuarioModel,
                    as: 'criador',
                    attributes: ['nome', 'email']
                },
                {
                    model: UsuarioModel,
                    as: 'destinatarios',
                    attributes: ['cpf', 'nome'],
                    through: { attributes: ['lida', 'dataLeitura'] }
                }
            ]
        });

        if (!notificacao) {
            return {
                error: true,
                status: 404,
                message: 'Notificação não encontrada'
            };
        }

        return { notificacao };
    }

    /**
     * Atualiza uma notificação
     */
    async atualizar(id, { titulo, mensagem, tipo, dataExpiracao }) {
    const notificacao = await NotificacaoModel.findByPk(id);
        
        if (!notificacao) {
            return {
                error: true,
                status: 404,
                message: 'Notificação não encontrada'
            };
        }

        const updates = {};
        if (titulo !== undefined) updates.titulo = titulo;
        if (mensagem !== undefined) updates.mensagem = mensagem;
        if (tipo !== undefined) updates.tipo = tipo;
        if (dataExpiracao !== undefined) updates.dataExpiracao = dataExpiracao;

        try {
            await notificacao.update(updates);
            
            return { notificacao };
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return {
                    error: true,
                    status: 400,
                    message: error.message
                };
            }
            throw error;
        }
    }

    /**
     * Exclui uma notificação
     */
    async excluir(id) {
    const notificacao = await NotificacaoModel.findByPk(id);
        
        if (!notificacao) {
            return {
                error: true,
                status: 404,
                message: 'Notificação não encontrada'
            };
        }

        await notificacao.destroy();
        return { success: true };
    }

    /**
     * Envia uma notificação para usuários específicos
     */
    async enviar(idNotificacao, usuarios) {
    const transaction = await sequelizeDB.transaction();

        try {
            const notificacao = await NotificacaoModel.findByPk(idNotificacao);
            if (!notificacao) {
                await transaction.rollback();
                return {
                    error: true,
                    status: 404,
                    message: 'Notificação não encontrada'
                };
            }

            // Remove CPFs duplicados
            const cpfsUnicos = [...new Set(usuarios)];

            // Verifica se todos os usuários existem
            const usuariosExistentes = await UsuarioModel.findAll({
                where: {
                    cpf: {
                        [Op.in]: cpfsUnicos
                    }
                },
                attributes: ['cpf']
            });

            if (usuariosExistentes.length !== cpfsUnicos.length) {
                await transaction.rollback();
                return {
                    error: true,
                    status: 400,
                    message: 'Um ou mais usuários não foram encontrados'
                };
            }

            // Cria registros de usuário-notificação
            await UsuarioNotificacaoModel.bulkCreate(
                cpfsUnicos.map(cpf => ({
                    notificacaoId: idNotificacao,
                    cpfUsuario: cpf,
                    lida: false
                })),
                {
                    transaction,
                    ignoreDuplicates: true
                }
            );

            await transaction.commit();
            return { success: true };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Marca uma notificação como lida para um usuário
     */
    async marcarComoLida(idNotificacao, cpfUsuario) {
    const usuarioNotificacao = await UsuarioNotificacaoModel.findOne({
            where: {
                notificacaoId: idNotificacao,
                cpfUsuario
            },
            include: [{
                model: NotificacaoModel,
                as: 'Notificacao'
            }]
        });

        if (!usuarioNotificacao) {
            return {
                error: true,
                status: 404,
                message: 'Notificação não encontrada para este usuário'
            };
        }

        if (!usuarioNotificacao.lida) {
            await usuarioNotificacao.update({
                lida: true,
                dataLeitura: new Date()
            });
        }

        return { notificacao: usuarioNotificacao.Notificacao };
    }

    /**
     * Lista os usuários de uma notificação
     */
    async listarUsuarios(idNotificacao) {
    const notificacao = await NotificacaoModel.findByPk(idNotificacao, {
            include: [{
                model: UsuarioModel,
                as: 'destinatarios',
                through: { attributes: ['lida', 'dataLeitura'] }
            }]
        });

        if (!notificacao) {
            return {
                error: true,
                status: 404,
                message: 'Notificação não encontrada'
            };
        }

        return { usuarios: notificacao.destinatarios };
    }
}

export default NotificacaoService;