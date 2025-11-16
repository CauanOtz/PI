import { jest } from '@jest/globals';

const EnderecoDTO = (await import('../../src/dto/EnderecoDTO.js')).default;

describe('EnderecoDTO', () => {
  describe('constructor and toJSON', () => {
    it('deve transformar modelo para camelCase', () => {
      const enderecoModel = {
        id: 1,
        cep: '12345-678',
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      };

      const dto = new EnderecoDTO(enderecoModel);
      const json = dto.toJSON();

      expect(json).toEqual({
        id: 1,
        cep: '12345-678',
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      });
    });

    it('deve lidar com valores null', () => {
      const dto = new EnderecoDTO(null);

      // O constructor não pode realmente retornar null em JS
      // então vamos verificar que os campos são undefined
      expect(dto.id).toBeUndefined();
      expect(dto.cep).toBeUndefined();
    });
  });

  describe('toFormattedString', () => {
    it('deve formatar endereço completo com número e complemento', () => {
      const enderecoModel = {
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '12345-678'
      };

      const dto = new EnderecoDTO(enderecoModel);
      const formatted = dto.toFormattedString('123', 'Apto 45');

      expect(formatted).toBe('Rua das Flores, 123, Apto 45, Centro, São Paulo, SP, CEP: 12345-678');
    });

    it('deve formatar endereço sem complemento', () => {
      const enderecoModel = {
        logradouro: 'Avenida Central',
        bairro: 'Vila Nova',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '98765-432'
      };

      const dto = new EnderecoDTO(enderecoModel);
      const formatted = dto.toFormattedString('456', null);

      expect(formatted).toBe('Avenida Central, 456, Vila Nova, Rio de Janeiro, RJ, CEP: 98765-432');
    });

    it('deve formatar endereço sem número', () => {
      const enderecoModel = {
        logradouro: 'Rua Sem Número',
        bairro: 'Bairro',
        cidade: 'Cidade',
        estado: 'UF',
        cep: '11111-111'
      };

      const dto = new EnderecoDTO(enderecoModel);
      const formatted = dto.toFormattedString(null, null);

      expect(formatted).toBe('Rua Sem Número, Bairro, Cidade, UF, CEP: 11111-111');
    });
  });
});
