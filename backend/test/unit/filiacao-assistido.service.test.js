import { jest } from '@jest/globals';

const mockFiliacaoAssistido = {
  findOrCreate: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn()
};

jest.unstable_mockModule('../../src/models/FiliacaoAssistido.model.js', () => ({ default: mockFiliacaoAssistido }));

const FiliacaoAssistido = (await import('../../src/models/FiliacaoAssistido.model.js')).default;
const FiliacaoAssistidoService = (await import('../../src/services/filiacao-assistido.service.js')).default;

describe('FiliacaoAssistidoService', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };

    mockFiliacaoAssistido.findOrCreate.mockReset();
    mockFiliacaoAssistido.findAll.mockReset();
    mockFiliacaoAssistido.destroy.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrUpdate', () => {
    it('deve criar nova filiação', async () => {
      const filiacao = {
        id: 1,
        assistidoId: 10,
        tipo: 'mae',
        nomeCompleto: 'Maria da Silva'
      };

      mockFiliacaoAssistido.findOrCreate.mockResolvedValue([filiacao, true]);

      const resultado = await FiliacaoAssistidoService.createOrUpdate(
        10,
        'mae',
        'Maria da Silva',
        mockTransaction
      );

      expect(resultado).toEqual(filiacao);
      expect(mockFiliacaoAssistido.findOrCreate).toHaveBeenCalledWith({
        where: {
          assistidoId: 10,
          tipo: 'mae'
        },
        defaults: {
          nomeCompleto: 'Maria da Silva'
        },
        transaction: mockTransaction
      });
    });

    it('deve atualizar filiação existente', async () => {
      const filiacaoExistente = {
        id: 1,
        assistidoId: 10,
        tipo: 'pai',
        nomeCompleto: 'João Silva ANTIGO',
        update: jest.fn().mockResolvedValue(true)
      };

      mockFiliacaoAssistido.findOrCreate.mockResolvedValue([filiacaoExistente, false]);

      const resultado = await FiliacaoAssistidoService.createOrUpdate(
        10,
        'pai',
        'João Silva NOVO',
        mockTransaction
      );

      expect(filiacaoExistente.update).toHaveBeenCalledWith(
        { nomeCompleto: 'João Silva NOVO' },
        { transaction: mockTransaction }
      );
    });
  });

  describe('createFromObject', () => {
    it('deve criar mae e pai quando ambos fornecidos', async () => {
      const filiacao = {
        mae: 'Maria da Silva',
        pai: 'João da Silva'
      };

      const maeCreated = { id: 1, assistidoId: 10, tipo: 'mae', nomeCompleto: 'Maria da Silva' };
      const paiCreated = { id: 2, assistidoId: 10, tipo: 'pai', nomeCompleto: 'João da Silva' };

      mockFiliacaoAssistido.findOrCreate
        .mockResolvedValueOnce([maeCreated, true])
        .mockResolvedValueOnce([paiCreated, true]);

      const resultado = await FiliacaoAssistidoService.createFromObject(10, filiacao, mockTransaction);

      expect(resultado).toHaveLength(2);
      expect(mockFiliacaoAssistido.findOrCreate).toHaveBeenCalledTimes(2);
    });

    it('deve criar apenas mae quando pai não fornecido', async () => {
      const filiacao = {
        mae: 'Maria da Silva'
      };

      const maeCreated = { id: 1, assistidoId: 10, tipo: 'mae', nomeCompleto: 'Maria da Silva' };

      mockFiliacaoAssistido.findOrCreate.mockResolvedValueOnce([maeCreated, true]);

      const resultado = await FiliacaoAssistidoService.createFromObject(10, filiacao, mockTransaction);

      expect(resultado).toHaveLength(1);
      expect(mockFiliacaoAssistido.findOrCreate).toHaveBeenCalledTimes(1);
    });

    it('deve retornar array vazio se nenhum fornecido', async () => {
      const resultado = await FiliacaoAssistidoService.createFromObject(10, {}, mockTransaction);

      expect(resultado).toEqual([]);
      expect(mockFiliacaoAssistido.findOrCreate).not.toHaveBeenCalled();
    });
  });

  describe('findByAssistido', () => {
    it('deve buscar filiações do assistido', async () => {
      const filiacoes = [
        { id: 1, tipo: 'mae', nomeCompleto: 'Maria' },
        { id: 2, tipo: 'pai', nomeCompleto: 'João' }
      ];

      mockFiliacaoAssistido.findAll.mockResolvedValue(filiacoes);

      const resultado = await FiliacaoAssistidoService.findByAssistido(10);

      expect(resultado).toEqual(filiacoes);
      expect(mockFiliacaoAssistido.findAll).toHaveBeenCalledWith({
        where: { assistidoId: 10 }
      });
    });
  });

  describe('getFiliacaoObject', () => {
    it('deve retornar objeto com mae e pai', async () => {
      const filiacoes = [
        { id: 1, tipo: 'mae', nomeCompleto: 'Maria da Silva' },
        { id: 2, tipo: 'pai', nomeCompleto: 'João da Silva' }
      ];

      mockFiliacaoAssistido.findAll.mockResolvedValue(filiacoes);

      const resultado = await FiliacaoAssistidoService.getFiliacaoObject(10);

      expect(resultado).toEqual({
        mae: 'Maria da Silva',
        pai: 'João da Silva'
      });
    });

    it('deve retornar apenas mae se pai não existe', async () => {
      const filiacoes = [
        { id: 1, tipo: 'mae', nomeCompleto: 'Maria da Silva' }
      ];

      mockFiliacaoAssistido.findAll.mockResolvedValue(filiacoes);

      const resultado = await FiliacaoAssistidoService.getFiliacaoObject(10);

      expect(resultado).toEqual({
        mae: 'Maria da Silva',
        pai: null
      });
    });
  });

  describe('delete', () => {
    it('deve deletar filiação específica', async () => {
      mockFiliacaoAssistido.destroy.mockResolvedValue(1);

      const resultado = await FiliacaoAssistidoService.delete(10, 'mae', mockTransaction);

      expect(resultado).toBe(1);
      expect(mockFiliacaoAssistido.destroy).toHaveBeenCalledWith({
        where: {
          assistidoId: 10,
          tipo: 'mae'
        },
        transaction: mockTransaction
      });
    });
  });

  describe('deleteAll', () => {
    it('deve deletar todas as filiações do assistido', async () => {
      mockFiliacaoAssistido.destroy.mockResolvedValue(2);

      const resultado = await FiliacaoAssistidoService.deleteAll(10, mockTransaction);

      expect(resultado).toBe(2);
      expect(mockFiliacaoAssistido.destroy).toHaveBeenCalledWith({
        where: { assistidoId: 10 },
        transaction: mockTransaction
      });
    });
  });
});
