// src/controllers/usuario.controller.js
import Usuario from '../models/Usuario.model.js';
import { Op } from 'sequelize';
import { UsuarioDTO, PaginationDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';
import bcrypt from 'bcrypt';
import { normalizeCpf, formatCpf, isValidCpf } from '../utils/cpf.js';
/**
 * @openapi
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários
 */

/**
 * @openapi
 * /usuarios/registrar:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - cpf
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João da Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@escola.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "senha123"
 *               cpf:
 *                 type: string
 *                 example: "856.871.180-47"
 *               telefone:
 *                 type: string
 *                 example: "(11) 99999-9999"
 *               role:
 *                 type: string
 *                 enum: [admin, responsavel]
 *                 default: "responsavel"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUsuario'
 *       400:
 *         description: Dados de entrada inválidos.
 *       409:
 *         description: E-mail ou CPF já cadastrado.
 *       500:
 *         description: Erro interno do servidor.
 */
export const registrarUsuario = async (req, res, next) => {
  try {
    let { nome, email, senha, telefone, cpf, role = 'responsavel' } = req.body;

    // não permitir que um request não autenticado / não-admin crie um admin
    if (role === 'admin') {
      const requesterRole = req.usuario && req.usuario.role ? req.usuario.role : null;
      if (requesterRole !== 'admin') {
        return res.status(403).json({ message: 'Apenas administradores podem criar usuários com role "admin".' });
      }
    }

    // debug pra ver o que o frontend está enviando
    // console.log('registrarUsuario - req.body.role:', req.body.role);
    // console.log('registrarUsuario - full body:', req.body);
  
    if(!cpf){
      return res.status(400).json({ message: 'CPF é obrigatório.' });
    }
    
    // aceita apenas valores permitidos; se vier errado, mantemos 'responsavel'
    const allowedRoles = ['admin', 'responsavel'];
    role = (typeof role === 'string' && allowedRoles.includes(role)) ? role : 'responsavel';
    
    const cpfDigits = normalizeCpf(cpf);
    if (!cpfDigits) {
      return res.status(400).json({ message: 'CPF inválido. Envie 11 dígitos.' });
    }
    if (!isValidCpf(cpfDigits)) {
      return res.status(400).json({ message: 'CPF inválido.' });
    }
    const cpfFormatado = formatCpf(cpfDigits);
    cpf = cpfFormatado; // sobrescreve para usar na criação/cheque

    // normaliza/valida telefone (aceita dígitos ou máscara)
    let telefoneFormatado = null;
    if (telefone) {
      const telDigits = telefone.toString().replace(/\D/g, "");
      if (telDigits.length === 10) {
        telefoneFormatado = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,6)}-${telDigits.slice(6)}`;
      } else if (telDigits.length === 11) {
        telefoneFormatado = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,7)}-${telDigits.slice(7)}`;
      } else {
        return res.status(400).json({ message: 'Telefone inválido. Informe 10 ou 11 dígitos.' });
      }
    }

    // Verifica se o e-mail ou CPF já está cadastrado
    const usuarioExistente = await Usuario.findOne({
      where: { [Op.or]: [{ email }, { cpf }] }
    });

    if (usuarioExistente) {
      return res.status(409).json({ 
        message: 'E-mail ou CPF já está em uso.' 
      });
    }

    // Cria o novo usuário (cpf/telefone já no formato esperado pelo model)
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha, // A senha será hasheada pelo setter do modelo
      telefone: telefoneFormatado,
      cpf,
      role
    });

    // Gera o token JWT
    const token = novoUsuario.gerarToken();

    // Remove a senha do objeto de resposta
    const usuarioSemSenha = novoUsuario.get({ plain: true });
    delete usuarioSemSenha.senha;

    return created(res, { usuario: UsuarioDTO.from(novoUsuario), token });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página (para paginação)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Quantidade de itens por página
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca (procura em nome e email)
 *         example: joao
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, responsavel]
 *         description: Filtra por papel do usuário
 *         example: responsavel
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UsuarioDTO'
 *                 total:
 *                   type: integer
 *                   description: Total de itens encontrados
 *                 page:
 *                   type: integer
 *                   description: Número da página atual
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *                 hasNext:
 *                   type: boolean
 *                   description: Se há próxima página
 *                 hasPrevious:
 *                   type: boolean
 *                   description: Se há página anterior
 *       400:
 *         description: Parâmetros de busca inválidos
 */
