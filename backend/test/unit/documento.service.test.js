import { jest } from '@jest/globals';
import DocumentoService from '../../src/services/documento.service.js';
import Documento from '../../src/models/Documento.model.js';
import Assistido from '../../src/models/Assistido.model.js';
import fs from 'fs';

jest.mock('../../src/models/Documento.model.js');
jest.mock('../../src/models/Assistido.model.js');
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
       
       Assistido.findByPk = jest.fn();
       
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
    });

    describe('adicionar', () => {
        const mockArquivo = {
            originalname: 'test.pdf',
            path: '/uploads/test.pdf',
            size: 1024
        };

        it('retorna erro quando não há arquivo', async () => {
            const result = await service.adicionar({ assistidoId: 1 });
            expect(result.error).toBe(true);
            expect(result.status).toBe(400);
        });

        it('retorna erro quando aluno não existe', async () => {
            Assistido.findByPk.mockResolvedValue(null);
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => {});

            const result = await service.adicionar({ 
                assistidoId: 1, 
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

            Assistido.findByPk.mockResolvedValue({ id: 1 });
            Documento.create.mockResolvedValue(mockDocumento);

            const result = await service.adicionar({
                assistidoId: 1,
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
            Assistido.findByPk.mockResolvedValue(null);
            const result = await service.listar(1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna lista de documentos', async () => {
            const mockDocumentos = [
                { id: 1, nome: 'doc1.pdf' },
                { id: 2, nome: 'doc2.pdf' }
            ];

            Assistido.findByPk.mockResolvedValue({ id: 1 });
            Documento.findAll.mockResolvedValue(mockDocumentos);

            const result = await service.listar(1);
            expect(result.documentos).toEqual(mockDocumentos);
        });
    });

    describe('obter', () => {
        it('retorna erro quando aluno não existe', async () => {
            Assistido.findByPk.mockResolvedValue(null);
            const result = await service.obter(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando documento não existe', async () => {
            Assistido.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(null);

            const result = await service.obter(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando arquivo não existe no servidor', async () => {
            Assistido.findByPk.mockResolvedValue({ id: 1 });
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
            
            Assistido.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(mockDocumento);
            fs.existsSync.mockReturnValue(true);

            const result = await service.obter(1, 1);
            expect(result.documento).toEqual(mockDocumento);
        });
    });

    describe('atualizar', () => {
        it('retorna erro quando aluno não existe', async () => {
            Assistido.findByPk.mockResolvedValue(null);
            const result = await service.atualizar({ assistidoId: 1, documentoId: 1 });
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando documento não existe', async () => {
            Assistido.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(null);

            const result = await service.atualizar({ assistidoId: 1, documentoId: 1 });
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

            Assistido.findByPk.mockResolvedValue({ id: 1 });
            Documento.findOne.mockResolvedValue(mockDocumento);
            Documento.update.mockResolvedValue([1]);
            Documento.findByPk.mockResolvedValue(mockDocumentoAtualizado);

            const result = await service.atualizar({
                assistidoId: 1,
                documentoId: 1,
                nome: 'new.pdf'
            });

            expect(result.documento).toEqual(mockDocumentoAtualizado);
        });
    });

    describe('excluir', () => {
        it('retorna erro quando aluno não existe', async () => {
            Assistido.findByPk.mockResolvedValue(null);
            const result = await service.excluir(1, 1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('retorna erro quando documento não existe', async () => {
            Assistido.findByPk.mockResolvedValue({ id: 1 });
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

            Assistido.findByPk.mockResolvedValue({ id: 1 });
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
