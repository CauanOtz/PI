import { Op } from 'sequelize';
import Notificacao from '../models/Notificacao.model.js';
import Usuario from '../models/Usuario.model.js';
import UsuarioNotificacao from '../models/UsuarioNotificacao.model.js';
import { normalizeCpf, formatCpf } from '../utils/cpf.js';

/**
 * Cria uma nova notificação
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @param {Function} next - Próximo middleware
 */
export const criarNotificacao = async (req, res, next) => {
  try {
    const { titulo, mensagem, tipo, dataExpiracao, usuarios: rawUsuarios } = req.body;
    const criadoPor = req.usuario.cpf; // Obtém o CPF do usuário autenticado

    const notificacao = await Notificacao.create({
      titulo,
      mensagem,
      tipo,
      dataExpiracao,
      criadoPor
    });
    let destinatariosAssociados = [];
    let metaEntrega = {
      totalDestinatarios: 0,
      lidas: 0,
      naoLidas: 0,
      porcentagemLidas: 0
    };

    // Se o cliente já enviar uma lista de usuários (CPFs) na criação, associamos aqui
    if (Array.isArray(rawUsuarios) && rawUsuarios.length > 0) {
      try {
        console.debug('[criarNotificacao] Recebido usuarios (raw):', rawUsuarios);
        const normalizedDigits = rawUsuarios
          .map(u => normalizeCpf(u))
          .filter(Boolean);
        console.debug('[criarNotificacao] Normalizados:', normalizedDigits);

        const formatoInvalido = normalizedDigits.filter(d => d.length !== 11);
        if (formatoInvalido.length > 0) {
          return res.status(400).json({ mensagem: 'CPFs com formato/tamanho inválido: ' + formatoInvalido.join(', ') });
        }

        const uniqueDigits = [...new Set(normalizedDigits)];
        const usuarios = uniqueDigits.map(d => formatCpf(d));

        const usuariosExistentes = await Usuario.findAll({
          where: { cpf: usuarios },
          attributes: ['cpf']
        });
        console.debug('[criarNotificacao] CPFs formatados para associação:', usuarios, 'Encontrados:', usuariosExistentes.map(u=>u.cpf));
        const cpfsExistentes = usuariosExistentes.map(u => u.cpf);
        const cpfsNaoEncontrados = usuarios.filter(cpf => !cpfsExistentes.includes(cpf));
        if (cpfsNaoEncontrados.length > 0) {
          return res.status(400).json({
            mensagem: 'Alguns usuários não foram encontrados',
            usuariosNaoEncontrados: cpfsNaoEncontrados
          });
        }

        for (const cpf of cpfsExistentes) {
          console.debug('[criarNotificacao] Associando notificacao', notificacao.id, '->', cpf);
          try {
            await UsuarioNotificacao.findOrCreate({
              where: { notificacaoId: notificacao.id, cpfUsuario: cpf },
              defaults: { lida: false }
            });
          } catch (assocErr) {
            console.error('[criarNotificacao] Erro ao associar', { notificacaoId: notificacao.id, cpf, message: assocErr.message, stack: assocErr.stack });
            if (assocErr?.parent) {
              console.error('[criarNotificacao] SQL parent error:', assocErr.parent.message, assocErr.parent.code, assocErr.parent.sql);
            }
            throw assocErr;
          }
        }

        // Recarrega notificação com destinatários
        const recarregada = await Notificacao.findByPk(notificacao.id, {
          include: [{
            model: Usuario,
            as: 'destinatarios',
            attributes: ['cpf', 'nome', 'email'],
            through: { attributes: ['lida', 'dataLeitura'] }
          }, {
            model: Usuario,
            as: 'criador',
            attributes: ['nome', 'email']
          }]
        });

        if (recarregada) {
          const plain = recarregada.get({ plain: true });
            destinatariosAssociados = plain.destinatarios || [];
            const totalDest = destinatariosAssociados.length;
            const lidas = destinatariosAssociados.filter(d => d.UsuarioNotificacao?.lida).length;
            metaEntrega = {
              totalDestinatarios: totalDest,
              lidas,
              naoLidas: totalDest - lidas,
              porcentagemLidas: totalDest > 0 ? Number(((lidas / totalDest) * 100).toFixed(1)) : 0
            };
        }
      } catch (assocErr) {
        // Não falhamos a criação caso associação falhe; retornamos aviso
        return res.status(201).json({
          mensagem: 'Notificação criada, mas houve erro ao associar destinatários',
          erroAssociacao: assocErr.message,
          notificacao
        });
      }
    }

    res.status(201).json({
      mensagem: 'Notificação criada com sucesso',
      notificacao: {
        ...notificacao.get({ plain: true }),
        destinatarios: destinatariosAssociados,
        metaEntrega
      }
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
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const tipo = req.query.tipo;
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    // clamp limit to backend policy
    if (limit > 100) limit = 100;
    const offset = Math.max(0, (page - 1) * limit);
    
    const where = {};
    if (tipo) where.tipo = tipo;

  // Para admins, por padrão incluímos destinatários (economiza ida extra do front).
  // Pode desabilitar explicitamente com ?includeDestinatarios=false
  const includeParam = String(req.query.includeDestinatarios || '').toLowerCase();
  const incluirDestinatarios = includeParam === 'false' ? false : true; // default true agora

    const include = [{
      model: Usuario,
      as: 'criador',
      attributes: ['nome', 'email']
    }];

    if (incluirDestinatarios) {
      // inclui destinatários básicos + estado de leitura agregada
      include.push({
        model: Usuario,
        as: 'destinatarios',
        attributes: ['cpf', 'nome', 'email'],
        through: {
          attributes: ['lida', 'dataLeitura']
        }
      });
    }

    const { count, rows: notificacoes } = await Notificacao.findAndCountAll({
      where,
      include,
      order: [['criadoEm', 'DESC']],
      limit,
      offset
    });

  const totalPages = Math.ceil(count / limit);
    
    // Se destinatários foram incluídos, podemos adicionar métricas de leitura para cada notificação
    let payload = notificacoes;
    if (incluirDestinatarios) {
      payload = notificacoes.map(n => {
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
    }

    res.status(200).json({
      notificacoes: payload,
      paginacao: {
        total: count,
        totalPages,
        currentPage: page,
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
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const lida = req.query.lida;
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    if (limit > 100) limit = 100;
    const offset = Math.max(0, (page - 1) * limit);

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
        include: [
          {
            model: Usuario,
            as: 'criador',
            attributes: ['nome']
          },
          {
            model: Usuario,
            as: 'destinatarios',
            attributes: ['cpf'],
            through: { attributes: ['lida'] }
          }
        ]
      }],
      order: [[Notificacao, 'criadoEm', 'DESC']],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);
    
    // Formata a resposta para incluir informações da notificação e status de leitura
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

    res.status(200).json({
      notificacoes,
      paginacao: {
        total: count,
        totalPages,
        currentPage: page,
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
    const idNumber = Number(req.params.id);
    const cpfUsuario = req.usuario.cpf;

    // Sanity: garantir ID válido (validator já deveria ter feito isso)
    if (!Number.isInteger(idNumber) || idNumber < 1) {
      return res.status(404).json({ mensagem: 'ID inválido' });
    }

    let usuarioNotificacao = await UsuarioNotificacao.findOne({
      where: { notificacaoId: idNumber, cpfUsuario },
      include: [{ model: Notificacao, as: 'Notificacao' }]
    });

    if (!usuarioNotificacao) {
      usuarioNotificacao = await UsuarioNotificacao.findOne({ where: { notificacaoId: idNumber, cpfUsuario } });
    }

    if (!usuarioNotificacao) {
      // Diagnósticos adicionais para retornar mensagem mais clara
      const notificacao = await Notificacao.findByPk(idNumber);
      if (!notificacao) {
        return res.status(404).json({ mensagem: 'Notificação inexistente' });
      }

      const totalDestinatarios = await UsuarioNotificacao.count({ where: { notificacaoId: idNumber } });

      // Caso 1: ninguém recebeu ainda
      if (totalDestinatarios === 0) {
        return res.status(403).json({ mensagem: 'A notificação ainda não foi enviada a nenhum destinatário.' });
      }

      // Caso 2: usuário é criador ou admin mas não está como destinatário
      if (notificacao.criadoPor === cpfUsuario || req.usuario.role === 'admin') {
        return res.status(403).json({ mensagem: 'Você é criador/admin, mas não está listado como destinatário desta notificação.' });
      }

      // Caso 3: usuário comum que não recebeu
      return res.status(404).json({ mensagem: 'Notificação não foi enviada para este usuário.' });
    }

    if (!usuarioNotificacao.lida) {
      usuarioNotificacao.lida = true;
      usuarioNotificacao.dataLeitura = new Date();
      await usuarioNotificacao.save();
    }

    // Obter dados básicos da notificação (se não veio no include)
    let notifData = usuarioNotificacao.Notificacao;
    if (!notifData) {
      notifData = await Notificacao.findByPk(idNumber);
    }

    const plain = notifData ? notifData.get({ plain: true }) : { id: Number(id) };

    res.status(200).json({
      mensagem: 'Notificação marcada como lida',
      notificacao: {
        ...plain,
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
  const idNotificacao = Number(req.params.id);
    const { usuarios: rawUsuarios } = req.body; // Array de CPFs (can be digits or formatted)
    console.debug('[enviarNotificacao] idNotificacao:', idNotificacao, 'usuarios raw:', rawUsuarios);

    const usuariosArray = Array.isArray(rawUsuarios) ? rawUsuarios : [];
    const normalizedDigits = usuariosArray
      .map(u => normalizeCpf(u))
      .filter(Boolean);
    console.debug('[enviarNotificacao] Normalized digits:', normalizedDigits);

    if (normalizedDigits.length === 0) {
      return res.status(400).json({ mensagem: 'É necessário informar pelo menos um usuário (CPF).' });
    }

    // Aceitamos qualquer sequência de 11 dígitos (checksum ignorado) para permitir CPFs de teste.
    const formatoInvalido = normalizedDigits.filter(d => d.length !== 11);
    if (formatoInvalido.length > 0) {
      return res.status(400).json({ mensagem: 'CPFs com formato/tamanho inválido: ' + formatoInvalido.join(', ') });
    }

    const uniqueDigits = [...new Set(normalizedDigits)];
    const usuarios = uniqueDigits.map(d => formatCpf(d)); // formatted list to match DB storage

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

    // Verifica se os usuários existem (Usuario.cpf está no formato 000.000.000-00)
    const usuariosExistentes = await Usuario.findAll({
      where: {
        cpf: usuarios
      },
      attributes: ['cpf']
    });
    console.debug('[enviarNotificacao] CPFs buscados:', usuarios, 'Existentes:', usuariosExistentes.map(u=>u.cpf));

    const cpfsExistentes = usuariosExistentes.map(u => u.cpf);
    const cpfsNaoEncontrados = usuarios.filter(cpf => !cpfsExistentes.includes(cpf));
    if (cpfsNaoEncontrados.length > 0) {
      return res.status(400).json({
        mensagem: 'Alguns usuários não foram encontrados',
        usuariosNaoEncontrados: cpfsNaoEncontrados
      });
    }

    // Cria as associações
    const associacoes = [];
    for (const cpf of cpfsExistentes) {
      console.debug('[enviarNotificacao] Associando notificacao', idNotificacao, '->', cpf);
      try {
        const record = await UsuarioNotificacao.findOrCreate({
          where: { notificacaoId: idNotificacao, cpfUsuario: cpf },
          defaults: { lida: false }
        });
        associacoes.push(record);
      } catch (assocErr) {
        console.error('[enviarNotificacao] Erro ao associar', { notificacaoId: idNotificacao, cpf, message: assocErr.message, stack: assocErr.stack });
        if (assocErr?.parent) {
          console.error('[enviarNotificacao] SQL parent error:', assocErr.parent.message, assocErr.parent.code, assocErr.parent.sql);
        }
        throw assocErr; // rethrow to ser tratado pelo catch externo
      }
    }

    // Conta quantas associações foram criadas (o segundo valor do array retornado por findOrCreate)
    const novasAssociacoes = associacoes.filter(([_, criado]) => criado).length;
    const associacoesExistentes = associacoes.length - novasAssociacoes;

    // Recarrega notificação com destinatários para devolver estado atualizado
    const recarregada = await Notificacao.findByPk(idNotificacao, {
      include: [{
        model: Usuario,
        as: 'destinatarios',
        attributes: ['cpf', 'nome', 'email'],
        through: { attributes: ['lida', 'dataLeitura'] }
      }, {
        model: Usuario,
        as: 'criador',
        attributes: ['nome', 'email']
      }]
    });

    let notificacaoPayload = null;
    if (recarregada) {
      const plain = recarregada.get({ plain: true });
      const destinatarios = plain.destinatarios || [];
      const totalDest = destinatarios.length;
      const lidas = destinatarios.filter(d => d.UsuarioNotificacao?.lida).length;
      notificacaoPayload = {
        ...plain,
        metaEntrega: {
          totalDestinatarios: totalDest,
          lidas,
          naoLidas: totalDest - lidas,
          porcentagemLidas: totalDest > 0 ? Number(((lidas / totalDest) * 100).toFixed(1)) : 0
        }
      };
    }

    res.status(201).json({
      mensagem: 'Notificação enviada com sucesso',
      totalEnviadas: cpfsExistentes.length,
      novasAssociacoes,
      associacoesExistentes,
      notificacao: notificacaoPayload
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
  const idNotificacao = Number(req.params.id);
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const lida = req.query.lida;
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    if (limit > 100) limit = 100;
    const offset = Math.max(0, (page - 1) * limit);

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
        as: 'Usuario', // alias precisa bater com o definido em UsuarioNotificacao.associate
        attributes: ['nome', 'email', 'cpf']
      }],
      order: [['criado_em', 'DESC']],
      limit,
      offset
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
        currentPage: page,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};
