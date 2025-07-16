// src/controllers/usuario.controller.js
import Usuario from '../models/Usuario.model.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
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
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados de entrada inválidos.
 *       409:
 *         description: E-mail já cadastrado.
 *       500:
 *         description: Erro interno do servidor.
 */
export const registrarUsuario = async (req, res, next) => {
  try {
    const { nome, email, senha, telefone, role = 'responsavel' } = req.body;

    // Verifica se o e-mail já está cadastrado
    const usuarioExistente = await Usuario.findOne({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(409).json({ 
        message: 'Este e-mail já está em uso.' 
      });
    }

    // Cria o novo usuário
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha, // A senha será hasheada pelo setter do modelo
      telefone,
      role
    });

     // Gera o token JWT
     const token = novoUsuario.gerarToken();

    // Remove a senha do objeto de resposta
    const usuarioSemSenha = novoUsuario.get({ plain: true });
    delete usuarioSemSenha.senha;

    res.status(201).json({ usuarioSemSenha, token });
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
 *                     $ref: '#/components/schemas/Usuario'
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

    res.status(200).json({
      usuarios,
      total: count,
      page: parseInt(page),
      totalPages,
      hasNext,
      hasPrevious
    });
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
 *               $ref: '#/components/schemas/Usuario'
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

    res.status(200).json(usuario);
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
 *                 example: admin@escola.com
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
 *                   $ref: '#/components/schemas/Usuario'
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
    res.status(200).json({
      usuario: usuarioSemSenha,
      token
    });
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
 *               $ref: '#/components/schemas/Usuario'
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

    // Formata o CPF para o formato do banco de dados (se necessário)
    const cpfFormatado = cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    const usuario = await Usuario.findOne({
      where: { cpf: cpfFormatado },
      attributes: { exclude: ['senha'] } // Não retornar a senha
    });

    if (!usuario) {
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }

    res.status(200).json(usuario);
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
 *               $ref: '#/components/schemas/Usuario'
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
    const { nome, email, telefone } = req.body;

    // Formata o CPF para o formato do banco de dados
    const cpfFormatado = cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    // Busca o usuário
    const usuario = await Usuario.findOne({
      where: { cpf: cpfFormatado }
    });

    if (!usuario) {
      return res.status(404).json({ 
        mensagem: 'Usuário não encontrado' 
      });
    }

    // Atualiza apenas os campos fornecidos
    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (telefone) usuario.telefone = telefone;

    await usuario.save();

    // Remove a senha da resposta
    const usuarioSemSenha = usuario.get({ plain: true });
    delete usuarioSemSenha.senha;

    res.status(200).json(usuarioSemSenha);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        mensagem: 'E-mail já está em uso por outro usuário' 
      });
    }
    next(error);
  }
};
