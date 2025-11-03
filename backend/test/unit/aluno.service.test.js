import { jest } from '@jest/globals';

const mockAluno = {
  create: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn(),
  setResponsaveis: jest.fn(),
  addResponsaveis: jest.fn()
};

const mockUsuario = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockDocumento = {
  destroy: jest.fn()
};

const mockResponsavelAluno = {
  destroy: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  models: {
    Presenca: { destroy: jest.fn() }
  },
  query: jest.fn()
};

// Use unstable_mockModule so mocks are applied before ESM module import
jest.unstable_mockModule('../../src/models/Aluno.model.js', () => ({ default: mockAluno }));
jest.unstable_mockModule('../../src/models/Usuario.model.js', () => ({ default: mockUsuario }));
jest.unstable_mockModule('../../src/models/Documento.model.js', () => ({ default: mockDocumento }));
jest.unstable_mockModule('../../src/models/ResponsavelAluno.model.js', () => ({ default: mockResponsavelAluno }));
jest.unstable_mockModule('../../src/config/database.js', () => ({ sequelize: mockSequelize }));
jest.unstable_mockModule('sequelize', () => ({ Op: { and: Symbol('and') } }));

const Aluno = (await import('../../src/models/Aluno.model.js')).default;
const Usuario = (await import('../../src/models/Usuario.model.js')).default;
const Documento = (await import('../../src/models/Documento.model.js')).default;
const ResponsavelAluno = (await import('../../src/models/ResponsavelAluno.model.js')).default;
const { sequelize } = await import('../../src/config/database.js');
const AlunoService = (await import('../../src/services/aluno.service.js')).default;

