// src/controllers/documento.controller.js
import Documento from '../models/Documento.model.js';
import fs from 'fs';
import path from 'path';

/**
 * @openapi
 * /alunos/{alunoId}/documentos:
 *   post:
 *     summary: Adiciona um documento a um aluno
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documento:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo do documento (PDF, DOCX, JPG, PNG)
 *               descricao:
 *                 type: string
 *                 description: Descrição opcional do documento
 *     responses:
 *       201:
 *         description: Documento adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Aluno não encontrado
 *       413:
 *         description: Arquivo muito grande
 */
export const adicionarDocumento = async (req, res, next) => {
  try {
    // Verifica se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ 
        mensagem: 'Nenhum arquivo foi enviado' 
      });
    }

    const { alunoId } = req.params;
    const { descricao } = req.body;
    const usuarioId = req.usuario.id;

    // Aqui você deve verificar se o aluno existe
    // const aluno = await Aluno.findByPk(alunoId);
    // if (!aluno) {
    //   // Remove o arquivo enviado
    //   fs.unlinkSync(req.file.path);
    //   return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    // }

    // Cria o documento no banco de dados
    const documento = await Documento.create({
      nome: req.file.originalname,
      descricao: descricao || null,
      caminhoArquivo: req.file.path,
      tipo: req.file.mimetype,
      tamanho: req.file.size,
      alunoId: parseInt(alunoId, 10),
      usuarioId: usuarioId
    });

    // Remove a senha do usuário da resposta
    const documentoResposta = documento.get({ plain: true });
    delete documentoResposta.usuario?.senha;

    res.status(201).json(documentoResposta);
  } catch (error) {
    // Em caso de erro, remove o arquivo enviado
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @openapi
 * /alunos/{alunoId}/documentos:
 *   get:
 *     summary: Lista todos os documentos de um aluno
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Lista de documentos do aluno
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Documento'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Aluno não encontrado
 */
export const listarDocumentos = async (req, res, next) => {
    try {
      const { alunoId } = req.params;
      const usuarioId = req.usuario.id;
  
      // Verifica se o aluno existe
      const aluno = await Aluno.findByPk(alunoId);
      if (!aluno) {
        return res.status(404).json({ mensagem: 'Aluno não encontrado' });
      }
  
      // Verifica se o usuário tem permissão (admin ou o próprio aluno)
      if (req.usuario.role !== 'admin' && aluno.usuarioId !== usuarioId) {
        return res.status(403).json({ 
          mensagem: 'Você não tem permissão para acessar estes documentos' 
        });
      }
  
      // Busca os documentos do aluno
      const documentos = await Documento.findAll({
        where: { alunoId },
        attributes: { 
          exclude: ['alunoId', 'usuarioId', 'caminhoArquivo'] 
        },
        order: [['createdAt', 'DESC']]
      });
  
      res.status(200).json(documentos);
    } catch (error) {
      next(error);
    }
  };