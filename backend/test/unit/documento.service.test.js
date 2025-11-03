import { jest } from '@jest/globals';
import DocumentoService from '../../src/services/documento.service.js';
import Documento from '../../src/models/Documento.model.js';
import Aluno from '../../src/models/Aluno.model.js';
import ResponsavelAluno from '../../src/models/ResponsavelAluno.model.js';
import fs from 'fs';

jest.mock('../../src/models/Documento.model.js');
jest.mock('../../src/models/Aluno.model.js');
jest.mock('../../src/models/ResponsavelAluno.model.js');
jest.mock('fs');

describe('DocumentoService', () => {
    let service;
    
    beforeEach(() => {
        jest.clearAllMocks();
       
       // Reset mock implementations
       Documento.create = jest.fn();
       Documento.findOne = jest.fn();
       Documento.findAll = jest.fn();
       Documento.update = jest.fn();
       Documento.findByPk = jest.fn();
       
       Aluno.findByPk = jest.fn();
       
       ResponsavelAluno.findOne = jest.fn();
       
       fs.existsSync = jest.fn(() => true);
       fs.unlinkSync = jest.fn();
       
        service = new DocumentoService();
    });

    describe('verificarPermissao', () => {
        it('retorna false para usuário inválido', async () => {
            const result = await service.verificarPermissao(null, 1);
            expect(result).toBe(false);
        });

        it('retorna true para admin', async () => {
            const result = await service.verificarPermissao({ id: 1, role: 'admin' }, 1);
            expect(result).toBe(true);
        });

        it('retorna true quando existe vínculo', async () => {
            ResponsavelAluno.findOne.mockResolvedValue({ id: 1 });
            const result = await service.verificarPermissao({ id: 1, role: 'responsavel' }, 1);
            expect(result).toBe(true);
        });

        it('retorna false quando não existe vínculo', async () => {
            ResponsavelAluno.findOne.mockResolvedValue(null);
            const result = await service.verificarPermissao({ id: 1, role: 'responsavel' }, 1);
            expect(result).toBe(false);
        });
    });

    describe('adicionar', () => {
        const mockArquivo = {
            originalname: 'test.pdf',
            path: '/uploads/test.pdf',
            size: 1024
        };

        it('retorna erro quando não há arquivo', async () => {
            const result = await service.adicionar({ alunoId: 1 });
            expect(result.error).toBe(true);
            expect(result.status).toBe(400);
        });

        it('retorna erro quando aluno não existe', async () => {
            Aluno.findByPk.mockResolvedValue(null);
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => {});

            const result = await service.adicionar({ 
                alunoId: 1, 
                arquivo: mockArquivo 
            });

            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
            expect(fs.unlinkSync).toHaveBeenCalledWith(mockArquivo.path);
        });

        it('cria documento com sucesso', async () => {
            const mockDocumento = {
                id: 1,
                nome: 'test.pdf'
            };

            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.create.mockResolvedValue(mockDocumento);

            const result = await service.adicionar({
                alunoId: 1,
                arquivo: mockArquivo,
                tipo: 'RG'
            });

            expect(result.documento).toEqual(mockDocumento);
            expect(Documento.create).toHaveBeenCalledWith(expect.objectContaining({
                nome: mockArquivo.originalname,
                tipo: 'RG'
            }));
        });
    });

    describe('listar', () => {
        it('retorna erro quando aluno não existe', async () => {
            Aluno.findByPk.mockResolvedValue(null);
            const result = await service.listar(1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna lista de documentos', async () => {
            const mockDocumentos = [
                { id: 1, nome: 'doc1.pdf' },
                { id: 2, nome: 'doc2.pdf' }
            ];

            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findAll.mockResolvedValue(mockDocumentos);

            const result = await service.listar(1);
            expect(result.documentos).toEqual(mockDocumentos);
        });
    });

    describe('obter', () => {
        it('retorna erro quando aluno não existe', async () => {
            Aluno.findByPk.mockResolvedValue(null);
            const result = await service.obter(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando documento não existe', async () => {
            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(null);

            const result = await service.obter(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando arquivo não existe no servidor', async () => {
            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue({ 
                id: 1, 
                caminhoArquivo: '/test.pdf' 
            });
            fs.existsSync.mockReturnValue(false);

            const result = await service.obter(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna documento quando existe', async () => {
            const mockDocumento = { 
                id: 1, 
                caminhoArquivo: '/test.pdf' 
            };
            
            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(mockDocumento);
            fs.existsSync.mockReturnValue(true);

            const result = await service.obter(1, 1);
            expect(result.documento).toEqual(mockDocumento);
        });
    });

    describe('atualizar', () => {
        it('retorna erro quando aluno não existe', async () => {
            Aluno.findByPk.mockResolvedValue(null);
            const result = await service.atualizar({ alunoId: 1, documentoId: 1 });
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando documento não existe', async () => {
            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(null);

            const result = await service.atualizar({ alunoId: 1, documentoId: 1 });
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('atualiza documento com sucesso', async () => {
            const mockDocumento = { 
                id: 1, 
                nome: 'old.pdf' 
            };
            const mockDocumentoAtualizado = { 
                id: 1, 
                nome: 'new.pdf' 
            };

            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(mockDocumento);
            Documento.update.mockResolvedValue([1]);
            Documento.findByPk.mockResolvedValue(mockDocumentoAtualizado);

            const result = await service.atualizar({
                alunoId: 1,
                documentoId: 1,
                nome: 'new.pdf'
            });

            expect(result.documento).toEqual(mockDocumentoAtualizado);
        });
    });

    describe('excluir', () => {
        it('retorna erro quando aluno não existe', async () => {
            Aluno.findByPk.mockResolvedValue(null);
            const result = await service.excluir(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando documento não existe', async () => {
            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(null);

            const result = await service.excluir(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('exclui documento com sucesso', async () => {
            const mockDocumento = {
                id: 1,
                caminhoArquivo: '/test.pdf',
                destroy: jest.fn()
            };

            Aluno.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(mockDocumento);
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => {});

            const result = await service.excluir(1, 1);
            expect(result.success).toBe(true);
            expect(fs.unlinkSync).toHaveBeenCalledWith(mockDocumento.caminhoArquivo);
            expect(mockDocumento.destroy).toHaveBeenCalled();
        });
    });
});