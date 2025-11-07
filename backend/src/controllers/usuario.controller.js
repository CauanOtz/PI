// src/controllers/usuario.controller.js
import Usuario from '../models/Usuario.model.js';
import { Op } from 'sequelize';
import { UsuarioDTO, PaginationDTO } from '../dto/index.js';
import { ok, created } from '../utils/response.js';
import UsuarioService from '../services/usuario.service.js';
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
 *                 minLength: 3
 *                 example: "Maria Oliveira"
 *                 description: "Nome completo do usuário"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria.oliveira@email.com"
 *                 description: "E-mail que será usado para login"
 *               senha:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "Senha@123"
 *                 description: "Senha com no mínimo 6 caracteres"
 *               cpf:
 *                 type: string
 *                 pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$"
 *                 example: "123.456.789-10"
 *                 description: "CPF no formato XXX.XXX.XXX-XX"
 *               telefone:
 *                 type: string
 *                 pattern: "^\\(\\d{2}\\) \\d{4,5}-\\d{4}$"
 *                 example: "(11) 98765-4321"
 *                 description: "Telefone com DDD no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessUsuario'
 *       400:
 *         description: Dados de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: CPF inválido.
 *       403:
 *         description: Permissão negada ao tentar criar usuário admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Apenas administradores podem criar usuários com role "admin".
 *       409:
 *         description: E-mail ou CPF já cadastrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: E-mail ou CPF já está em uso.
 *       500:
 *         description: Erro interno do servidor.
 */
export const registrarUsuario = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await UsuarioService.create(payload);
    if (result.forbidden) return res.status(403).json({ mensagem: 'Apenas administradores podem criar usuários com role "admin".' });
    if (result.invalidCpf) return res.status(400).json({ mensagem: 'CPF inválido. Use o formato XXX.XXX.XXX-XX' });
    if (result.invalidPhone) return res.status(400).json({ mensagem: 'Telefone inválido. Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX' });
    if (result.conflict) return res.status(409).json({ mensagem: 'Este e-mail ou CPF já está cadastrado no sistema.' });
    return created(res, { usuario: UsuarioDTO.from(result.usuario), token: result.token });
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
    const result = await UsuarioService.list({ page, limit, search, role });
    const usuariosDTO = UsuarioDTO.list(result.usuarios);
    const totalPages = Math.ceil(result.count / result.limit);
    const paginacao = new PaginationDTO({ total: result.count, paginaAtual: result.page, totalPaginas: totalPages, itensPorPagina: result.limit });
    return ok(res, { usuarios: usuariosDTO, paginacao });
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
    const usuario = await UsuarioService.getById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: E-mail ou senha não fornecidos
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Credenciais inválidas
 */
export const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const auth = await UsuarioService.authenticate(email, senha);
    if (!auth) return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    return ok(res, { usuario: UsuarioDTO.from(auth.usuario), token: auth.token });
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
    const usuario = await UsuarioService.getByCPF(cpf);
    if (usuario && usuario.invalidCpf) return res.status(400).json({ mensagem: 'CPF inválido' });
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
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
    const { nome, email, telefone, role } = req.body;
    const result = await UsuarioService.updateByCPF(cpf, { nome, email, telefone, role });
    if (result && result.invalidCpf) return res.status(400).json({ mensagem: 'CPF inválido' });
    if (result === null) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    if (result.invalidPhone) return res.status(400).json({ mensagem: 'Telefone inválido. Informe 10 ou 11 dígitos.' });
    if (result.invalidRole) return res.status(400).json({ mensagem: 'Papel inválido. Use "admin" ou "responsavel".' });
    return ok(res, UsuarioDTO.from(result));
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
    const requesterCpf = req.usuario.cpf;
    const result = await UsuarioService.removeByCPF(cpf, requesterCpf);
    if (result && result.invalidCpf) return res.status(400).json({ mensagem: 'CPF inválido' });
    if (result === null) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    if (result.selfDelete) return res.status(403).json({ mensagem: 'Você não pode se auto-excluir. Contate outro administrador para realizar esta ação.' });
    return res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};