describe('AlunoService', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };
    mockSequelize.transaction.mockImplementation(async (callback) => {
      if (callback) {
        return callback(mockTransaction);
      }
      return mockTransaction;
    });
    mockSequelize.models = { Presenca: { destroy: jest.fn().mockResolvedValue(1) } };
    mockSequelize.query.mockResolvedValue([]);
    
    // Reset all mocks
    mockUsuario.findAll.mockReset();
    mockAluno.create.mockReset();
    mockAluno.findByPk.mockReset();
    mockDocumento.destroy.mockReset();
    mockResponsavelAluno.destroy.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('cria aluno com responsaveis', async () => {
      const novoAluno = {
        nome: 'Teste',
        idade: 8,
        endereco: null,
        contato: null,
        responsaveisIds: [1]
      };

      const fakeResponsaveis = [{ id: 1 }];
        const addResponsaveisMock = jest.fn().mockResolvedValue(undefined);
      const createdAluno = {
        id: 10,
        nome: 'Teste',
          addResponsaveis: addResponsaveisMock,
        toJSON: () => ({
          id: 10,
          nome: 'Teste',
          responsaveis: fakeResponsaveis
        })
      };

      mockUsuario.findAll.mockResolvedValue(fakeResponsaveis);
      mockAluno.create.mockResolvedValue(createdAluno);
      mockAluno.findByPk.mockResolvedValue({
        ...createdAluno,
        responsaveis: fakeResponsaveis
      });

      const result = await AlunoService.create(novoAluno);

      expect(result.id).toBe(10);
      expect(result.responsaveis).toBeInstanceOf(Array);
      expect(result.responsaveis).toHaveLength(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
        expect(addResponsaveisMock).toHaveBeenCalledWith(fakeResponsaveis, { transaction: mockTransaction });
    });
  });
      it('cria aluno sem responsaveis quando array vazio', async () => {
        const novoAluno = {
          nome: 'Teste',
          idade: 8,
          endereco: null,
          contato: null,
          responsaveisIds: []
        };

        const addResponsaveisMock = jest.fn().mockResolvedValue(undefined);
        const createdAluno = {
          id: 11,
          nome: 'Teste',
          addResponsaveis: addResponsaveisMock,
          toJSON: () => ({
            id: 11,
            nome: 'Teste',
            responsaveis: []
          })
        };

        mockAluno.create.mockResolvedValue(createdAluno);
        mockAluno.findByPk.mockResolvedValue({
          ...createdAluno,
          responsaveis: []
        });

        const result = await AlunoService.create(novoAluno);

        expect(result.id).toBe(11);
        expect(result.responsaveis).toBeInstanceOf(Array);
        expect(result.responsaveis).toHaveLength(0);
        expect(mockUsuario.findAll).not.toHaveBeenCalled();
        expect(addResponsaveisMock).not.toHaveBeenCalled();
        expect(mockTransaction.commit).toHaveBeenCalled();
      });

  describe('update', () => {
    it('atualiza aluno e responsaveis', async () => {
      const alunoId = 20;
      const updateData = { 
        nome: 'Atualizado',
          idade: 10,
          endereco: 'Novo endereco',
          contato: '123456',
        responsaveisIds: [3]
      };
      
        const fakeResponsaveis = [{ id: 3 }];
      const updateMock = jest.fn().mockImplementation(async function (data) { Object.assign(this, data); return undefined; });
      const setResponsaveisMock = jest.fn().mockResolvedValue(undefined);
      
      const alunoModel = {
        id: alunoId,
        nome: 'Original',
          update: updateMock,
          setResponsaveis: setResponsaveisMock,
        toJSON: () => ({
          id: 20,
          nome: 'Atualizado',
          responsaveis: [{ id: 3 }]
        }),
        responsaveis: [{ id: 3 }]
      };

      mockAluno.findByPk.mockResolvedValue(alunoModel);
        mockUsuario.findAll.mockResolvedValue(fakeResponsaveis);

      const result = await AlunoService.update(alunoId, updateData);

      expect(result.id).toBe(20);
      expect(result.nome).toBe('Atualizado');
      expect(result.responsaveis).toBeInstanceOf(Array);
        expect(updateMock).toHaveBeenCalledWith({
          nome: updateData.nome,
          idade: updateData.idade,
          endereco: updateData.endereco,
          contato: updateData.contato
        }, { transaction: mockTransaction });
        expect(setResponsaveisMock).toHaveBeenCalledWith(fakeResponsaveis, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });
      it('retorna null quando aluno não é encontrado', async () => {
        mockAluno.findByPk.mockResolvedValue(null);

        const result = await AlunoService.update(999, { nome: 'Teste' });

        expect(result).toBeNull();
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
      });

      it('não atualiza responsáveis quando não fornecidos', async () => {
        const alunoId = 20;
        const updateData = { 
          nome: 'Atualizado',
        };
      
        const updateMock = jest.fn().mockResolvedValue(undefined);
        const setResponsaveisMock = jest.fn().mockResolvedValue(undefined);
      
        const alunoModel = {
          id: alunoId,
          nome: 'Original',
          update: updateMock,
          setResponsaveis: setResponsaveisMock,
          toJSON: () => ({
            id: 20,
            nome: 'Atualizado',
            responsaveis: []
          }),
          responsaveis: []
        };

        mockAluno.findByPk.mockResolvedValue(alunoModel);

        const result = await AlunoService.update(alunoId, updateData);

        expect(result.id).toBe(20);
        expect(updateMock).toHaveBeenCalledWith(updateData, { transaction: mockTransaction });
        expect(setResponsaveisMock).not.toHaveBeenCalled();
        expect(mockUsuario.findAll).not.toHaveBeenCalled();
        expect(mockTransaction.commit).toHaveBeenCalled();
      });

  describe('remove', () => {
    it('remove aluno e dados relacionados', async () => {
      const destroyMock = jest.fn().mockResolvedValue(undefined);
      const alunoModel = {
        id: 30,
        destroy: destroyMock,
        toJSON: () => ({ id: 30 })
      };
      
      mockAluno.findByPk.mockResolvedValue(alunoModel);
      mockDocumento.destroy.mockResolvedValue(1);
      mockResponsavelAluno.destroy.mockResolvedValue(1);

      await AlunoService.remove(30);

      expect(mockDocumento.destroy).toHaveBeenCalled();
      expect(mockResponsavelAluno.destroy).toHaveBeenCalled();
      expect(destroyMock).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
      it('retorna null quando aluno não é encontrado', async () => {
        mockAluno.findByPk.mockResolvedValue(null);

        const result = await AlunoService.remove(999);

        expect(result).toBeNull();
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
      });

      it('faz rollback quando ocorre erro ao remover', async () => {
        const alunoModel = {
          id: 30,
          destroy: jest.fn().mockRejectedValue(new Error('Erro ao excluir')),
          toJSON: () => ({ id: 30 })
        };
      
        mockAluno.findByPk.mockResolvedValue(alunoModel);

        await expect(AlunoService.remove(30)).rejects.toThrow('Erro ao excluir');
        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(mockTransaction.commit).not.toHaveBeenCalled();
      });
  });
});
