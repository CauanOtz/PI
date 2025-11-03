import { jest } from '@jest/globals';

const mockResponsavelAlunoService = {
  vincular: jest.fn(),
  desvincular: jest.fn()
};

jest.unstable_mockModule('../../src/services/responsavel-aluno.service.js', () => ({
  default: mockResponsavelAlunoService
}));

const { vincularResponsavel, desvincularResponsavel } = await import('../../src/controllers/responsavel-aluno.controller.js');

describe('ResponsavelAlunoController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('vincularResponsavel', () => {
    test('deve retornar 404 quando responsável ou aluno não existe', async () => {
      req.body = { idUsuario: 1, idAluno: 1 };
      mockResponsavelAlunoService.vincular.mockResolvedValue({ 
        notFound: true, 
        message: 'Responsável não encontrado' 
      });

      await vincularResponsavel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        mensagem: 'Responsável não encontrado' 
      });
    });

    test('deve retornar 409 quando vínculo já existe', async () => {
      req.body = { idUsuario: 1, idAluno: 1 };
      mockResponsavelAlunoService.vincular.mockResolvedValue({ 
        conflict: true, 
        message: 'Este responsável já está vinculado a este aluno' 
      });

      await vincularResponsavel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ 
        mensagem: 'Este responsável já está vinculado a este aluno' 
      });
    });

    test('deve retornar 201 quando vínculo é criado com sucesso', async () => {
      req.body = { idUsuario: 1, idAluno: 1 };
      mockResponsavelAlunoService.vincular.mockResolvedValue({ vinculo: { id: 1 } });

      await vincularResponsavel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ 
        sucesso: true,
        dados: { mensagem: 'Responsável vinculado com sucesso' }
      });
    });

    test('deve chamar next com erro em caso de exceção', async () => {
      req.body = { idUsuario: 1, idAluno: 1 };
      const error = new Error('Erro de teste');
      mockResponsavelAlunoService.vincular.mockRejectedValue(error);

      await vincularResponsavel(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('desvincularResponsavel', () => {
    test('deve retornar 404 quando vínculo não existe', async () => {
      req.params = { idUsuario: '1', idAluno: '1' };
      mockResponsavelAlunoService.desvincular.mockResolvedValue({ 
        notFound: true, 
        message: 'Vínculo não encontrado' 
      });

      await desvincularResponsavel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        mensagem: 'Vínculo não encontrado' 
      });
    });

    test('deve retornar 200 quando vínculo é removido com sucesso', async () => {
      req.params = { idUsuario: '1', idAluno: '1' };
      mockResponsavelAlunoService.desvincular.mockResolvedValue({ success: true });

      await desvincularResponsavel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        sucesso: true,
        dados: { mensagem: 'Responsável desvinculado com sucesso' }
      });
    });

    test('deve chamar next com erro em caso de exceção', async () => {
      req.params = { idUsuario: '1', idAluno: '1' };
      const error = new Error('Erro de teste');
      mockResponsavelAlunoService.desvincular.mockRejectedValue(error);

      await desvincularResponsavel(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
