import { jest } from '@jest/globals';

const FiliacaoAssistidoDTO = (await import('../../src/dto/FiliacaoAssistidoDTO.js')).default;

describe('FiliacaoAssistidoDTO', () => {
  describe('constructor and toJSON', () => {
    it('deve transformar modelo para camelCase', () => {
      const filiacaoModel = {
        id: 1,
        assistido_id: 10,
        tipo: 'mae',
        nome_completo: 'Maria da Silva Santos',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      };

      const dto = new FiliacaoAssistidoDTO(filiacaoModel);
      const json = dto.toJSON();

      expect(json).toEqual({
        id: 1,
        tipo: 'mae',
        nomeCompleto: 'Maria da Silva Santos'
      });
    });
  });

  describe('toObject', () => {
    it('deve converter array para objeto {mae, pai}', () => {
      const filiacoes = [
        {
          tipo: 'mae',
          nome_completo: 'Maria da Silva'
        },
        {
          tipo: 'pai',
          nome_completo: 'João da Silva'
        }
      ];

      const obj = FiliacaoAssistidoDTO.toObject(filiacoes);

      expect(obj).toEqual({
        mae: 'Maria da Silva',
        pai: 'João da Silva'
      });
    });

    it('deve retornar apenas mae se pai não existe', () => {
      const filiacoes = [
        {
          tipo: 'mae',
          nome_completo: 'Maria da Silva'
        }
      ];

      const obj = FiliacaoAssistidoDTO.toObject(filiacoes);

      expect(obj).toEqual({
        mae: 'Maria da Silva',
        pai: null
      });
    });

    it('deve retornar apenas pai se mae não existe', () => {
      const filiacoes = [
        {
          tipo: 'pai',
          nome_completo: 'João da Silva'
        }
      ];

      const obj = FiliacaoAssistidoDTO.toObject(filiacoes);

      expect(obj).toEqual({
        mae: null,
        pai: 'João da Silva'
      });
    });

    it('deve retornar objeto com nulls se array vazio', () => {
      const obj = FiliacaoAssistidoDTO.toObject([]);

      expect(obj).toEqual({
        mae: null,
        pai: null
      });
    });

    it('deve retornar objeto com nulls se null', () => {
      const obj = FiliacaoAssistidoDTO.toObject(null);

      expect(obj).toEqual({
        mae: null,
        pai: null
      });
    });

    it('deve lidar com nomeCompleto em camelCase', () => {
      const filiacoes = [
        {
          tipo: 'mae',
          nomeCompleto: 'Maria da Silva'
        },
        {
          tipo: 'pai',
          nomeCompleto: 'João da Silva'
        }
      ];

      const obj = FiliacaoAssistidoDTO.toObject(filiacoes);

      expect(obj).toEqual({
        mae: 'Maria da Silva',
        pai: 'João da Silva'
      });
    });
  });

  describe('fromArray', () => {
    it('deve converter array de filiações para DTOs', () => {
      const filiacoes = [
        {
          id: 1,
          tipo: 'mae',
          nome_completo: 'Maria'
        },
        {
          id: 2,
          tipo: 'pai',
          nome_completo: 'João'
        }
      ];

      const dtos = FiliacaoAssistidoDTO.fromArray(filiacoes);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].tipo).toBe('mae');
      expect(dtos[0].nomeCompleto).toBe('Maria');
      expect(dtos[1].tipo).toBe('pai');
      expect(dtos[1].nomeCompleto).toBe('João');
    });

    it('deve retornar array vazio para null', () => {
      const dtos = FiliacaoAssistidoDTO.fromArray(null);
      expect(dtos).toEqual([]);
    });

    it('deve retornar array vazio para undefined', () => {
      const dtos = FiliacaoAssistidoDTO.fromArray(undefined);
      expect(dtos).toEqual([]);
    });

    it('deve retornar array vazio para array vazio', () => {
      const dtos = FiliacaoAssistidoDTO.fromArray([]);
      expect(dtos).toEqual([]);
    });
  });
});
