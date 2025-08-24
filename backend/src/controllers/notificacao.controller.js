import { Op } from 'sequelize';
import Notificacao from '../models/Notificacao.model.js';
import Usuario from '../models/Usuario.model.js';
import UsuarioNotificacao from '../models/UsuarioNotificacao.model.js';

/**
 * Cria uma nova notificação
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @param {Function} next - Próximo middleware
 */
export const criarNotificacao = async (req, res, next) => {
  try {
    const { titulo, mensagem, tipo, dataExpiracao } = req.body;
    const criadoPor = req.usuario.cpf; // Obtém o CPF do usuário autenticado

    const notificacao = await Notificacao.create({
      titulo,
      mensagem,
      tipo,
      dataExpiracao,
      criadoPor
    });

    res.status(201).json({
      mensagem: 'Notificação criada com sucesso',
      notificacao
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista todas as notificações (para admin)
 */
export const listarNotificacoes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tipo } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (tipo) where.tipo = tipo;

    const { count, rows: notificacoes } = await Notificacao.findAndCountAll({
      where,
      include: [{
        model: Usuario,
        as: 'criador',
        attributes: ['nome', 'email']
      }],
      order: [['criadoEm', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      notificacoes,
      paginacao: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtém uma notificação específica
 */
export const obterNotificacao = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notificacao = await Notificacao.findByPk(id, {
      include: [{
        model: Usuario,
        as: 'criador',
        attributes: ['nome', 'email']
      }]
    });

    if (!notificacao) {
      return res.status(404).json({
        mensagem: 'Notificação não encontrada'
      });
    }

    res.status(200).json(notificacao);
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza uma notificação
 */
export const atualizarNotificacao = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, mensagem, tipo, dataExpiracao } = req.body;

    const notificacao = await Notificacao.findByPk(id);
    
    if (!notificacao) {
      return res.status(404).json({
        mensagem: 'Notificação não encontrada'
      });
    }

    // Verifica se o usuário é o criador da notificação ou admin
    if (notificacao.criadoPor !== req.usuario.cpf && req.usuario.role !== 'admin') {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para atualizar esta notificação'
      });
    }

    // Atualiza apenas os campos fornecidos
    if (titulo) notificacao.titulo = titulo;
    if (mensagem) notificacao.mensagem = mensagem;
    if (tipo) notificacao.tipo = tipo;
    if (dataExpiracao) notificacao.dataExpiracao = dataExpiracao;

    await notificacao.save();

    res.status(200).json({
      mensagem: 'Notificação atualizada com sucesso',
      notificacao
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exclui uma notificação
 */
export const excluirNotificacao = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacao = await Notificacao.findByPk(id);
    
    if (!notificacao) {
      return res.status(404).json({
        mensagem: 'Notificação não encontrada'
      });
    }

    // Verifica se o usuário é o criador da notificação ou admin
    if (notificacao.criadoPor !== req.usuario.cpf && req.usuario.role !== 'admin') {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para excluir esta notificação'
      });
    }

    await notificacao.destroy();

    res.status(200).json({
      mensagem: 'Notificação excluída com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista notificações de um usuário específico
 */
export const listarNotificacoesUsuario = async (req, res, next) => {
  try {
    const { cpfUsuario } = req.params;
    const { lida, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Verifica se o usuário está tentando acessar suas próprias notificações ou se é admin
    if (cpfUsuario !== req.usuario.cpf && req.usuario.role !== 'admin') {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para acessar estas notificações'
      });
    }

    const where = { cpfUsuario };
    if (lida !== undefined) {
      where.lida = lida === 'true';
    }

    const { count, rows: usuarioNotificacoes } = await UsuarioNotificacao.findAndCountAll({
      where,
      include: [{
        model: Notificacao,
        include: [{
          model: Usuario,
          as: 'criador',
          attributes: ['nome']
        }]
      }],
      order: [[Notificacao, 'criadoEm', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);
    
    // Formata a resposta para incluir informações da notificação e status de leitura
    const notificacoes = usuarioNotificacoes.map(un => ({
      ...un.Notificacao.get({ plain: true }),
      lida: un.lida,
      dataLeitura: un.dataLeitura
    }));

    res.status(200).json({
      notificacoes,
      paginacao: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marca uma notificação como lida
 */
export const marcarComoLida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cpfUsuario = req.usuario.cpf;

    const usuarioNotificacao = await UsuarioNotificacao.findOne({
      where: {
        notificacaoId: id,
        cpfUsuario
      },
      include: [Notificacao]
    });

    if (!usuarioNotificacao) {
      return res.status(404).json({
        mensagem: 'Notificação não encontrada para este usuário'
      });
    }

    if (!usuarioNotificacao.lida) {
      usuarioNotificacao.lida = true;
      usuarioNotificacao.dataLeitura = new Date();
      await usuarioNotificacao.save();
    }

    res.status(200).json({
      mensagem: 'Notificação marcada como lida',
      notificacao: {
        ...usuarioNotificacao.Notificacao.get({ plain: true }),
        lida: true,
        dataLeitura: usuarioNotificacao.dataLeitura
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Envia/associa uma notificação a um ou mais usuários
 */
export const enviarNotificacao = async (req, res, next) => {
  try {
    const { idNotificacao } = req.params;
    const { usuarios } = req.body; // Array de CPFs

    // Verifica se a notificação existe
    const notificacao = await Notificacao.findByPk(idNotificacao);
    if (!notificacao) {
      return res.status(404).json({
        mensagem: 'Notificação não encontrada'
      });
    }

    // Verifica se o usuário é o criador da notificação ou admin
    if (notificacao.criadoPor !== req.usuario.cpf && req.usuario.role !== 'admin') {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para enviar esta notificação'
      });
    }

    // Verifica se os usuários existem
    const usuariosExistentes = await Usuario.findAll({
      where: {
        cpf: usuarios
      },
      attributes: ['cpf']
    });

    const cpfsExistentes = usuariosExistentes.map(u => u.cpf);
    const cpfsNaoEncontrados = usuarios.filter(cpf => !cpfsExistentes.includes(cpf));

    if (cpfsNaoEncontrados.length > 0) {
      return res.status(400).json({
        mensagem: 'Alguns usuários não foram encontrados',
        usuariosNaoEncontrados: cpfsNaoEncontrados
      });
    }

    // Cria as associações
    const associacoes = await Promise.all(
      cpfsExistentes.map(cpf => 
        UsuarioNotificacao.findOrCreate({
          where: {
            notificacaoId: idNotificacao,
            cpfUsuario: cpf
          },
          defaults: {
            lida: false
          }
        })
      )
    );

    // Conta quantas associações foram criadas (o segundo valor do array retornado por findOrCreate)
    const novasAssociacoes = associacoes.filter(([_, criado]) => criado).length;
    const associacoesExistentes = associacoes.length - novasAssociacoes;

    res.status(201).json({
      mensagem: 'Notificação enviada com sucesso',
      totalEnviadas: cpfsExistentes.length,
      novasAssociacoes,
      associacoesExistentes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista usuários que receberam uma notificação específica
 */
export const listarUsuariosNotificacao = async (req, res, next) => {
  try {
    const { idNotificacao } = req.params;
    const { lida, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Verifica se a notificação existe e se o usuário tem permissão
    const notificacao = await Notificacao.findByPk(idNotificacao);
    
    if (!notificacao) {
      return res.status(404).json({
        mensagem: 'Notificação não encontrada'
      });
    }

    // Apenas o criador da notificação ou admin pode ver quem recebeu
    if (notificacao.criadoPor !== req.usuario.cpf && req.usuario.role !== 'admin') {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para ver os destinatários desta notificação'
      });
    }

    const where = { notificacaoId: idNotificacao };
    if (lida !== undefined) {
      where.lida = lida === 'true';
    }

    const { count, rows: usuarioNotificacoes } = await UsuarioNotificacao.findAndCountAll({
      where,
      include: [{
        model: Usuario,
        attributes: ['nome', 'email', 'cpf']
      }],
      order: [['criado_em', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);
    
    // Formata a resposta
    const usuarios = usuarioNotificacoes.map(un => ({
      ...un.Usuario.get({ plain: true }),
      lida: un.lida,
      dataLeitura: un.dataLeitura
    }));

    res.status(200).json({
      usuarios,
      paginacao: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};
