import { Op } from 'sequelize';
import Usuario from '../models/Usuario.model.js';
import { normalizeCpf, formatCpf, isValidCpf } from '../utils/cpf.js';
import { signToken } from '../utils/jwt.js';

export default class UsuarioService {
  static async create({ nome, email, senha, telefone, cpf, role = 'responsavel' }, requesterRole = null) {
    // role protection: only admin can create admin users
    const allowedRoles = ['admin', 'responsavel'];
    role = (typeof role === 'string' && allowedRoles.includes(role)) ? role : 'responsavel';
    if (role === 'admin' && requesterRole !== 'admin') {
      return { forbidden: true };
    }

    // cpf normalization and validation
    const cpfDigits = normalizeCpf(cpf);
    if (!cpfDigits) return { invalidCpf: true };
    if (!isValidCpf(cpfDigits)) return { invalidCpf: true };
    const cpfFormatado = formatCpf(cpfDigits);

    // normalize telefone
    let telefoneFormatado = null;
    if (telefone) {
      const telDigits = String(telefone).replace(/\D/g, '');
      if (telDigits.length === 10) telefoneFormatado = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,6)}-${telDigits.slice(6)}`;
      else if (telDigits.length === 11) telefoneFormatado = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,7)}-${telDigits.slice(7)}`;
      else return { invalidPhone: true };
    }

    // verifica existência por email ou cpf
    const exist = await Usuario.findOne({ where: { [Op.or]: [{ email }, { cpf: cpfFormatado }] } });
    if (exist) return { conflict: true };

    const novo = await Usuario.create({ nome, email, senha, telefone: telefoneFormatado, cpf: cpfFormatado, role });
    const token = signToken({ id: novo.id, email: novo.email, role: novo.role });
    return { usuario: novo, token };
  }

  static async list({ page = 1, limit = 10, search, role } = {}) {
    const where = {};
    if (search) {
      where[Op.or] = [ { nome: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } } ];
    }
    if (role) where.role = role;

    const offset = (page - 1) * limit;
    const { count, rows } = await Usuario.findAndCountAll({ where, offset, limit, order: [['nome', 'ASC']], attributes: { exclude: ['senha'] } });
    return { count, usuarios: rows, page: Number(page), limit: Number(limit) };
  }

  static async getByCPF(rawCpf) {
    const cpfDigits = normalizeCpf(rawCpf);
    if (!cpfDigits) return { invalidCpf: true };
    const cpfFormatado = formatCpf(cpfDigits);
    const usuario = await Usuario.findOne({ where: { cpf: cpfFormatado }, attributes: { exclude: ['senha'] } });
    return usuario; // null if not found
  }

  static async getById(id) {
    if (!id) return null;
    const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['senha'] } });
    return usuario;
  }

  static async updateByCPF(rawCpf, { nome, email, telefone, role }) {
    const cpfDigits = normalizeCpf(rawCpf);
    if (!cpfDigits) return { invalidCpf: true };
    const cpfFormatado = formatCpf(cpfDigits);

    const usuario = await Usuario.findOne({ where: { cpf: cpfFormatado } });
  if (!usuario) return null;

    if (typeof nome !== 'undefined') usuario.nome = nome;
    if (typeof email !== 'undefined') usuario.email = email;
    if (typeof telefone !== 'undefined') {
      if (telefone === null || telefone === '') usuario.telefone = null;
      else {
        const telDigits = String(telefone).replace(/\D/g, '');
        if (telDigits.length === 10) usuario.telefone = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,6)}-${telDigits.slice(6)}`;
        else if (telDigits.length === 11) usuario.telefone = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,7)}-${telDigits.slice(7)}`;
        else return { invalidPhone: true };
      }
    }
    if (typeof role !== 'undefined') {
      const allowedRoles = ['admin','responsavel'];
      if (typeof role === 'string' && allowedRoles.includes(role)) usuario.role = role;
      else return { invalidRole: true };
    }

    await usuario.save();
    const usuarioSemSenha = usuario.get({ plain: true });
    delete usuarioSemSenha.senha;
    return usuarioSemSenha;
  }

  static async removeByCPF(rawCpf, requesterCpf) {
    const cpfDigits = normalizeCpf(rawCpf);
    if (!cpfDigits) return { invalidCpf: true };
    const cpfFormatado = formatCpf(cpfDigits);

    // prevent self-delete
    if (requesterCpf === cpfFormatado) return { selfDelete: true };

    const usuario = await Usuario.findOne({ where: { cpf: cpfFormatado } });
    if (!usuario) return null;
    await usuario.destroy();
    return true;
  }

  static async authenticate(email, senha) {
    const usuario = await Usuario.findOne({ where: { email }, attributes: { include: ['senha'] } });
    if (!usuario) return null;
    const senhaValida = await usuario.verificarSenha ? await usuario.verificarSenha(senha) : false;
    // model has verificarSenha sync - ensure boolean
    if (!senhaValida) return null;
    const token = signToken({ id: usuario.id, email: usuario.email, role: usuario.role });
    const usuarioSemSenha = usuario.get({ plain: true });
    delete usuarioSemSenha.senha;
    return { usuario: usuarioSemSenha, token };
  }
}