export const listarUsuarios = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    
    // Condições de busca
    const where = {};
    if (search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }

    // Paginação
    const offset = (page - 1) * limit;
    
    // Busca os usuários
    const { count, rows: usuarios } = await Usuario.findAndCountAll({
      where,
      offset,
      limit,
      order: [['nome', 'ASC']],
      attributes: { exclude: ['senha'] } // Não retornar a senha
    });

    // Calcular informações de paginação
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    { const usuariosDTO = UsuarioDTO.list(usuarios); const paginacao = new PaginationDTO({ total: count, paginaAtual: parseInt(page), totalPaginas: totalPages, itensPorPagina: limit }); return ok(res, { usuarios: usuariosDTO, paginacao }); }
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /usuarios/me:
 *   get:
 *     summary: Obtém os dados do usuário logado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário logado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUsuario'
 *       401:
 *         description: Não autorizado - token inválido ou não fornecido
 *       404:
 *         description: Usuário não encontrado
 */
export const obterMeusDados = async (req, res, next) => {
  try {
    // O middleware de autenticação já adicionou o usuário ao req.usuario
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['senha'] } // Não retornar a senha
    });

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    return ok(res, UsuarioDTO.from(usuario));
  } catch (error) {
    next(error);
  }
};



/**
 * @openapi
 * /usuarios/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@escola.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/UsuarioDTO'
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *       400:
 *         description: Dados de login inválidos
 *       401:
 *         description: Credenciais inválidas
 */
export const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Busca o usuário pelo email
    const usuario = await Usuario.findOne({ 
      where: { email },
      attributes: { include: ['senha'] } 
    });

    // Verifica se o usuário existe
    if (!usuario) {
      return res.status(401).json({ 
        mensagem: 'Credenciais inválidas' 
      });
    }

    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ 
        mensagem: 'Credenciais inválidas' 
      });
    }

    // Gera o token JWT
    const token = usuario.gerarToken();

    // Remove a senha do objeto de retorno
    const usuarioSemSenha = usuario.get();
    delete usuarioSemSenha.senha;

    // Retorna o usuário e o token
    return ok(res, { usuario: UsuarioDTO.from(usuarioSemSenha), token });
  } catch (error) {
    next(error);
  }
};


/**
 * @openapi
 * /usuarios/{cpf}:
 *   get:
 *     summary: Obtém os detalhes de um usuário pelo CPF (apenas admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *           format: cpf
 *         description: CPF do usuário a ser buscado (apenas números)
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUsuario'
 *       400:
 *         description: CPF inválido
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado (apenas administradores)
 *       404:
 *         description: Usuário não encontrado
 */
export const buscarPorCPF = async (req, res, next) => {
  try {
    // Verifica se o usuário é admin
    if (req.usuario.role !== 'admin') {
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
      });
    }

  const { cpf } = req.params;

  const cpfDigits = normalizeCpf(cpf);
  if (!cpfDigits) return res.status(400).json({ mensagem: 'CPF inválido' });
  const cpfFormatado = formatCpf(cpfDigits);

    const usuario = await Usuario.findOne({
      where: { cpf: cpfFormatado },
      attributes: { exclude: ['senha'] } // Não retornar a senha
    });

    if (!usuario) {
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }

    return ok(res, UsuarioDTO.from(usuario));
  } catch (error) {
    next(error);
  }
};


/**
 * @openapi
 * /usuarios/{cpf}:
 *   put:
 *     summary: Atualiza um usuário pelo CPF (apenas admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *           format: cpf
 *         description: CPF do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@escola.com
 *               telefone:
 *                 type: string
 *                 example: (11) 98765-4321
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUsuario'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado (apenas administradores)
 *       404:
 *         description: Usuário não encontrado
 */
