import { jest } from '@jest/globals';

const mockContatoAssistido = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn()
};

jest.unstable_mockModule('../../src/models/ContatoAssistido.model.js', () => ({ default: mockContatoAssistido }));

const ContatoAssistido = (await import('../../src/models/ContatoAssistido.model.js')).default;
const ContatoAssistidoService = (await import('../../src/services/contato-assistido.service.js')).default;

describe('ContatoAssistidoService', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };

    mockContatoAssistido.create.mockReset();
    mockContatoAssistido.findByPk.mockReset();
    mockContatoAssistido.findAll.mockReset();
    mockContatoAssistido.destroy.mockReset();
    mockContatoAssistido.bulkCreate.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar contato com sucesso', async () => {
      const contatoData = {
        telefone: '(11) 98765-4321',
        nomeContato: 'Maria Silva',
        parentesco: 'Mãe',
        ordemPrioridade: 1
      };

      const contatoCriado = {
        id: 1,
        assistidoId: 10,
        ...contatoData
      };

      mockContatoAssistido.create.mockResolvedValue(contatoCriado);

      const resultado = await ContatoAssistidoService.create(10, contatoData, mockTransaction);

      expect(resultado).toEqual(contatoCriado);
      expect(mockContatoAssistido.create).toHaveBeenCalledWith(
        expect.objectContaining({
          assistidoId: 10,
          telefone: '(11) 98765-4321'
        })
      );
    });
  });

  describe('createMultiple', () => {
    it('deve criar múltiplos contatos', async () => {
      const contatos = [
        {
          telefone: '(11) 98765-4321',
          nomeContato: 'Maria',
          parentesco: 'Mãe',
          ordemPrioridade: 1
        },
        {
          telefone: '(11) 91234-5678',
          nomeContato: 'João',
          parentesco: 'Pai',
          ordemPrioridade: 2
        }
      ];

      const contatosCriados = contatos.map((c, i) => ({ id: i + 1, assistidoId: 10, ...c }));
      mockContatoAssistido.bulkCreate.mockResolvedValue(contatosCriados);

      const resultado = await ContatoAssistidoService.createMultiple(10, contatos, mockTransaction);

      expect(resultado).toEqual(contatosCriados);
      expect(mockContatoAssistido.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ assistidoId: 10, telefone: '(11) 98765-4321' })
        ]),
        { transaction: mockTransaction }
      );
    });

    it('deve retornar array vazio se contatos vazio', async () => {
      const resultado = await ContatoAssistidoService.createMultiple(10, [], mockTransaction);
      expect(resultado).toEqual([]);
      expect(mockContatoAssistido.bulkCreate).not.toHaveBeenCalled();
    });
  });

  describe('findByAssistido', () => {
    it('deve buscar contatos ordenados por prioridade', async () => {
      const contatos = [
        { id: 1, ordemPrioridade: 1, telefone: '(11) 98765-4321' },
        { id: 2, ordemPrioridade: 2, telefone: '(11) 91234-5678' }
      ];

      mockContatoAssistido.findAll.mockResolvedValue(contatos);

      const resultado = await ContatoAssistidoService.findByAssistido(10);

      expect(resultado).toEqual(contatos);
      expect(mockContatoAssistido.findAll).toHaveBeenCalledWith({
        where: { assistidoId: 10 },
        order: [['ordemPrioridade', 'ASC']]
      });
    });
  });

  describe('update', () => {
    it('deve atualizar contato existente', async () => {
      const contatoExistente = {
        id: 1,
        telefone: '(11) 98765-4321',
        update: jest.fn().mockResolvedValue({
          id: 1,
          telefone: '(11) 98765-4321',
          nomeContato: 'Maria da Silva ATUALIZADA',
          observacao: 'Ligar após 18h'
        })
      };

      const novosDados = {
        nomeContato: 'Maria da Silva ATUALIZADA',
        observacao: 'Ligar após 18h'
      };

      mockContatoAssistido.findByPk.mockResolvedValue(contatoExistente);

      const resultado = await ContatoAssistidoService.update(1, novosDados);

      expect(contatoExistente.update).toHaveBeenCalledWith(novosDados);
      expect(resultado).toHaveProperty('id', 1);
    });

    it('deve lançar erro se contato não existe', async () => {
      mockContatoAssistido.findByPk.mockResolvedValue(null);

      await expect(ContatoAssistidoService.update(999, {}))
        .rejects.toThrow('Contato não encontrado');
    });
  });

  describe('delete', () => {
    it('deve deletar contato existente', async () => {
      const contatoExistente = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      mockContatoAssistido.findByPk.mockResolvedValue(contatoExistente);

      await ContatoAssistidoService.delete(1);

      expect(contatoExistente.destroy).toHaveBeenCalled();
    });

    it('deve lançar erro se contato não existe', async () => {
      mockContatoAssistido.findByPk.mockResolvedValue(null);

      await expect(ContatoAssistidoService.delete(999))
        .rejects.toThrow('Contato não encontrado');
    });
  });

  describe('deleteByAssistido', () => {
    it('deve deletar todos os contatos do assistido', async () => {
      mockContatoAssistido.destroy.mockResolvedValue(2);

      const resultado = await ContatoAssistidoService.deleteByAssistido(10, mockTransaction);

      expect(resultado).toBe(2);
      expect(mockContatoAssistido.destroy).toHaveBeenCalledWith({
        where: { assistidoId: 10 },
        transaction: mockTransaction
      });
    });
  });

  describe('replaceAll', () => {
    it('deve substituir todos os contatos', async () => {
      const novosContatos = [
        {
          telefone: '(11) 99999-9999',
          nomeContato: 'Novo Contato',
          parentesco: 'Tio',
          ordemPrioridade: 1
        }
      ];

      const contatosCriados = [{ id: 5, assistidoId: 10, ...novosContatos[0] }];

      mockContatoAssistido.destroy.mockResolvedValue(2);
      mockContatoAssistido.bulkCreate.mockResolvedValue(contatosCriados);

      const resultado = await ContatoAssistidoService.replaceAll(10, novosContatos, mockTransaction);

      expect(mockContatoAssistido.destroy).toHaveBeenCalledWith({
        where: { assistidoId: 10 },
        transaction: mockTransaction
      });
      expect(mockContatoAssistido.bulkCreate).toHaveBeenCalled();
      expect(resultado).toEqual(contatosCriados);
    });
  });
});
