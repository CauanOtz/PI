import { jest } from '@jest/globals';
let notificacaoController;
// We'll import the controller after we set up module mocks to ensure the controller
// picks up the mocked models.

// Mock models with associations
const mockFindOne = jest.fn();
const mockFindAll = jest.fn();
const mockCreate = jest.fn();
const mockFindByPk = jest.fn();
const mockFindAndCountAll = jest.fn();
const mockCount = jest.fn();
const mockFindOrCreate = jest.fn();

// Setup mock model classes
const mockNotificacao = {
        create: mockCreate,
        findByPk: mockFindByPk,
        findAll: mockFindAll,
        findAndCountAll: mockFindAndCountAll,
        belongsTo: jest.fn(),
        hasMany: jest.fn(),
        belongsToMany: jest.fn()
};

const mockUsuario = {
        findOne: mockFindOne,
        findAll: mockFindAll,
        belongsToMany: jest.fn(),
        hasMany: jest.fn()
};

const mockUsuarioNotificacao = {
        findOne: mockFindOne,
        findOrCreate: mockFindOrCreate,
        findAndCountAll: mockFindAndCountAll,
        count: mockCount,
        belongsTo: jest.fn()
};

jest.mock('../../src/models/Notificacao.model.js', () => ({ default: mockNotificacao }));
jest.mock('../../src/models/Usuario.model.js', () => ({ default: mockUsuario }));
jest.mock('../../src/models/UsuarioNotificacao.model.js', () => ({ default: mockUsuarioNotificacao }));

const mockServiceInstance = {
    criar: jest.fn(),
    listar: jest.fn(),
    obter: jest.fn(),
    atualizar: jest.fn(),
    excluir: jest.fn(),
    enviar: jest.fn(),
    listarPorUsuario: jest.fn(),
    marcarComoLida: jest.fn(),
    listarUsuarios: jest.fn()
};


jest.mock('../../src/dto/index.js', () => ({
    NotificacaoDTO: {
        from: jest.fn(m => ({ id: m.id, dto: true })),
        list: jest.fn(arr => arr.map(m => ({ id: m.id, dto: true })))
    }
}));

// Import controller after mocks so it receives mocked models
beforeAll(async () => {
    // Ensure the service module is mocked using the current mockServiceInstance
    jest.doMock('../../src/services/notificacao.service.js', () => ({
        default: jest.fn().mockImplementation(() => mockServiceInstance)
    }));

    notificacaoController = await import('../../src/controllers/notificacao.controller.js');

    // Make controller use the mock service instance
    if (typeof notificacaoController.__setNotificacaoServiceForTests === 'function') {
        // Use a normal function so it can be used with `new` inside the controller
        notificacaoController.__setNotificacaoServiceForTests(function NotificacaoServiceMock() { return mockServiceInstance; });
    }
});

