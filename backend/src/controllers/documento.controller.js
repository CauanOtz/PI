// src/controllers/documento.controller.js
import { DocumentoDTO } from '../dto/index.js';
import { created, ok } from '../utils/response.js';
import DocumentoService from '../services/documento.service.js';

const documentoService = new DocumentoService();

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
 *               $ref: '#/components/schemas/SuccessDocumento'
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
        const { alunoId } = req.params;
        const { descricao, tipo } = req.body;
        const result = await documentoService.adicionar({
            alunoId,
            arquivo: req.file,
            descricao,
            tipo,
            usuarioId: req.usuario.id
        });

        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        const dto = DocumentoDTO.from(result.documento, { makeDownloadUrl: true, baseUrl: '/api/v2/alunos' });
        return created(res, dto);
    } catch (error) {
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
 *         description: Lista de documentos retornada com sucesso (pode ser vazia).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentoDTO'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Aluno não encontrado
 */
export const listarDocumentos = async (req, res, next) => {
    try {
        const { alunoId } = req.params;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar estes documentos'
            });
        }

        const result = await documentoService.listar(alunoId);
        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        return ok(res, { 
            documentos: result.documentos.map(d => DocumentoDTO.from(d, { makeDownloadUrl: true, baseUrl: '/api/v2/alunos' }))
        });
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
 *           type: integer
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

        const temPermissao = await documentoService.verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este documento'
            });
        }

        const result = await documentoService.obter(alunoId, documentoId);
        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        res.download(result.documento.caminhoArquivo, result.documento.nome);
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
 *           type: integer
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
 *               
 *     responses:
 *       200:
 *         description: Documento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessDocumento'
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
        const { nome, descricao } = req.body;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este documento'
            });
        }

        const result = await documentoService.atualizar({
            alunoId,
            documentoId,
            nome,
            descricao
        });

        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        return ok(res, DocumentoDTO.from(result.documento, { makeDownloadUrl: true, baseUrl: '/api/v2/alunos' }));
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
 *           type: integer
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

        const temPermissao = await documentoService.verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este documento'
            });
        }

        const result = await documentoService.excluir(alunoId, documentoId);
        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        res.status(204).end();
    } catch (error) {
        next(error);
    }
};


/**
 * @openapi
 * /alunos/{alunoId}/documentos/{documentoId}/download:
 *   get:
 *     summary: Faz o download de um documento
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
 *           type: integer
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Arquivo para download
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
export const downloadDocumento = async (req, res, next) => {
    try {
        const { alunoId, documentoId } = req.params;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar documentos deste aluno.'
            });
        }

        const result = await documentoService.obter(alunoId, documentoId);
        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        res.download(result.documento.caminhoArquivo, result.documento.nome, (err) => {
            if (err) {
                console.error(`Erro ao enviar o arquivo para download: ${result.documento.caminhoArquivo}`, err);
            }
        });
    } catch (error) {
        next(error);
    }
};







