// src/controllers/documento.controller.js
import { DocumentoDTO } from '../dto/index.js';
import { created, ok } from '../utils/response.js';
import DocumentoService from '../services/documento.service.js';

const documentoService = new DocumentoService();

/**
 * @openapi
 * /assistidos/{assistidoId}/documentos:
 *   post:
 *     summary: Adiciona um documento a um assistido
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assistidoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido
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
 *         description: Assistido não encontrado
 *       413:
 *         description: Arquivo muito grande
 */
export const adicionarDocumento = async (req, res, next) => {
    try {
        const { assistidoId } = req.params;
        const { descricao, tipo } = req.body;
        const result = await documentoService.adicionar({
            assistidoId,
            arquivo: req.file,
            descricao,
            tipo,
            usuarioId: req.usuario.id
        });

        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        const dto = DocumentoDTO.from(result.documento, { makeDownloadUrl: true, baseUrl: '/api/v2/assistidos' });
        return created(res, dto);
    } catch (error) {
        next(error);
    }
};



/**
 * @openapi
 * /assistidos/{assistidoId}/documentos:
 *   get:
 *     summary: Lista todos os documentos de um assistido
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assistidoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido
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
 *         description: Assistido não encontrado
 */
export const listarDocumentos = async (req, res, next) => {
    try {
        const { assistidoId } = req.params;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, assistidoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar estes documentos'
            });
        }

        const result = await documentoService.listar(assistidoId);
        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        return ok(res, { 
            documentos: result.documentos.map(d => DocumentoDTO.from(d, { makeDownloadUrl: true, baseUrl: '/api/v2/assistidos' }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /assistidos/{assistidoId}/documentos/{documentoId}:
 *   get:
 *     summary: Obtém um documento específico de um assistido
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assistidoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido
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
        const { assistidoId, documentoId } = req.params;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, assistidoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este documento'
            });
        }

        const result = await documentoService.obter(assistidoId, documentoId);
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
 * /assistidos/{assistidoId}/documentos/{documentoId}:
 *   put:
 *     summary: Atualiza as informações de um documento
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assistidoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido
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
        const { assistidoId, documentoId } = req.params;
        const { nome, descricao } = req.body;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, assistidoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este documento'
            });
        }

        const result = await documentoService.atualizar({
            assistidoId,
            documentoId,
            nome,
            descricao
        });

        if (result.error) {
            return res.status(result.status).json({ mensagem: result.message });
        }

        return ok(res, DocumentoDTO.from(result.documento, { makeDownloadUrl: true, baseUrl: '/api/v2/assistidos' }));
    } catch (error) {
        next(error);
    }
};


/**
 * @openapi
 * /assistidos/{assistidoId}/documentos/{documentoId}:
 *   delete:
 *     summary: Exclui um documento específico
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assistidoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido
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
        const { assistidoId, documentoId } = req.params;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, assistidoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este documento'
            });
        }

        const result = await documentoService.excluir(assistidoId, documentoId);
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
 * /assistidos/{assistidoId}/documentos/{documentoId}/download:
 *   get:
 *     summary: Faz o download de um documento
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assistidoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do assistido
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
        const { assistidoId, documentoId } = req.params;

        const temPermissao = await documentoService.verificarPermissao(req.usuario, assistidoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar documentos deste assistido.'
            });
        }

        const result = await documentoService.obter(assistidoId, documentoId);
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







