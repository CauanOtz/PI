import { validarCartaoSUS, formatarCartaoSUS } from '../../src/utils/validacoes.js';

describe('Validação de Cartão SUS', () => {
  describe('validarCartaoSUS', () => {
    test('deve validar cartões SUS válidos', () => {
      // Cartões definitivos (começam com 1 ou 2)
      expect(validarCartaoSUS('171066553900006')).toBe(true);
      expect(validarCartaoSUS('171 0665 5390 0006')).toBe(true);
      expect(validarCartaoSUS('171.0665.5390.0006')).toBe(true);
      
      // Cartões provisórios (começam com 7, 8 ou 9)
      expect(validarCartaoSUS('890790557420008')).toBe(true);
      expect(validarCartaoSUS('890 7905 5742 0008')).toBe(true);
      expect(validarCartaoSUS('890.7905.5742.0008')).toBe(true);
    });

    test('deve rejeitar cartões SUS inválidos', () => {
      expect(validarCartaoSUS('171066553900008')).toBe(false); // Dígito verificador errado
      expect(validarCartaoSUS('123456789012345')).toBe(false); // Número aleatório
      expect(validarCartaoSUS('511066553900009')).toBe(false); // Início inválido (5)
      expect(validarCartaoSUS('123456789')).toBe(false); // Tamanho incorreto
    });

    test('deve rejeitar valores não numéricos', () => {
      expect(validarCartaoSUS('abc123')).toBe(false);
      expect(validarCartaoSUS('')).toBe(false);
      expect(validarCartaoSUS(null)).toBe(false);
      expect(validarCartaoSUS(undefined)).toBe(false);
    });
  });

  describe('formatarCartaoSUS', () => {
    test('deve formatar cartões SUS válidos', () => {
      expect(formatarCartaoSUS('171066553900006')).toBe('171.0665.5390.0006');
      expect(formatarCartaoSUS('171 0665 5390 0006')).toBe('171.0665.5390.0006');
      expect(formatarCartaoSUS('890790557420008')).toBe('890.7905.5742.0008');
      expect(formatarCartaoSUS('890 7905 5742 0008')).toBe('890.7905.5742.0008');
    });

    test('deve retornar string vazia para cartões inválidos', () => {
      expect(formatarCartaoSUS('171066553900008')).toBe(''); // DV inválido
      expect(formatarCartaoSUS('123456789')).toBe(''); // Tamanho incorreto
      expect(formatarCartaoSUS('abcdefghijklmno')).toBe(''); // Não numérico
      expect(formatarCartaoSUS('')).toBe('');
      expect(formatarCartaoSUS(null)).toBe('');
      expect(formatarCartaoSUS(undefined)).toBe('');
    });
  });
});