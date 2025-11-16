import { jest } from '@jest/globals';

const mockEndereco = {
  findOne: jest.fn(),
  findOrCreate: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn()
};

jest.unstable_mockModule('../../src/models/Endereco.model.js', () => ({ default: mockEndereco }));

const Endereco = (await import('../../src/models/Endereco.model.js')).default;
const EnderecoService = (await import('../../src/services/endereco.service.js')).default;

describe('EnderecoService', () => {
  beforeEach(() => {
    mockEndereco.findOne.mockReset();
    mockEndereco.findOrCreate.mockReset();
    mockEndereco.create.mockReset();
    mockEndereco.findByPk.mockReset();
    mockEndereco.update.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOrCreate', () => {
    it('deve retornar endereço existente se CEP já existe', async () => {
      const enderecoData = {
        cep: '12345-678',
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      const enderecoExistente = {
        id: 1,
        ...enderecoData,
        update: jest.fn().mockResolvedValue(true)
      };

      mockEndereco.findOrCreate.mockResolvedValue([enderecoExistente, false]);

      const resultado = await EnderecoService.findOrCreate(enderecoData);

      expect(resultado).toEqual(enderecoExistente);
      expect(mockEndereco.findOrCreate).toHaveBeenCalledWith({
        where: { cep: '12345-678' },
        defaults: {
          logradouro: 'Rua das Flores',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      });
      expect(enderecoExistente.update).not.toHaveBeenCalled();
    });

    it('deve atualizar endereço existente se dados diferentes', async () => {
      const enderecoData = {
        cep: '12345-678',
        logradouro: 'Rua das Flores NOVA',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      const enderecoExistente = {
        id: 1,
        cep: '12345-678',
        logradouro: 'Rua das Flores ANTIGA',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        update: jest.fn().mockResolvedValue(true)
      };

      mockEndereco.findOrCreate.mockResolvedValue([enderecoExistente, false]);

      const resultado = await EnderecoService.findOrCreate(enderecoData);

      expect(enderecoExistente.update).toHaveBeenCalledWith({
        logradouro: 'Rua das Flores NOVA',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      });
    });

    it('deve criar novo endereço se CEP não existe', async () => {
      const enderecoData = {
        cep: '98765-432',
        logradouro: 'Avenida Central',
        bairro: 'Vila Nova',
        cidade: 'Rio de Janeiro',
        estado: 'RJ'
      };

      const novoEndereco = { id: 2, ...enderecoData };

      mockEndereco.findOrCreate.mockResolvedValue([novoEndereco, true]);

      const resultado = await EnderecoService.findOrCreate(enderecoData);

      expect(resultado).toEqual(novoEndereco);
      expect(mockEndereco.findOrCreate).toHaveBeenCalledWith({
        where: { cep: '98765-432' },
        defaults: {
          logradouro: 'Avenida Central',
          bairro: 'Vila Nova',
          cidade: 'Rio de Janeiro',
          estado: 'RJ'
        }
      });
    });
  });

  describe('findByCep', () => {
    it('deve buscar endereço por CEP', async () => {
      const endereco = {
        id: 1,
        cep: '12345-678',
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      mockEndereco.findOne.mockResolvedValue(endereco);

      const resultado = await EnderecoService.findByCep('12345-678');

      expect(resultado).toEqual(endereco);
      expect(mockEndereco.findOne).toHaveBeenCalledWith({
        where: { cep: '12345-678' }
      });
    });

    it('deve retornar null se CEP não existe', async () => {
      mockEndereco.findOne.mockResolvedValue(null);

      const resultado = await EnderecoService.findByCep('99999-999');

      expect(resultado).toBeNull();
    });
  });

  describe('findById', () => {
    it('deve buscar endereço por ID', async () => {
      const endereco = {
        id: 1,
        cep: '12345-678',
        logradouro: 'Rua das Flores'
      };

      mockEndereco.findByPk.mockResolvedValue(endereco);

      const resultado = await EnderecoService.findById(1);

      expect(resultado).toEqual(endereco);
      expect(mockEndereco.findByPk).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve atualizar endereço existente', async () => {
      const enderecoExistente = {
        id: 1,
        update: jest.fn().mockResolvedValue({ id: 1, logradouro: 'ATUALIZADO' })
      };

      const novosDados = {
        logradouro: 'Rua ATUALIZADA',
        bairro: 'Bairro NOVO'
      };

      mockEndereco.findByPk.mockResolvedValue(enderecoExistente);

      const resultado = await EnderecoService.update(1, novosDados);

      expect(enderecoExistente.update).toHaveBeenCalledWith(novosDados);
      expect(resultado).toHaveProperty('id', 1);
    });

    it('deve lançar erro se endereço não existe', async () => {
      mockEndereco.findByPk.mockResolvedValue(null);

      await expect(EnderecoService.update(999, {}))
        .rejects.toThrow('Endereço não encontrado');
    });
  });
});
