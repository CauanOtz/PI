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

// Outros métodos do controlador podem ser adicionados aqui
// como login, listar usuários, atualizar, etc.