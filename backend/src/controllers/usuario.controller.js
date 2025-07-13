// src/controllers/usuario.controller.js
import Usuario from '../models/Usuario.model.js';
import { Op } from 'sequelize';

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

    // Remove a senha do objeto de resposta
    const usuarioSemSenha = novoUsuario.get({ plain: true });
    delete usuarioSemSenha.senha;

    res.status(201).json(usuarioSemSenha);
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
        { nome: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
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

// Outros métodos do controlador podem ser adicionados aqui
// como login, atualizar, etc.