// test/unit/responsavel.service.test.js
import { jest } from '@jest/globals';

const mockUsuario = {
  findByPk: jest.fn()
};

const mockAluno = {
  findAndCountAll: jest.fn()
};

const mockResponsavelAluno = {
  findAndCountAll: jest.fn()
};

jest.unstable_mockModule('../../src/models/Usuario.model.js', () => ({
  default: mockUsuario
}));

jest.unstable_mockModule('../../src/models/Aluno.model.js', () => ({
  default: mockAluno
}));

jest.unstable_mockModule('../../src/models/ResponsavelAluno.model.js', () => ({
  default: mockResponsavelAluno
}));

const ResponsavelService = (await import('../../src/services/responsavel.service.js')).default;

describe('ResponsavelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarAlunos', () => {
    test('deve retornar notFound quando responsável não existe', async () => {
      mockUsuario.findByPk.mockResolvedValue(null);

      const result = await ResponsavelService.listarAlunos(1);

      expect(result).toEqual({ notFound: true });
      expect(mockUsuario.findByPk).toHaveBeenCalledWith(1);
      expect(mockAluno.findAndCountAll).not.toHaveBeenCalled();
    });

    test('deve retornar lista de alunos e paginação quando responsável existe', async () => {
      const mockResponsavel = { id: 1, nome: 'Responsável Teste' };
      const mockAlunos = {
        count: 2,
        rows: [
          { id: 1, nome: 'Aluno 1' },
          { id: 2, nome: 'Aluno 2' }
        ]
      };

      mockUsuario.findByPk.mockResolvedValue(mockResponsavel);
      mockAluno.findAndCountAll.mockResolvedValue(mockAlunos);

      const result = await ResponsavelService.listarAlunos(1, { page: 1, limit: 10 });

      expect(result).toEqual({
        alunos: mockAlunos.rows,
        pagination: {
          total: 2,
          page: 1,
          totalPages: 1,
          limit: 10
        }
      });

      expect(mockUsuario.findByPk).toHaveBeenCalledWith(1);
      expect(mockAluno.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: mockUsuario,
              where: { id: 1 }
            })
          ]),
          limit: 10,
          offset: 0
        })
      );
    });

    test('deve limitar a paginação conforme parâmetros', async () => {
      const mockResponsavel = { id: 1 };
      const mockAlunos = { count: 30, rows: [] };

      mockUsuario.findByPk.mockResolvedValue(mockResponsavel);
      mockAluno.findAndCountAll.mockResolvedValue(mockAlunos);

      const result = await ResponsavelService.listarAlunos(1, { page: 2, limit: 15 });

      expect(result.pagination).toEqual({
        total: 30,
        page: 2,
        totalPages: 2,
        limit: 15
      });

      expect(mockAluno.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 15,
          offset: 15
        })
      );
    });
  });
});