describe('NotificacaoController', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    // mockServiceInstance is defined at the top level

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            params: {},
            query: {},
            body: {},
            usuario: { cpf: '123.456.789-00', role: 'user' }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn()
        };

        mockNext = jest.fn();

        Object.values(mockServiceInstance).forEach(mock => mock.mockReset());

        // Mock model response helpers
        const mockSequelizeModel = (data) => ({
            get: jest.fn(() => ({ plain: true, ...data })),
            save: jest.fn().mockResolvedValue(data),
            destroy: jest.fn().mockResolvedValue(true),
            update: jest.fn().mockResolvedValue(data),
            ...data
        });

        // Setup mock responses
        const mockNotificacaoData = {
            id: 1,
            titulo: 'Test',
            mensagem: 'Test message',
            tipo: 'info',
            criadoPor: mockReq.usuario.cpf,
            criador: mockSequelizeModel({
                nome: 'Test User',
                email: 'test@example.com'
            })
        };
        const mockNotificacao = mockSequelizeModel(mockNotificacaoData);

        // Setup model responses
        mockFindOne
          .mockResolvedValueOnce(mockSequelizeModel({ cpf: mockReq.usuario.cpf })) // Usuario.findOne
          .mockResolvedValueOnce(mockSequelizeModel({ // UsuarioNotificacao.findOne
            lida: false,
            Notificacao: mockNotificacao
          }));

        mockCreate.mockResolvedValue(mockNotificacao);
        mockFindByPk.mockResolvedValue(mockNotificacao);
        mockFindAll.mockResolvedValue([mockNotificacao]);
        mockFindAndCountAll.mockResolvedValue({
            count: 1,
            rows: [mockNotificacao]
        });
        
        // Set up default successful responses for each mock
        // The mock data is now set up in the beforeEach hook

        mockServiceInstance.criar.mockResolvedValue({
            notificacao: mockNotificacao
        });

        mockServiceInstance.listar.mockResolvedValue({
            notificacoes: [mockNotificacao],
            total: 1,
            paginaAtual: 1,
            totalPaginas: 1,
            itensPorPagina: 10
        });

        mockServiceInstance.obter.mockResolvedValue({
            notificacao: mockNotificacao
        });

        mockServiceInstance.atualizar.mockResolvedValue({
            notificacao: {
                ...mockNotificacao,
                titulo: 'Updated'
            }
        });

        mockServiceInstance.excluir.mockResolvedValue({
            success: true
        });

        mockServiceInstance.enviar.mockResolvedValue({
            success: true
        });

        mockServiceInstance.listarPorUsuario.mockResolvedValue({
            notificacoes: [mockNotificacao],
            total: 1,
            paginaAtual: 1,
            totalPaginas: 1,
            itensPorPagina: 10
        });

        mockServiceInstance.marcarComoLida.mockResolvedValue({
            notificacao: {
                ...mockNotificacao,
                lida: true,
                dataLeitura: new Date()
            }
        });

        mockServiceInstance.listarUsuarios.mockResolvedValue({
            usuarios: [{
                cpf: mockReq.usuario.cpf,
                nome: 'Test User',
                email: 'test@example.com',
                UsuarioNotificacao: {
                    lida: false,
                    dataLeitura: null
                }
            }]
        });
    });

    describe('criarNotificacao', () => {
        beforeEach(() => {
            mockReq.body = {
                titulo: 'Test',
                mensagem: 'Test message',
                tipo: 'info'
            };
        });

        it('cria notificação com sucesso', async () => {
            const expectedData = {
                ...mockReq.body,
                criadoPor: mockReq.usuario.cpf
            };

            await notificacaoController.criarNotificacao(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.criar).toHaveBeenCalledWith(expect.objectContaining(expectedData));
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                sucesso: true,
                dados: expect.any(Object)
            }));
        });

        it('retorna erro de validação', async () => {
            // Simulate a Sequelize validation error thrown by the service
            mockServiceInstance.criar.mockRejectedValue({ name: 'SequelizeValidationError', message: 'Validation error' });

            await notificacaoController.criarNotificacao(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                mensagem: expect.any(String)
            }));
        });

        it('passa erro para next', async () => {
            const error = new Error('Test error');
            mockServiceInstance.criar.mockRejectedValue(error);

            await notificacaoController.criarNotificacao(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('listarNotificacoes', () => {
        const mockResult = {
            notificacoes: [{ id: 1 }, { id: 2 }],
            total: 2,
            paginaAtual: 1,
            totalPaginas: 1,
            itensPorPagina: 10
        };

        beforeEach(() => {
            mockFindAndCountAll.mockResolvedValue(mockResult);
        });

        it('lista notificações com paginação', async () => {
            await notificacaoController.listarNotificacoes(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.listar).toHaveBeenCalledWith(expect.objectContaining({
                page: 1,
                limit: 10
            }));
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                sucesso: true,
                dados: expect.objectContaining({
                    notificacoes: expect.any(Array),
                    paginacao: expect.any(Object)
                })
            }));
        });

        it('aplica filtro por tipo', async () => {
            mockReq.query.tipo = 'alerta';

            await notificacaoController.listarNotificacoes(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.listar).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'alerta' }));
        });

        it('passa erro para next', async () => {
            const error = new Error('Test error');
            mockServiceInstance.listar.mockRejectedValue(error);

            await notificacaoController.listarNotificacoes(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('obterNotificacao', () => {
        beforeEach(() => {
            mockReq.params.id = '1';
        });

        it('retorna notificação existente', async () => {
            const mockNotificacao = { id: 1, titulo: 'Test' };
            mockServiceInstance.obter.mockResolvedValue({ notificacao: mockNotificacao });

            await notificacaoController.obterNotificacao(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.obter).toHaveBeenCalledWith('1');
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                sucesso: true,
                dados: expect.any(Object)
            }));
        });

        it('retorna erro 404', async () => {
            mockServiceInstance.obter.mockResolvedValue({ error: true, status: 404, message: 'Not found' });

            await notificacaoController.obterNotificacao(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('atualizarNotificacao', () => {
        beforeEach(() => {
            mockReq.params.id = '1';
            mockReq.body = { titulo: 'Updated' };
        });

        it('atualiza notificação com sucesso', async () => {
            const mockNotifInstance = {
                id: 1,
                titulo: 'Test',
                criadoPor: mockReq.usuario.cpf
            };
            mockServiceInstance.atualizar.mockResolvedValue({ notificacao: { ...mockNotifInstance, titulo: 'Updated' } });

            await notificacaoController.atualizarNotificacao(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.atualizar).toHaveBeenCalledWith('1', mockReq.body);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                sucesso: true,
                dados: expect.any(Object)
            }));
        });

        it('retorna erro 404', async () => {
            mockServiceInstance.atualizar.mockResolvedValue({ error: true, status: 404, message: 'Not found' });

            await notificacaoController.atualizarNotificacao(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('excluirNotificacao', () => {
        beforeEach(() => {
            mockReq.params.id = '1';
        });

        it('exclui notificação com sucesso', async () => {
            mockServiceInstance.excluir.mockResolvedValue({ success: true });

            await notificacaoController.excluirNotificacao(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.excluir).toHaveBeenCalledWith('1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: expect.any(String) }));
        });

        it('retorna erro 404', async () => {
            mockServiceInstance.excluir.mockResolvedValue({ error: true, status: 404, message: 'Not found' });

            await notificacaoController.excluirNotificacao(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('listarNotificacoesUsuario', () => {
        beforeEach(() => {
            mockReq.params.cpfUsuario = '123.456.789-00';
            mockFindAndCountAll.mockResolvedValue({
                count: 0,
                rows: []
            });
        });

        it('lista notificações do próprio usuário', async () => {
            mockServiceInstance.listarPorUsuario.mockResolvedValue({ notificacoes: [], total: 0, paginaAtual:1, totalPaginas:0, itensPorPagina:10 });

            await notificacaoController.listarNotificacoesUsuario(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.listarPorUsuario).toHaveBeenCalledWith(expect.objectContaining({ cpfUsuario: '123.456.789-00' }));
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                sucesso: true,
                dados: expect.any(Object)
            }));
        });

        it('retorna 403 ao tentar acessar notificações de outro usuário', async () => {
            mockReq.params.cpfUsuario = '987.654.321-00';

            await notificacaoController.listarNotificacoesUsuario(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockServiceInstance.listarPorUsuario).not.toHaveBeenCalled();
        });

        it('permite admin acessar notificações de qualquer usuário', async () => {
            mockReq.usuario.role = 'admin';
            mockReq.params.cpfUsuario = '987.654.321-00';

            mockServiceInstance.listarPorUsuario.mockResolvedValue({ notificacoes: [], total: 0, paginaAtual:1, totalPaginas:0, itensPorPagina:10 });

            await notificacaoController.listarNotificacoesUsuario(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.listarPorUsuario).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalledWith(403);
        });
    });

    describe('marcarComoLida', () => {
        beforeEach(() => {
            mockReq.params.id = '1';
        });

        it('marca notificação como lida', async () => {
            const usuarioNotificacaoInstance = { notificacao: { id: 1 }, notificacaoResult: true };
            mockServiceInstance.marcarComoLida.mockResolvedValue({ notificacao: { id: 1, lida: true } });

            await notificacaoController.marcarComoLida(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.marcarComoLida).toHaveBeenCalledWith(1, mockReq.usuario.cpf);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                sucesso: true,
                dados: expect.any(Object)
            }));
        });

        it('retorna erro 404', async () => {
            mockServiceInstance.marcarComoLida.mockResolvedValue({ error: true, status: 404, message: 'Not found' });

            await notificacaoController.marcarComoLida(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('enviarNotificacao', () => {
        beforeEach(() => {
            mockReq.params.id = '1';
            mockReq.body.usuarios = ['123.456.789-00'];
            // Setup model responses for enviar
            mockFindByPk.mockResolvedValue({ id: 1, criadoPor: mockReq.usuario.cpf, get: () => ({ id: 1 }) });
            mockFindAll.mockResolvedValue([{ cpf: '123.456.789-00' }]);
            mockFindOrCreate.mockResolvedValue([{}, true]);
        });

        it('envia notificação com sucesso', async () => {
            await notificacaoController.enviarNotificacao(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.enviar).toHaveBeenCalledWith(1, mockReq.body.usuarios);
            // controller returns created
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ sucesso: true }));
        });

        it('retorna erro 404', async () => {
            mockServiceInstance.enviar.mockResolvedValue({ error: true, status: 404, message: 'Not found' });

            await notificacaoController.enviarNotificacao(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('listarUsuariosNotificacao', () => {
        beforeEach(() => {
            mockReq.params.id = '1';
        });

        it('lista usuários de uma notificação', async () => {
            const mockUsuarios = [{ id: 1, nome: 'User 1' }];
            // Notificacao exists
            mockServiceInstance.listarUsuarios.mockResolvedValue({ usuarios: [{ id: 1, nome: 'User 1' }] });

            await notificacaoController.listarUsuariosNotificacao(mockReq, mockRes, mockNext);

            expect(mockServiceInstance.listarUsuarios).toHaveBeenCalledWith(1);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                sucesso: true,
                dados: expect.objectContaining({ usuarios: expect.any(Array) })
            }));
        });

        it('retorna erro 404', async () => {
            mockServiceInstance.listarUsuarios.mockResolvedValue({ error: true, status: 404, message: 'Not found' });

            await notificacaoController.listarUsuariosNotificacao(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });
});