import { jest } from '@jest/globals';

const mockAlunoService = {
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
};

// Use unstable_mockModule and dynamic import so the mock is applied before module load in ESM
jest.unstable_mockModule('../../src/services/aluno.service.js', () => ({
  default: mockAlunoService
}));

const Controller = await import('../../src/controllers/aluno.controller.js');
const AlunoService = (await import('../../src/services/aluno.service.js')).default;

describe('AlunoController', () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      end: jest.fn(() => res)
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('criarAluno', () => {
    it('delega para AlunoService.create e retorna 201', async () => {
      const fakeAluno = { 
        id: 101, 
        nome: 'Aluno Test', 
        idade: 9, 
        responsaveis: [{ id: 1, nome: 'Resp' }]
      };
      
      mockAlunoService.create.mockResolvedValue(fakeAluno);
      
      req = { 
        body: { 
          nome: 'Aluno Test', 
          idade: 9, 
          responsaveisIds: [1] 
        } 
      };
      
      await Controller.criarAluno(req, res, next);

      expect(mockAlunoService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        dados: fakeAluno
      });
    });
  });

  describe('atualizarAluno', () => {
    it('delega para AlunoService.update e usa ok()', async () => {
      const fakeAluno = { 
        id: 202, 
        nome: 'Atualizado', 
        responsaveis: []
      };
      mockAlunoService.update.mockResolvedValue(fakeAluno);

      req = { params: { id: '202' }, body: { nome: 'Atualizado' } };
      
      await Controller.atualizarAluno(req, res, next);

      expect(mockAlunoService.update).toHaveBeenCalledWith('202', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        sucesso: true,
        dados: fakeAluno
      });
    });
  });

  describe('excluirAluno', () => {
    it('delega para AlunoService.remove e retorna 204', async () => {
      mockAlunoService.remove.mockResolvedValue();
      req = { params: { id: '303' } };
      
      await Controller.excluirAluno(req, res, next);

      expect(mockAlunoService.remove).toHaveBeenCalledWith('303');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
  });
});
