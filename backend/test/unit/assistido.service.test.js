import { jest } from '@jest/globals';
import { Op } from 'sequelize';

const mockAssistido = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  count: jest.fn(),
  destroy: jest.fn()
};

const mockEndereco = {
  findOne: jest.fn(),
  create: jest.fn()
};

const mockContatoAssistido = {
  bulkCreate: jest.fn(),
  destroy: jest.fn()
};

const mockFiliacaoAssistido = {
  findOrCreate: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  where: jest.fn(),
  fn: jest.fn(),
  col: jest.fn()
};

const mockEnderecoService = {
  findOrCreate: jest.fn()
};

const mockContatoAssistidoService = {
  createMultiple: jest.fn(),
  replaceAll: jest.fn()
};

const mockFiliacaoAssistidoService = {
  createFromObject: jest.fn()
};

jest.unstable_mockModule('../../src/models/Assistido.model.js', () => ({ default: mockAssistido }));
jest.unstable_mockModule('../../src/models/Endereco.model.js', () => ({ default: mockEndereco }));
jest.unstable_mockModule('../../src/models/ContatoAssistido.model.js', () => ({ default: mockContatoAssistido }));
jest.unstable_mockModule('../../src/models/FiliacaoAssistido.model.js', () => ({ default: mockFiliacaoAssistido }));
jest.unstable_mockModule('../../src/config/database.js', () => ({ sequelize: mockSequelize }));
jest.unstable_mockModule('../../src/services/endereco.service.js', () => ({ default: mockEnderecoService }));
jest.unstable_mockModule('../../src/services/contato-assistido.service.js', () => ({ default: mockContatoAssistidoService }));
jest.unstable_mockModule('../../src/services/filiacao-assistido.service.js', () => ({ default: mockFiliacaoAssistidoService }));

const Assistido = (await import('../../src/models/Assistido.model.js')).default;
const { sequelize } = await import('../../src/config/database.js');
const AssistidoService = (await import('../../src/services/assistido.service.js')).default;

