import { jest } from '@jest/globals';

const ContatoAssistidoDTO = (await import('../../src/dto/ContatoAssistidoDTO.js')).default;

describe('ContatoAssistidoDTO', () => {
  describe('constructor and toJSON', () => {
    it('deve transformar modelo para camelCase', () => {
      const contatoModel = {
        id: 1,
        assistido_id: 10,
        telefone: '(11) 98765-4321',
        nome_contato: 'Maria da Silva',
        parentesco: 'Mãe',
        observacao: 'Ligar após 18h',
        ordem_prioridade: 1,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z'
      };

      const dto = new ContatoAssistidoDTO(contatoModel);
      const json = dto.toJSON();

      expect(json).toEqual({
        id: 1,
        telefone: '(11) 98765-4321',
        nomeContato: 'Maria da Silva',
        parentesco: 'Mãe',
        observacao: 'Ligar após 18h',
        ordemPrioridade: 1
      });
    });

    it('deve lidar com valores null', () => {
      const contatoModel = {
        id: 1,
        assistido_id: 10,
        telefone: '(11) 98765-4321',
        nome_contato: null,
        parentesco: null,
        observacao: null,
        ordem_prioridade: 1
      };

      const dto = new ContatoAssistidoDTO(contatoModel);
      const json = dto.toJSON();

      expect(json.nomeContato).toBeNull();
      expect(json.parentesco).toBeNull();
      expect(json.observacao).toBeNull();
    });
  });

  describe('fromArray', () => {
    it('deve converter array de contatos para DTOs', () => {
      const contatos = [
        {
          id: 1,
          telefone: '(11) 98765-4321',
          nome_contato: 'Maria',
          ordem_prioridade: 1
        },
        {
          id: 2,
          telefone: '(11) 91234-5678',
          nome_contato: 'João',
          ordem_prioridade: 2
        }
      ];

      const dtos = ContatoAssistidoDTO.fromArray(contatos);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].telefone).toBe('(11) 98765-4321');
      expect(dtos[1].telefone).toBe('(11) 91234-5678');
    });

    it('deve retornar array vazio para null', () => {
      const dtos = ContatoAssistidoDTO.fromArray(null);
      expect(dtos).toEqual([]);
    });

    it('deve retornar array vazio para undefined', () => {
      const dtos = ContatoAssistidoDTO.fromArray(undefined);
      expect(dtos).toEqual([]);
    });

    it('deve retornar array vazio para array vazio', () => {
      const dtos = ContatoAssistidoDTO.fromArray([]);
      expect(dtos).toEqual([]);
    });
  });
});
