// src/services/documento.service.js
import Documento from '../models/Documento.model.js';
import Assistido from '../models/Assistido.model.js';
import ResponsavelAssistido from '../models/ResponsavelAssistido.model.js';
import fs from 'fs';

class DocumentoService {
    /**
     * Verifica se um usuário tem permissão para acessar os documentos de um assistido
     * @param {Object} usuario - Usuário autenticado
     * @param {number} assistidoId - ID do assistido
     * @returns {Promise<boolean>} - true se tem permissão, false caso contrário
     */
    async verificarPermissao(usuario, assistidoId) {
        try {
            if (!usuario?.id || isNaN(parseInt(assistidoId, 10))) {
                return false;
            }

            if (usuario.role === 'admin') {
                return true;
            }

            const vinculo = await ResponsavelAssistido.findOne({
                where: {
                    id_usuario: usuario.id,
                    id_assistido: parseInt(assistidoId, 10)
                }
            });

            return !!vinculo;
        } catch (error) {
            console.error('Erro ao verificar permissão:', error);
            return false;
        }
    }

    /**
     * Adiciona um novo documento para um assistido
     * @param {Object} params - Parâmetros para criação do documento
     * @param {number} params.assistidoId - ID do assistido
     * @param {Object} params.arquivo - Arquivo enviado (multer)
     * @param {string} params.descricao - Descrição do documento
     * @param {string} params.tipo - Tipo do documento
     * @param {number} params.usuarioId - ID do usuário que está fazendo o upload
     * @returns {Promise<Object>} - Resultado da operação
     */
    async adicionar({ assistidoId, arquivo, descricao, tipo, usuarioId }) {
        if (!arquivo) {
            return { error: true, status: 400, message: 'Nenhum arquivo foi enviado' };
        }

        const assistido = await Assistido.findByPk(assistidoId);
        if (!assistido) {
            // Remove o arquivo enviado em caso de erro
            if (arquivo.path && fs.existsSync(arquivo.path)) {
                fs.unlinkSync(arquivo.path);
            }
            return { error: true, status: 404, message: 'Assistido não encontrado' };
        }

        const TIPOS_PERMITIDOS = ['RG', 'CPF', 'CERTIDAO_NASCIMENTO', 'COMPROVANTE_ENDERECO', 'OUTRO'];
        const tipoFinal = TIPOS_PERMITIDOS.includes(String(tipo)) ? String(tipo) : 'OUTRO';

        try {
            const documento = await Documento.create({
                nome: arquivo.originalname,
                descricao: descricao || null,
                caminhoArquivo: arquivo.path,
                tipo: tipoFinal,
                tamanho: arquivo.size,
                assistidoId: parseInt(assistidoId, 10),
                usuarioId
            });

            return { documento };
        } catch (error) {
            // Remove o arquivo em caso de erro na criação do documento
            if (arquivo.path && fs.existsSync(arquivo.path)) {
                fs.unlinkSync(arquivo.path);
            }
            throw error;
        }
    }

    /**
     * Lista todos os documentos de um assistido
     * @param {number} assistidoId - ID do assistido
     * @returns {Promise<Object>} - Lista de documentos ou erro
     */
    async listar(assistidoId) {
        const assistido = await Assistido.findByPk(assistidoId);
        if (!assistido) {
            return { error: true, status: 404, message: 'Assistido não encontrado' };
        }

        const documentos = await Documento.findAll({
            where: { assistidoId },
            attributes: {
                exclude: ['assistidoId', 'usuarioId', 'caminhoArquivo']
            },
            order: [['createdAt', 'DESC']]
        });

        return { documentos };
    }

    /**
     * Obtém um documento específico
     * @param {number} assistidoId - ID do assistido
     * @param {number} documentoId - ID do documento
     * @returns {Promise<Object>} - Documento encontrado ou erro
     */
    async obter(assistidoId, documentoId) {
        const assistido = await Assistido.findByPk(assistidoId);
        if (!assistido) {
            return { error: true, status: 404, message: 'Assistido não encontrado' };
        }

        const documento = await Documento.findOne({
            where: {
                id: documentoId,
                assistidoId
            }
        });

        if (!documento) {
            return { error: true, status: 404, message: 'Documento não encontrado' };
        }

        if (!fs.existsSync(documento.caminhoArquivo)) {
            return { error: true, status: 404, message: 'Arquivo não encontrado no servidor' };
        }

        return { documento };
    }

    /**
     * Atualiza as informações de um documento
     * @param {Object} params - Parâmetros para atualização
     * @param {number} params.assistidoId - ID do assistido
     * @param {number} params.documentoId - ID do documento
     * @param {string} params.nome - Novo nome do documento
     * @param {string} params.descricao - Nova descrição do documento
     * @returns {Promise<Object>} - Documento atualizado ou erro
     */
    async atualizar({ assistidoId, documentoId, nome, descricao }) {
        const assistido = await Assistido.findByPk(assistidoId);
        if (!assistido) {
            return { error: true, status: 404, message: 'Assistido não encontrado' };
        }

        const documento = await Documento.findOne({
            where: {
                id: documentoId,
                assistidoId
            }
        });

        if (!documento) {
            return { error: true, status: 404, message: 'Documento não encontrado' };
        }

        const camposAtualizados = {};
        if (nome !== undefined) camposAtualizados.nome = nome;
        if (descricao !== undefined) camposAtualizados.descricao = descricao;

        if (Object.keys(camposAtualizados).length === 0) {
            return { documento };
        }

        await Documento.update(camposAtualizados, {
            where: { id: documentoId }
        });

        const documentoAtualizado = await Documento.findByPk(documentoId, {
            attributes: { exclude: ['caminhoArquivo'] }
        });

        return { documento: documentoAtualizado };
    }

    /**
     * Exclui um documento
     * @param {number} assistidoId - ID do assistido
     * @param {number} documentoId - ID do documento
     * @returns {Promise<Object>} - Resultado da operação
     */
    async excluir(assistidoId, documentoId) {
        const assistido = await Assistido.findByPk(assistidoId);
        if (!assistido) {
            return { error: true, status: 404, message: 'Assistido não encontrado' };
        }

        const documento = await Documento.findOne({
            where: {
                id: documentoId,
                assistidoId
            }
        });

        if (!documento) {
            return { error: true, status: 404, message: 'Documento não encontrado' };
        }

        if (fs.existsSync(documento.caminhoArquivo)) {
            fs.unlinkSync(documento.caminhoArquivo);
        }

        await documento.destroy();
        return { success: true };
    }
}

export default DocumentoService;