import { jest } from '@jest/globals';

const mockNotificacaoModel = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
    get: jest.fn(function() { return this; })
};

const mockUsuarioNotificacaoModel = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    get: jest.fn(function() { return this; }),
    Notificacao: { get: jest.fn() }
};

const mockUsuarioModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    get: jest.fn(function() { return this; })
};

jest.mock('../../src/models/Notificacao.model.js', () => ({ default: mockNotificacaoModel }));
jest.mock('../../src/models/UsuarioNotificacao.model.js', () => ({ default: mockUsuarioNotificacaoModel }));
jest.mock('../../src/models/Usuario.model.js', () => ({ default: mockUsuarioModel }));

const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
};

const mockSequelize = {
    transaction: jest.fn().mockResolvedValue(mockTransaction)
};

jest.mock('../../src/config/database.js', () => ({ sequelize: mockSequelize }));

describe('NotificacaoService', () => {
    let service;

    beforeEach(async () => {
        jest.clearAllMocks();
        mockTransaction.commit.mockClear();
        mockTransaction.rollback.mockClear();
        mockSequelize.transaction.mockClear();

        // Reset mock implementations
        mockNotificacaoModel.findByPk.mockResolvedValue(null);
        mockNotificacaoModel.create.mockImplementation(data => ({
            ...data,
            id: 1,
            get: jest.fn(() => data)
        }));
        
        mockUsuarioNotificacaoModel.findOne.mockResolvedValue(null);
        mockUsuarioNotificacaoModel.bulkCreate.mockResolvedValue([]);
        
        mockUsuarioModel.findAll.mockResolvedValue([]);

        // Import the service after model/database mocks are in place
        const { default: NotificacaoService, __setModelsForTests } = await import('../../src/services/notificacao.service.js');
        // Inject mock models and sequelize into the service (works even if module was cached)
        if (typeof __setModelsForTests === 'function') {
            __setModelsForTests({ Notificacao: mockNotificacaoModel, Usuario: mockUsuarioModel, UsuarioNotificacao: mockUsuarioNotificacaoModel, sequelize: mockSequelize });
        }
        service = new NotificacaoService();
    });

    describe('criar', () => {
        const mockNotificacao = {
            titulo: 'Test',
            mensagem: 'Test message',
            tipo: 'info',
            criadoPor: '123.456.789-00'
        };

        it('cria notificação com sucesso', async () => {
            const createdNotificacao = {
                ...mockNotificacao,
                id: 1,
                get: jest.fn(() => mockNotificacao)
            };
            mockNotificacaoModel.create.mockResolvedValue(createdNotificacao);

            const result = await service.criar(mockNotificacao);
            
            expect(mockNotificacaoModel.create).toHaveBeenCalledWith(expect.objectContaining(mockNotificacao));
            expect(result.notificacao).toBeDefined();
            expect(result.notificacao).toEqual(mockNotificacao);
        });

        it('retorna erro em caso de validação', async () => {
            const validationError = new Error('Validation error');
            validationError.name = 'SequelizeValidationError';
            mockNotificacaoModel.create.mockRejectedValue(validationError);

            const result = await service.criar(mockNotificacao);
            expect(result.error).toBe(true);
            expect(result.status).toBe(400);
        });
    });

    describe('listar', () => {
        const mockNotificacoes = [
            { 
                id: 1, 
                titulo: 'Test 1',
                get: jest.fn(),
                destinatarios: []
            },
            { 
                id: 2, 
                titulo: 'Test 2',
                get: jest.fn(),
                destinatarios: []
            }
        ];

        beforeEach(() => {
            mockNotificacoes.forEach(n => {
                n.get.mockReturnValue({ ...n, destinatarios: [] });
            });
        });

        it('lista notificações com paginação', async () => {
            mockNotificacaoModel.findAndCountAll.mockResolvedValue({
                count: 2,
                rows: mockNotificacoes
            });

            const result = await service.listar({ page: 1, limit: 10 });
            
            expect(result.notificacoes).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(mockNotificacaoModel.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                limit: 10,
                offset: 0
            }));
        });

        it('inclui métricas de leitura quando incluirDestinatarios=true', async () => {
            const mockWithDest = {
                id: 1,
                titulo: 'Test',
                get: jest.fn(() => ({
                    id: 1,
                    titulo: 'Test',
                    destinatarios: [
                        { UsuarioNotificacao: { lida: true } },
                        { UsuarioNotificacao: { lida: false } }
                    ]
                }))
            };

            mockNotificacaoModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [mockWithDest]
            });

            const result = await service.listar({ incluirDestinatarios: true });
            
            expect(result.notificacoes[0].metaEntrega).toBeDefined();
            expect(result.notificacoes[0].metaEntrega.totalDestinatarios).toBe(2);
            expect(result.notificacoes[0].metaEntrega.lidas).toBe(1);
        });
    });

    describe('listarPorUsuario', () => {
        const mockUsuarioNotificacoes = [
            {
                lida: false,
                Notificacao: {
                    id: 1,
                    titulo: 'Test 1',
                    get: jest.fn(() => ({
                        id: 1,
                        titulo: 'Test 1',
                        destinatarios: []
                    }))
                }
            }
        ];

        it('lista notificações do usuário com paginação', async () => {
            mockUsuarioNotificacaoModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: mockUsuarioNotificacoes
            });

            const result = await service.listarPorUsuario({
                cpfUsuario: '123.456.789-00',
                page: 1,
                limit: 10
            });

            expect(result.notificacoes).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(mockUsuarioNotificacaoModel.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { cpfUsuario: '123.456.789-00' }
                })
            );
        });

        it('filtra por status de leitura', async () => {
            mockUsuarioNotificacaoModel.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: mockUsuarioNotificacoes
            });

            await service.listarPorUsuario({
                cpfUsuario: '123.456.789-00',
                lida: true
            });

            expect(mockUsuarioNotificacaoModel.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { cpfUsuario: '123.456.789-00', lida: true }
                })
            );
        });
    });

    describe('obter', () => {
        it('retorna notificação existente', async () => {
            const mockNotificacao = { 
                id: 1, 
                titulo: 'Test',
                get: jest.fn(() => ({
                    id: 1,
                    titulo: 'Test'
                }))
            };
            mockNotificacaoModel.findByPk.mockResolvedValue(mockNotificacao);

            const result = await service.obter(1);
            expect(result.notificacao).toBeDefined();
            expect(result.notificacao.id).toBe(1);
        });

        it('retorna erro para notificação inexistente', async () => {
            mockNotificacaoModel.findByPk.mockResolvedValue(null);

            const result = await service.obter(1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });
    });

    describe('atualizar', () => {
        const mockNotificacao = {
            id: 1,
            update: jest.fn(),
            get: jest.fn(() => ({
                id: 1,
                titulo: 'Updated'
            }))
        };

        it('atualiza notificação existente', async () => {
            mockNotificacaoModel.findByPk.mockResolvedValue(mockNotificacao);
            mockNotificacao.update.mockResolvedValue(mockNotificacao);

            const updates = { titulo: 'Updated' };
            const result = await service.atualizar(1, updates);
            
            expect(result.notificacao).toBeDefined();
            expect(mockNotificacao.update).toHaveBeenCalledWith(updates);
        });

        it('retorna erro para notificação inexistente', async () => {
            mockNotificacaoModel.findByPk.mockResolvedValue(null);

            const result = await service.atualizar(1, { titulo: 'Updated' });
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });
    });

    describe('excluir', () => {
        it('exclui notificação existente', async () => {
            const mockNotificacao = {
                id: 1,
                destroy: jest.fn(),
                get: jest.fn(() => ({
                    id: 1
                }))
            };
            mockNotificacaoModel.findByPk.mockResolvedValue(mockNotificacao);

            const result = await service.excluir(1);
            expect(result.success).toBe(true);
            expect(mockNotificacao.destroy).toHaveBeenCalled();
        });

        it('retorna erro para notificação inexistente', async () => {
            mockNotificacaoModel.findByPk.mockResolvedValue(null);

            const result = await service.excluir(1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });
    });

    describe('enviar', () => {
        const mockNotificacao = { 
            id: 1,
            get: jest.fn(() => ({
                id: 1
            }))
        };
        const mockUsuarios = ['123.456.789-00', '987.654.321-00'];

        beforeEach(() => {
            mockNotificacaoModel.findByPk.mockResolvedValue(mockNotificacao);
            mockUsuarioModel.findAll.mockResolvedValue(mockUsuarios.map(cpf => ({ cpf })));
            mockUsuarioNotificacaoModel.bulkCreate.mockResolvedValue([]);
        });

        it('envia notificação para múltiplos usuários', async () => {
            const result = await service.enviar(1, mockUsuarios);

            expect(result.success).toBe(true);
            expect(mockUsuarioNotificacaoModel.bulkCreate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        notificacaoId: 1,
                        cpfUsuario: mockUsuarios[0]
                    })
                ]),
                expect.any(Object)
            );
            expect(mockTransaction.commit).toHaveBeenCalled();
        });

        it('faz rollback em caso de erro', async () => {
            const error = new Error('Test error');
            mockUsuarioNotificacaoModel.bulkCreate.mockRejectedValue(error);

            await expect(service.enviar(1, mockUsuarios)).rejects.toThrow(error);
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('retorna erro se notificação não existe', async () => {
            mockNotificacaoModel.findByPk.mockResolvedValue(null);

            const result = await service.enviar(1, mockUsuarios);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('retorna erro se algum usuário não existe', async () => {
            mockUsuarioModel.findAll.mockResolvedValue([{ cpf: mockUsuarios[0] }]); // apenas um usuário encontrado

            const result = await service.enviar(1, mockUsuarios);
            expect(result.error).toBe(true);
            expect(result.status).toBe(400);
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
    });

    describe('marcarComoLida', () => {
        const mockUsuarioNotificacao = {
            id: 1,
            lida: false,
            Notificacao: { 
                id: 1,
                get: jest.fn(() => ({
                    id: 1
                }))
            },
            update: jest.fn()
        };

        it('marca notificação como lida', async () => {
            mockUsuarioNotificacaoModel.findOne.mockResolvedValue(mockUsuarioNotificacao);
            mockUsuarioNotificacao.update.mockResolvedValue(mockUsuarioNotificacao);

            const result = await service.marcarComoLida(1, '123.456.789-00');
            expect(result.notificacao).toBeDefined();
            expect(mockUsuarioNotificacao.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    lida: true,
                    dataLeitura: expect.any(Date)
                })
            );
        });

        it('retorna erro se relação não existe', async () => {
            mockUsuarioNotificacaoModel.findOne.mockResolvedValue(null);

            const result = await service.marcarComoLida(1, '123.456.789-00');
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });

        it('não atualiza se já estiver lida', async () => {
            const jaLida = { 
                ...mockUsuarioNotificacao, 
                lida: true,
                Notificacao: { 
                    id: 1,
                    get: jest.fn(() => ({
                        id: 1
                    }))
                }
            };
            mockUsuarioNotificacaoModel.findOne.mockResolvedValue(jaLida);

            await service.marcarComoLida(1, '123.456.789-00');
            expect(jaLida.update).not.toHaveBeenCalled();
        });
    });

    describe('listarUsuarios', () => {
        it('retorna usuários de uma notificação', async () => {
            const mockNotificacao = {
                id: 1,
                destinatarios: [{ id: 1, nome: 'User 1' }],
                get: jest.fn(() => ({
                    id: 1,
                    destinatarios: [{ id: 1, nome: 'User 1' }]
                }))
            };
            mockNotificacaoModel.findByPk.mockResolvedValue(mockNotificacao);

            const result = await service.listarUsuarios(1);
            expect(result.usuarios).toEqual(mockNotificacao.destinatarios);
        });

        it('retorna erro se notificação não existe', async () => {
            mockNotificacaoModel.findByPk.mockResolvedValue(null);

            const result = await service.listarUsuarios(1);
            expect(result.error).toBe(true);
            expect(result.status).toBe(404);
        });
    });
});