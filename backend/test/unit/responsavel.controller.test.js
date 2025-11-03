import { jest } from '@jest/globals';

const mockResponsavelService = {
  listarAlunos: jest.fn()
};

jest.unstable_mockModule('../../src/services/responsavel.service.js', () => ({
  default: mockResponsavelService
}));

const { listarAlunosPorResponsavel } = await import('../../src/controllers/responsavel.controller.js');

describe('ResponsavelController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { responsavelId: '1' },
      query: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('listarAlunosPorResponsavel', () => {
    test('deve retornar 404 quando responsável não existe', async () => {
      mockResponsavelService.listarAlunos.mockResolvedValue({ notFound: true });

      await listarAlunosPorResponsavel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: false,
        mensagem: 'Responsável não encontrado'
      });
    });

    test('deve retornar lista de alunos com sucesso', async () => {
      const mockResult = {
        alunos: [
          { id: 1, nome: 'Aluno 1' },
          { id: 2, nome: 'Aluno 2' }
        ],
        pagination: {
          total: 2,
          page: 1,
          totalPages: 1,
          limit: 10
        }
      };

      mockResponsavelService.listarAlunos.mockResolvedValue(mockResult);

      await listarAlunosPorResponsavel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        dados: {
          alunos: expect.any(Array),
          paginacao: expect.any(Object)
        }
      });
    });

    test('deve chamar next com erro em caso de exceção', async () => {
      const error = new Error('Erro de teste');
      mockResponsavelService.listarAlunos.mockRejectedValue(error);

      await listarAlunosPorResponsavel(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
