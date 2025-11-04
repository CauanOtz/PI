// src/services/documento.service.js
import Documento from '../models/Documento.model.js';
import Aluno from '../models/Aluno.model.js';
import ResponsavelAluno from '../models/ResponsavelAluno.model.js';
import fs from 'fs';

class DocumentoService {
    /**
     * Verifica se um usuário tem permissão para acessar os documentos de um aluno
     * @param {Object} usuario - Usuário autenticado
     * @param {number} alunoId - ID do aluno
     * @returns {Promise<boolean>} - true se tem permissão, false caso contrário
     */
    async verificarPermissao(usuario, alunoId) {
        try {
            if (!usuario?.id || isNaN(parseInt(alunoId, 10))) {
                return false;
            }

            if (usuario.role === 'admin') {
                return true;
            }

            const vinculo = await ResponsavelAluno.findOne({
                where: {
                    id_usuario: usuario.id,
                    id_aluno: parseInt(alunoId, 10)
                }
            });

            return !!vinculo;
        } catch (error) {
            console.error('Erro ao verificar permissão:', error);
            return false;
        }
    }

    /**
     * Adiciona um novo documento para um aluno
     * @param {Object} params - Parâmetros para criação do documento
     * @param {number} params.alunoId - ID do aluno
     * @param {Object} params.arquivo - Arquivo enviado (multer)
     * @param {string} params.descricao - Descrição do documento
     * @param {string} params.tipo - Tipo do documento
     * @param {number} params.usuarioId - ID do usuário que está fazendo o upload
     * @returns {Promise<Object>} - Resultado da operação
     */
    async adicionar({ alunoId, arquivo, descricao, tipo, usuarioId }) {
        if (!arquivo) {
            return { error: true, status: 400, message: 'Nenhum arquivo foi enviado' };
        }

        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            // Remove o arquivo enviado em caso de erro
            if (arquivo.path && fs.existsSync(arquivo.path)) {
                fs.unlinkSync(arquivo.path);
            }
            return { error: true, status: 404, message: 'Aluno não encontrado' };
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
                alunoId: parseInt(alunoId, 10),
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
     * Lista todos os documentos de um aluno
     * @param {number} alunoId - ID do aluno
     * @returns {Promise<Object>} - Lista de documentos ou erro
     */
    async listar(alunoId) {
        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            return { error: true, status: 404, message: 'Aluno não encontrado' };
        }

        const documentos = await Documento.findAll({
            where: { alunoId },
            attributes: {
                exclude: ['alunoId', 'usuarioId', 'caminhoArquivo']
            },
            order: [['dataUpload', 'DESC']]
        });

        return { documentos };
    }

    /**
     * Obtém um documento específico
     * @param {number} alunoId - ID do aluno
     * @param {number} documentoId - ID do documento
     * @returns {Promise<Object>} - Documento encontrado ou erro
     */
    async obter(alunoId, documentoId) {
        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            return { error: true, status: 404, message: 'Aluno não encontrado' };
        }

        const documento = await Documento.findOne({
            where: {
                id: documentoId,
                alunoId
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
     * @param {number} params.alunoId - ID do aluno
     * @param {number} params.documentoId - ID do documento
     * @param {string} params.nome - Novo nome do documento
     * @param {string} params.descricao - Nova descrição do documento
     * @returns {Promise<Object>} - Documento atualizado ou erro
     */
    async atualizar({ alunoId, documentoId, nome, descricao }) {
        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            return { error: true, status: 404, message: 'Aluno não encontrado' };
        }

        const documento = await Documento.findOne({
            where: {
                id: documentoId,
                alunoId
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
     * @param {number} alunoId - ID do aluno
     * @param {number} documentoId - ID do documento
     * @returns {Promise<Object>} - Resultado da operação
     */
    async excluir(alunoId, documentoId) {
        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            return { error: true, status: 404, message: 'Aluno não encontrado' };
        }

        const documento = await Documento.findOne({
            where: {
                id: documentoId,
                alunoId
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