describe('AssistidoService', () => {
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

    mockAssistido.create.mockReset();
    mockAssistido.findByPk.mockReset();
    mockAssistido.findAndCountAll.mockReset();
    mockAssistido.count.mockReset();
    mockEnderecoService.findOrCreate.mockReset();
    mockContatoAssistidoService.createMultiple.mockReset();
    mockContatoAssistidoService.replaceAll.mockReset();
    mockFiliacaoAssistidoService.createFromObject.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listAll', () => {
    it('deve listar assistidos com paginação', async () => {
      const assistidos = [
        {
          id: 1,
          nome: 'Maria Silva',
          endereco: { id: 1, cep: '12345-678' },
          contatos: [{ id: 1, telefone: '(11) 98765-4321' }],
          filiacao: [{ tipo: 'mae', nomeCompleto: 'Ana Silva' }]
        },
        {
          id: 2,
          nome: 'João Santos',
          endereco: { id: 2, cep: '98765-432' },
          contatos: [{ id: 2, telefone: '(11) 91234-5678' }],
          filiacao: []
        }
      ];

      mockAssistido.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: assistidos
      });

      const resultado = await AssistidoService.listAll({ page: 1, limit: 10 });

      expect(resultado.count).toBe(2);
      expect(resultado.rows).toEqual(assistidos);
      expect(resultado.page).toBe(1);
      expect(resultado.limit).toBe(10);
    });

    it('deve buscar assistidos com termo de pesquisa', async () => {
      mockSequelize.where.mockReturnValue({ [Op.like]: '%maria%' });
      mockSequelize.fn.mockReturnValue('LOWER');
      mockSequelize.col.mockReturnValue('Assistido.nome');

      mockAssistido.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, nome: 'Maria Silva' }]
      });

      await AssistidoService.listAll({ page: 1, limit: 10, search: 'Maria' });

      expect(mockAssistido.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('deve retornar assistido com relacionamentos', async () => {
      const assistido = {
        id: 1,
        nome: 'Maria Silva',
        endereco: { id: 1, cep: '12345-678' },
        contatos: [{ id: 1, telefone: '(11) 98765-4321' }],
        filiacao: [{ tipo: 'mae', nomeCompleto: 'Ana Silva' }]
      };

      mockAssistido.findByPk.mockResolvedValue(assistido);

      const resultado = await AssistidoService.getById(1);

      expect(resultado).toEqual(assistido);
      expect(mockAssistido.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'endereco' }),
          expect.objectContaining({ as: 'contatos' }),
          expect.objectContaining({ as: 'filiacao' })
        ])
      }));
    });

    it('deve lançar erro se assistido não existe', async () => {
      mockAssistido.findByPk.mockResolvedValue(null);

      await expect(AssistidoService.getById(999))
        .rejects.toThrow('Assistido não encontrado');
    });

    it('deve lançar erro se ID inválido', async () => {
      await expect(AssistidoService.getById('abc'))
        .rejects.toThrow('ID do assistido inválido');
    });
  });

  describe('create', () => {
    it('deve criar assistido completo com endereço, contatos e filiação', async () => {
      const dadosAssistido = {
        nome: 'Maria Silva',
        dataNascimento: '2015-07-22',
        sexo: 'Feminino',
        cartaoSus: '123456789012345',
        rg: '12.345.678-9',
        endereco: {
          cep: '12345-678',
          logradouro: 'Rua das Flores',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        numero: '123',
        complemento: 'Apto 45',
        contatos: [
          {
            telefone: '(11) 98765-4321',
            nomeContato: 'Maria',
            parentesco: 'Mãe',
            ordemPrioridade: 1
          }
        ],
        filiacao: {
          mae: 'Ana Silva',
          pai: 'João Silva'
        },
        problemasSaude: 'Nenhum'
      };

      const enderecoCreated = { id: 1, cep: '12345-678' };
      const assistidoCreated = { id: 1, nome: 'Maria Silva', enderecoId: 1 };
      const contatosCreated = [{ id: 1, telefone: '(11) 98765-4321' }];
      const filiacaoCreated = [
        { id: 1, tipo: 'mae', nomeCompleto: 'Ana Silva' },
        { id: 2, tipo: 'pai', nomeCompleto: 'João Silva' }
      ];

      mockEnderecoService.findOrCreate.mockResolvedValue(enderecoCreated);
      mockAssistido.create.mockResolvedValue(assistidoCreated);
      mockContatoAssistidoService.createMultiple.mockResolvedValue(contatosCreated);
      mockFiliacaoAssistidoService.createFromObject.mockResolvedValue(filiacaoCreated);

      const assistidoCompleto = {
        ...assistidoCreated,
        endereco: enderecoCreated,
        contatos: contatosCreated,
        filiacao: filiacaoCreated
      };

      mockAssistido.findByPk.mockResolvedValue(assistidoCompleto);

      const resultado = await AssistidoService.create(dadosAssistido);

      expect(mockEnderecoService.findOrCreate).toHaveBeenCalledWith(dadosAssistido.endereco);
      expect(mockAssistido.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Maria Silva',
          enderecoId: 1
        }),
        { transaction: mockTransaction }
      );
      expect(mockContatoAssistidoService.createMultiple).toHaveBeenCalled();
      expect(mockFiliacaoAssistidoService.createFromObject).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('deve criar assistido sem endereço', async () => {
      const dadosAssistido = {
        nome: 'João Santos',
        dataNascimento: '2010-01-01',
        sexo: 'Masculino',
        contatos: [
          {
            telefone: '(11) 91234-5678',
            nomeContato: 'Contato',
            parentesco: 'Tio',
            ordemPrioridade: 1
          }
        ]
      };

      const assistidoCreated = { id: 2, nome: 'João Santos', enderecoId: null };
      mockAssistido.create.mockResolvedValue(assistidoCreated);
      mockContatoAssistidoService.createMultiple.mockResolvedValue([]);
      mockAssistido.findByPk.mockResolvedValue({ ...assistidoCreated, contatos: [], filiacao: [] });

      await AssistidoService.create(dadosAssistido);

      expect(mockEnderecoService.findOrCreate).not.toHaveBeenCalled();
      expect(mockAssistido.create).toHaveBeenCalledWith(
        expect.objectContaining({
          enderecoId: null
        }),
        { transaction: mockTransaction }
      );
    });

    it('deve lançar erro se contatos não fornecidos', async () => {
      const dadosAssistido = {
        nome: 'Teste',
        dataNascimento: '2010-01-01',
        sexo: 'Masculino',
        contatos: []
      };

      await expect(AssistidoService.create(dadosAssistido))
        .rejects.toThrow('É obrigatório cadastrar pelo menos um contato');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('deve fazer rollback em caso de erro', async () => {
      const dadosAssistido = {
        nome: 'Teste',
        dataNascimento: '2010-01-01',
        sexo: 'Masculino',
        contatos: [{ telefone: '(11) 98765-4321' }]
      };

      mockAssistido.create.mockRejectedValue(new Error('Erro no banco'));

      await expect(AssistidoService.create(dadosAssistido))
        .rejects.toThrow('Erro no banco');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar assistido com todos os dados', async () => {
      const assistidoExistente = {
        id: 1,
        enderecoId: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      const dadosAtualizacao = {
        nome: 'Maria Silva ATUALIZADA',
        endereco: {
          cep: '98765-432',
          logradouro: 'Rua Nova'
        },
        numero: '456',
        contatos: [
          {
            telefone: '(11) 99999-9999',
            nomeContato: 'Novo Contato',
            parentesco: 'Avó',
            ordemPrioridade: 1
          }
        ],
        filiacao: {
          mae: 'Nova Mãe'
        }
      };

      const novoEndereco = { id: 2, cep: '98765-432' };
      mockAssistido.findByPk.mockResolvedValueOnce(assistidoExistente);
      mockEnderecoService.findOrCreate.mockResolvedValue(novoEndereco);
      mockContatoAssistidoService.replaceAll.mockResolvedValue([]);
      mockFiliacaoAssistidoService.createFromObject.mockResolvedValue([]);

      const assistidoAtualizado = { ...assistidoExistente, nome: 'Maria Silva ATUALIZADA' };
      mockAssistido.findByPk.mockResolvedValueOnce(assistidoAtualizado);

      await AssistidoService.update(1, dadosAtualizacao);

      expect(assistidoExistente.update).toHaveBeenCalled();
      expect(mockEnderecoService.findOrCreate).toHaveBeenCalledWith(dadosAtualizacao.endereco);
      expect(mockContatoAssistidoService.replaceAll).toHaveBeenCalled();
      expect(mockFiliacaoAssistidoService.createFromObject).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('deve lançar erro se assistido não existe', async () => {
      mockAssistido.findByPk.mockResolvedValue(null);

      await expect(AssistidoService.update(999, {}))
        .rejects.toThrow('Assistido não encontrado');
    });

    it('deve lançar erro se contatos vazio', async () => {
      const assistidoExistente = {
        id: 1,
        update: jest.fn()
      };

      mockAssistido.findByPk.mockResolvedValue(assistidoExistente);

      await expect(AssistidoService.update(1, { contatos: [] }))
        .rejects.toThrow('É obrigatório ter pelo menos um contato');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar assistido existente', async () => {
      const assistido = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      mockAssistido.findByPk.mockResolvedValue(assistido);

      const resultado = await AssistidoService.delete(1);

      expect(resultado).toBe(true);
      expect(assistido.destroy).toHaveBeenCalled();
    });

    it('deve lançar erro se assistido não existe', async () => {
      mockAssistido.findByPk.mockResolvedValue(null);

      await expect(AssistidoService.delete(999))
        .rejects.toThrow('Assistido não encontrado');
    });
  });

  describe('count', () => {
    it('deve contar total de assistidos', async () => {
      mockAssistido.count.mockResolvedValue(42);

      const resultado = await AssistidoService.count();

      expect(resultado).toBe(42);
      expect(mockAssistido.count).toHaveBeenCalled();
    });
  });
});
