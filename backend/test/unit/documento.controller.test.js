import { jest } from '@jest/globals';
import DocumentoService from '../../src/services/documento.service.js';
import { DocumentoDTO } from '../../src/dto/index.js';
import * as documentoController from '../../src/controllers/documento.controller.js';

describe('DocumentoController', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let mockService;

    beforeEach(() => {
        jest.clearAllMocks();

    mockReq = { params: {}, body: {}, file: null, usuario: { id: 1, role: 'user' } };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            download: jest.fn(),
            end: jest.fn()
        };

        mockNext = jest.fn();

        mockService = {
            verificarPermissao: jest.fn(),
            adicionar: jest.fn(),
            listar: jest.fn(),
            obter: jest.fn(),
            atualizar: jest.fn(),
            excluir: jest.fn()
        };

    // Ensure the already-instantiated controller uses our mock functions by
    // assigning them to the DocumentoService prototype (controller created
    // an instance at import time).
    DocumentoService.prototype.verificarPermissao = mockService.verificarPermissao;
    DocumentoService.prototype.adicionar = mockService.adicionar;
    DocumentoService.prototype.listar = mockService.listar;
    DocumentoService.prototype.obter = mockService.obter;
    DocumentoService.prototype.atualizar = mockService.atualizar;
    DocumentoService.prototype.excluir = mockService.excluir;

        // Replace DTO methods with jest fns so we can assert calls/returns
        DocumentoDTO.from = jest.fn();
        DocumentoDTO.list = jest.fn();
    });

    describe('adicionarDocumento', () => {
        beforeEach(() => {
            mockReq.file = {
                originalname: 'test.pdf',
                path: '/uploads/test.pdf'
            };
            mockReq.params.alunoId = '1';
            mockReq.body = { descricao: 'Test Doc' };
        });

        it('retorna 400 quando não há arquivo', async () => {
            mockService.adicionar.mockResolvedValue({
                error: true,
                status: 400,
                message: 'Nenhum arquivo foi enviado'
            });

            await documentoController.adicionarDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('retorna 201 quando documento é criado', async () => {
            const mockDocumento = { id: 1, nome: 'test.pdf' };
            const mockDTO = { id: 1, nome: 'test.pdf', downloadUrl: '/download/1' };

            mockService.adicionar.mockResolvedValue({ documento: mockDocumento });
            DocumentoDTO.from.mockReturnValue(mockDTO);

            await documentoController.adicionarDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({ sucesso: true, dados: mockDTO });
        });

        it('chama next com erro em caso de exceção', async () => {
            const error = new Error('Test error');
            mockService.adicionar.mockRejectedValue(error);

            await documentoController.adicionarDocumento(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('listarDocumentos', () => {
        beforeEach(() => {
            mockReq.params.alunoId = '1';
        });

        it('retorna 403 quando usuário não tem permissão', async () => {
            mockService.verificarPermissao.mockResolvedValue(false);

            await documentoController.listarDocumentos(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('retorna lista de documentos com sucesso', async () => {
            const mockDocumentos = [{ id: 1 }, { id: 2 }];
            const mockDTOs = mockDocumentos.map(d => ({ ...d, downloadUrl: `/download/${d.id}` }));

            mockService.verificarPermissao.mockResolvedValue(true);
            mockService.listar.mockResolvedValue({ documentos: mockDocumentos });
            DocumentoDTO.from.mockImplementation((doc) => ({ ...doc, downloadUrl: `/download/${doc.id}` }));

            await documentoController.listarDocumentos(mockReq, mockRes, mockNext);
            expect(mockRes.json).toHaveBeenCalledWith({ sucesso: true, dados: { documentos: mockDTOs } });
        });
    });

    describe('obterDocumento', () => {
        beforeEach(() => {
            mockReq.params = { alunoId: '1', documentoId: '1' };
        });

        it('retorna 403 quando usuário não tem permissão', async () => {
            mockService.verificarPermissao.mockResolvedValue(false);

            await documentoController.obterDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('inicia download quando documento existe', async () => {
            const mockDocumento = { caminhoArquivo: '/test.pdf', nome: 'test.pdf' };

            mockService.verificarPermissao.mockResolvedValue(true);
            mockService.obter.mockResolvedValue({ documento: mockDocumento });

            await documentoController.obterDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.download).toHaveBeenCalledWith(mockDocumento.caminhoArquivo, mockDocumento.nome);
        });
    });

    describe('atualizarDocumento', () => {
        beforeEach(() => {
            mockReq.params = { alunoId: '1', documentoId: '1' };
            mockReq.body = { nome: 'updated.pdf' };
        });

        it('retorna 403 quando usuário não tem permissão', async () => {
            mockService.verificarPermissao.mockResolvedValue(false);

            await documentoController.atualizarDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('atualiza documento com sucesso', async () => {
            const mockDocumento = { id: 1, nome: 'updated.pdf' };
            const mockDTO = { ...mockDocumento, downloadUrl: '/download/1' };

            mockService.verificarPermissao.mockResolvedValue(true);
            mockService.atualizar.mockResolvedValue({ documento: mockDocumento });
            DocumentoDTO.from.mockReturnValue(mockDTO);

            await documentoController.atualizarDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.json).toHaveBeenCalledWith({ sucesso: true, dados: mockDTO });
        });
    });

    describe('excluirDocumento', () => {
        beforeEach(() => {
            mockReq.params = { alunoId: '1', documentoId: '1' };
        });

        it('retorna 403 quando usuário não tem permissão', async () => {
            mockService.verificarPermissao.mockResolvedValue(false);

            await documentoController.excluirDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('retorna 204 quando documento é excluído', async () => {
            mockService.verificarPermissao.mockResolvedValue(true);
            mockService.excluir.mockResolvedValue({ success: true });

            await documentoController.excluirDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.end).toHaveBeenCalled();
        });
    });

    describe('downloadDocumento', () => {
        beforeEach(() => {
            mockReq.params = { alunoId: '1', documentoId: '1' };
        });

        it('retorna 403 quando usuário não tem permissão', async () => {
            mockService.verificarPermissao.mockResolvedValue(false);

            await documentoController.downloadDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('inicia download quando documento existe', async () => {
            const mockDocumento = { caminhoArquivo: '/test.pdf', nome: 'test.pdf' };

            mockService.verificarPermissao.mockResolvedValue(true);
            mockService.obter.mockResolvedValue({ documento: mockDocumento });

            await documentoController.downloadDocumento(mockReq, mockRes, mockNext);
            expect(mockRes.download).toHaveBeenCalledWith(mockDocumento.caminhoArquivo, mockDocumento.nome, expect.any(Function));
        });
    });
});