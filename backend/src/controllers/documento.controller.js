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

  
/**
 * @openapi
 * /alunos/{alunoId}/documentos/{documentoId}:
 *   get:
 *     summary: Obtém um documento específico de um aluno
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
 *       - in: path
 *         name: documentoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Documento encontrado
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Documento não encontrado
 */
export const obterDocumento = async (req, res, next) => {
    try {
      const { alunoId, documentoId } = req.params;
      const usuarioId = req.usuario.id;
  
      // Verifica se o aluno existe
      const aluno = await Aluno.findByPk(alunoId);
      if (!aluno) {
        return res.status(404).json({ mensagem: 'Aluno não encontrado' });
      }
  
      // Verifica se o usuário tem permissão (admin ou o próprio aluno)
      if (req.usuario.role !== 'admin' && aluno.usuarioId !== usuarioId) {
        return res.status(403).json({ 
          mensagem: 'Você não tem permissão para acessar este documento' 
        });
      }
  
      // Busca o documento
      const documento = await Documento.findOne({
        where: { 
          id: documentoId,
          alunoId
        }
      });
  
      if (!documento) {
        return res.status(404).json({ mensagem: 'Documento não encontrado' });
      }
  
      // Verifica se o arquivo existe
      if (!fs.existsSync(documento.caminhoArquivo)) {
        return res.status(404).json({ mensagem: 'Arquivo não encontrado' });
      }
  
      // Define o cabeçalho para download
      const nomeArquivo = path.basename(documento.caminhoArquivo);
      res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
      res.setHeader('Content-Type', documento.tipo);
      res.setHeader('Content-Length', documento.tamanho);
  
      // Envia o arquivo
      const stream = fs.createReadStream(documento.caminhoArquivo);
      stream.pipe(res);
  
    } catch (error) {
      next(error);
    }
  };

  
/**
 * @openapi
 * /alunos/{alunoId}/documentos/{documentoId}:
 *   put:
 *     summary: Atualiza as informações de um documento
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
 *       - in: path
 *         name: documentoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Novo nome do documento
 *               descricao:
 *                 type: string
 *                 description: Nova descrição do documento
 *               tipo:
 *                 type: string
 *                 enum: [pdf, docx, jpg, jpeg, png, txt]
 *                 description: Novo tipo do documento
 *     responses:
 *       200:
 *         description: Documento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Documento não encontrado
 */
export const atualizarDocumento = async (req, res, next) => {
    try {
      const { alunoId, documentoId } = req.params;
      const { nome, descricao, tipo } = req.body;
      const usuarioId = req.usuario.id;
  
      // Verifica se o aluno existe
      const aluno = await Aluno.findByPk(alunoId);
      if (!aluno) {
        return res.status(404).json({ mensagem: 'Aluno não encontrado' });
      }
  
      // Verifica se o usuário tem permissão (admin ou o próprio aluno)
      if (req.usuario.role !== 'admin' && aluno.usuarioId !== usuarioId) {
        return res.status(403).json({ 
          mensagem: 'Você não tem permissão para atualizar este documento' 
        });
      }
  
      // Busca o documento
      const documento = await Documento.findOne({
        where: { 
          id: documentoId,
          alunoId
        }
      });
  
      if (!documento) {
        return res.status(404).json({ mensagem: 'Documento não encontrado' });
      }
  
      // Atualiza os campos fornecidos
      const camposAtualizados = {};
      if (nome !== undefined) camposAtualizados.nome = nome;
      if (descricao !== undefined) camposAtualizados.descricao = descricao;
      if (tipo !== undefined) camposAtualizados.tipo = tipo;
  
      // Se não houver campos para atualizar, retorna o documento sem alterações
      if (Object.keys(camposAtualizados).length === 0) {
        return res.status(200).json(documento);
      }
  
      // Atualiza o documento
      const [updated] = await Documento.update(camposAtualizados, {
        where: { id: documentoId },
        returning: true,
        plain: true
      });
  
      // Busca o documento atualizado
      const documentoAtualizado = await Documento.findByPk(documentoId, {
        attributes: { exclude: ['caminhoArquivo'] }
      });
  
      res.status(200).json(documentoAtualizado);
  
    } catch (error) {
      next(error);
    }
  };

  
/**
 * @openapi
 * /alunos/{alunoId}/documentos/{documentoId}:
 *   delete:
 *     summary: Exclui um documento específico
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
 *       - in: path
 *         name: documentoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do documento
 *     responses:
 *       204:
 *         description: Documento excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Documento não encontrado
 */
export const excluirDocumento = async (req, res, next) => {
    try {
      const { alunoId, documentoId } = req.params;
      const usuarioId = req.usuario.id;
  
      // Verifica se o aluno existe
      const aluno = await Aluno.findByPk(alunoId);
      if (!aluno) {
        return res.status(404).json({ mensagem: 'Aluno não encontrado' });
      }
  
      // Verifica se o usuário tem permissão (admin ou o próprio aluno)
      if (req.usuario.role !== 'admin' && aluno.usuarioId !== usuarioId) {
        return res.status(403).json({ 
          mensagem: 'Você não tem permissão para excluir este documento' 
        });
      }
  
      // Busca o documento
      const documento = await Documento.findOne({
        where: { 
          id: documentoId,
          alunoId
        }
      });
  
      if (!documento) {
        return res.status(404).json({ mensagem: 'Documento não encontrado' });
      }
  
      // Remove o arquivo físico
      if (fs.existsSync(documento.caminhoArquivo)) {
        fs.unlinkSync(documento.caminhoArquivo);
      }
  
      // Remove o registro do banco de dados
      await documento.destroy();
  
      // Resposta sem conteúdo (204 No Content)
      res.status(204).end();
  
    } catch (error) {
      next(error);
    }
  };