// src/controllers/documento.controller.js
import Documento from '../models/Documento.model.js';
import ResponsavelAluno from '../models/ResponsavelAluno.model.js';
import fs from 'fs';
import path from 'path';
import Aluno from '../models/Aluno.model.js';

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

// --- FUNÇÃO AUXILIAR PARA VERIFICAR PERMISSÃO ---
const verificarPermissao = async (usuario, alunoId) => {
    try {
        // 1. Validação dos parâmetros
        if (!usuario || !usuario.id) {
            console.error('Usuário inválido ou sem ID');
            return false;
        }

        const alunoIdNum = parseInt(alunoId, 10);
        if (isNaN(alunoIdNum)) {
            console.error('ID do aluno inválido:', alunoId);
            return false;
        }

        // 2. Admins sempre têm permissão
        if (usuario.role === 'admin') {
            return true;
        }
        
        // 3. Verifica se o usuário autenticado é um dos responsáveis do aluno
        console.log(`Verificando permissão: usuário=${usuario.id}, aluno=${alunoIdNum}`);
        
        const vinculo = await ResponsavelAluno.findOne({
            where: {
                id_usuario: usuario.id,
                id_aluno: alunoIdNum
            },
            logging: console.log // Adiciona log da consulta SQL
        });

        console.log('Resultado da verificação de permissão:', !!vinculo);
        return !!vinculo;
    } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        return false;
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
 *                 $ref: '#/components/schemas/Documento'
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

        // Passo 1: Verificar se o aluno existe
        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            return res.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        // Passo 2: Verificar se o usuário tem permissão para acessar os documentos deste aluno
        const temPermissao = await verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar estes documentos'
            });
        }

        // Passo 3: Buscar os documentos do aluno
        const documentos = await Documento.findAll({
            where: { alunoId },
            attributes: {
                exclude: ['alunoId', 'usuarioId', 'caminhoArquivo']
            },
            order: [['dataUpload', 'DESC']]
        });

        // Passo 4: Retornar 200 OK com a lista de documentos (que pode ser vazia)
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
        

        // Verifica se o aluno existe
        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            return res.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        const temPermissao = await verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar este documento'
            });
        }
        // --- FIM DA CORREÇÃO ---

        const documento = await Documento.findOne({
            where: {
                id: documentoId,
                alunoId
            }
        });

        if (!documento) {
            return res.status(404).json({ mensagem: 'Documento não encontrado' });
        }

        if (!fs.existsSync(documento.caminhoArquivo)) {
            return res.status(404).json({ mensagem: 'Arquivo não encontrado no servidor' });
        }

        res.download(documento.caminhoArquivo, documento.nome);

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
        const temPermissao = await verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
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
        const usuarioId = req.usuario.id;

        // Verifica se o aluno existe
        const aluno = await Aluno.findByPk(alunoId);
        if (!aluno) {
            return res.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        // Verifica se o usuário tem permissão (admin ou o próprio aluno)
        const temPermissao = await verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
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
        // Pega os parâmetros da URL. É bom convertê-los para inteiros para garantir.
        const alunoId = parseInt(req.params.alunoId, 10);
        const documentoId = parseInt(req.params.documentoId, 10);

        // 1. Verifica a permissão PRIMEIRO. Se o usuário não tem acesso,
        // não precisamos nem consultar o banco de dados para o documento.
        const temPermissao = await verificarPermissao(req.usuario, alunoId);
        if (!temPermissao) {
            return res.status(403).json({
                mensagem: 'Você não tem permissão para acessar documentos deste aluno.'
            });
        }

        // 2. Busca o documento, garantindo que ele pertence ao aluno correto.
        // Isso impede que alguém tente baixar o documento de um aluno usando a URL de outro.
        const documento = await Documento.findOne({
            where: { 
                id: documentoId,
                alunoId: alunoId 
            }
        });

        // Se o documento não existe OU não pertence a este aluno, retorna 404.
        if (!documento) {
            return res.status(404).json({ mensagem: 'Documento não encontrado para este aluno.' });
        }

        // 3. Verifica se o arquivo físico ainda existe no servidor.
        if (!fs.existsSync(documento.caminhoArquivo)) {
            // Este é um erro do lado do servidor (inconsistência de dados), então um log é útil.
            console.error(`Erro: Arquivo não encontrado no caminho ${documento.caminhoArquivo} para o documento ID ${documento.id}`);
            return res.status(404).json({ mensagem: 'Arquivo físico não encontrado no servidor.' });
        }

        // 4. Usa res.download() para lidar com o envio do arquivo.
        // O Express cuida de definir os cabeçalhos Content-Type e Content-Disposition.
        // O segundo argumento define o nome que o arquivo terá no navegador do usuário.
        res.download(documento.caminhoArquivo, documento.nome, (err) => {
            if (err) {
                // O Express já terá enviado uma resposta de erro, então só logamos o problema.
                console.error(`Erro ao enviar o arquivo para download: ${documento.caminhoArquivo}`, err);
            }
        });

    } catch (error) {
        // Se ocorrer qualquer outro erro (ex: falha na conexão com o banco),
        // ele será capturado e enviado para o middleware de erro.
        next(error);
    }
};