export const atualizarUsuarioPorCPF = async (req, res, next) => {
  try {
    // Verifica se o usuário é admin
    if (req.usuario.role !== 'admin') {
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
      });
    }

    const { cpf } = req.params;
    const { nome, email, telefone, role } = req.body; // aceitar role no body

  const cpfDigits = normalizeCpf(cpf);
  if (!cpfDigits) return res.status(400).json({ mensagem: 'CPF inválido' });
  const cpfFormatado = formatCpf(cpfDigits);

    // Busca o usuário
    const usuario = await Usuario.findOne({
      where: { cpf: cpfFormatado }
    });

    if (!usuario) {
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }

    // Normaliza/valida telefone recebido (se houver)
    let telefoneFormatado = undefined;
    if (typeof telefone !== 'undefined') {
      if (telefone === null || telefone === "") {
        telefoneFormatado = null;
      } else {
        const telDigits = telefone.toString().replace(/\D/g, "");
        if (telDigits.length === 10) {
          telefoneFormatado = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,6)}-${telDigits.slice(6)}`;
        } else if (telDigits.length === 11) {
          telefoneFormatado = `(${telDigits.slice(0,2)}) ${telDigits.slice(2,7)}-${telDigits.slice(7)}`;
        } else {
          return res.status(400).json({ mensagem: 'Telefone inválido. Informe 10 ou 11 dígitos.' });
        }
      }
    }

    // Atualiza apenas os campos fornecidos
    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (typeof telefoneFormatado !== 'undefined') usuario.telefone = telefoneFormatado;

    // Atualiza role se foi fornecido e for válido
    if (typeof role !== 'undefined') {
      const allowedRoles = ['admin', 'responsavel'];
      if (typeof role === 'string' && allowedRoles.includes(role)) {
        usuario.role = role;
      } else {
        return res.status(400).json({ mensagem: 'Papel inválido. Use "admin" ou "responsavel".' });
      }
    }

    await usuario.save();

    // Remove a senha da resposta
    const usuarioSemSenha = usuario.get({ plain: true });
    delete usuarioSemSenha.senha;

    return ok(res, UsuarioDTO.from(usuarioSemSenha));
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        mensagem: 'E-mail já está em uso por outro usuário' 
      });
    }
    next(error);
  }
};


/**
 * @openapi
 * /usuarios/{cpf}:
 *   delete:
 *     summary: Exclui um usuário pelo CPF (apenas admin)
 *     description: |
 *       Apenas administradores podem excluir usuários.
 *       Um administrador não pode se auto-excluir.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *           format: cpf
 *         description: CPF do usuário a ser excluído
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Usuário excluído com sucesso
 *       400:
 *         description: CPF inválido
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado (apenas administradores) ou Tentativa de auto-exclusão
 *       404:
 *         description: Usuário não encontrado
 */
export const excluirUsuarioPorCPF = async (req, res, next) => {
  try {
    // Verifica se o usuário é admin
    if (req.usuario.role !== 'admin') {
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
      });
    }

  const { cpf } = req.params;

  const cpfDigits = normalizeCpf(cpf);
  if (!cpfDigits) return res.status(400).json({ mensagem: 'CPF inválido' });
  const cpfFormatado = formatCpf(cpfDigits);

    // Verifica se o usuário está tentando se auto-excluir
    if (req.usuario.cpf === cpfFormatado) {
      return res.status(403).json({
        mensagem: 'Você não pode se auto-excluir. Contate outro administrador para realizar esta ação.'
      });
    }

    // Busca e exclui o usuário
    const usuario = await Usuario.findOne({
      where: { cpf: cpfFormatado }
    });

    if (!usuario) {
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }

    await usuario.destroy();

    res.status(200).json({ 
      mensagem: 'Usuário excluído com sucesso' 
    });
  } catch (error) {
    next(error);
  }
};
