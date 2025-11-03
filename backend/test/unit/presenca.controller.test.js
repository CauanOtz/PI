import { jest } from '@jest/globals';

const mockPresencaService = {
  registrarPresenca: jest.fn(),
  listAll: jest.fn(),
  listByAula: jest.fn(),
  listByAluno: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  bulkRegister: jest.fn()
};

jest.unstable_mockModule('../../src/services/presenca.service.js', () => ({ default: mockPresencaService }));
// Mock DTO to return predictable plain objects
jest.unstable_mockModule('../../src/dto/index.js', () => ({
  PresencaDTO: {
    from: (m) => ({ id: m && m.id, dto: true }),
    list: (arr) => Array.isArray(arr) ? arr.map((m) => ({ id: m && m.id, dto: true })) : []
  }
}));

const Controller = await import('../../src/controllers/presenca.controller.js');
const PresencaService = (await import('../../src/services/presenca.service.js')).default;
const { PresencaDTO } = await import('../../src/dto/index.js');

describe('PresencaController', () => {
  let req, res, next;

  beforeEach(() => {
    res = { status: jest.fn(() => res), json: jest.fn(() => res), end: jest.fn(() => res) };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('registrarPresenca', () => {
    it('creates presence and returns 201', async () => {
      const pres = { id: 1 };
      mockPresencaService.registrarPresenca.mockResolvedValue({ presenca: pres, created: true });
      req = { body: { idAluno: 1, idAula: 2, status: 'presente' } };
      await Controller.registrarPresenca(req, res, next);
      expect(PresencaService.registrarPresenca).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: PresencaDTO.from(pres) });
    });

    it('returns 409 when already exists', async () => {
      const pres = { id: 2 };
      mockPresencaService.registrarPresenca.mockResolvedValue({ presenca: pres, created: false });
      req = { body: { idAluno: 1, idAula: 2, status: 'presente' } };
      await Controller.registrarPresenca(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ erros: [{ mensagem: 'Já existe um registro de presença para este aluno nesta data' }] });
    });
  });

  describe('listarPresencas', () => {
    it('returns list of presencas', async () => {
      const arr = [{ id: 11 }];
      mockPresencaService.listAll.mockResolvedValue(arr);
      req = { query: {} };
      await Controller.listarPresencas(req, res, next);
      expect(PresencaService.listAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: { presencas: PresencaDTO.list(arr) } });
    });
  });

  describe('listarPresencasPorAula', () => {
    it('returns 404 when aula not found', async () => {
      mockPresencaService.listByAula.mockResolvedValue(null);
      req = { params: { idAula: '99' }, query: {} };
      await Controller.listarPresencasPorAula(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erros: [{ mensagem: 'Aula não encontrado(a)' }] });
    });

    it('returns presencas for aula', async () => {
      const aula = { id: 5, titulo: 'A' };
      const pres = [{ id: 21 }];
      mockPresencaService.listByAula.mockResolvedValue({ aula, presencas: pres });
      req = { params: { idAula: '5' }, query: {} };
      await Controller.listarPresencasPorAula(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: { aula: { id: aula.id, titulo: aula.titulo, data: aula.data }, presencas: PresencaDTO.list(pres) } });
    });
  });

  describe('listarHistoricoAluno', () => {
    it('returns 404 when aluno not found', async () => {
      mockPresencaService.listByAluno.mockResolvedValue(null);
      req = { params: { idAluno: '7' }, query: {} };
      await Controller.listarHistoricoAluno(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erros: [{ mensagem: 'Aluno não encontrado(a)' }] });
    });

    it('returns historico when found', async () => {
      const aluno = { id: 7, nome: 'Joao' };
      const pres = [{ id: 31 }];
      mockPresencaService.listByAluno.mockResolvedValue({ aluno, presencas: pres });
      req = { params: { idAluno: '7' }, query: {} };
      await Controller.listarHistoricoAluno(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: { aluno: { id: aluno.id, nome: aluno.nome, matricula: aluno.id }, historico: PresencaDTO.list(pres) } });
    });
  });

  describe('obterPresenca', () => {
    it('returns 404 when not found', async () => {
      mockPresencaService.getById.mockResolvedValue(null);
      req = { params: { id: '99' } };
      await Controller.obterPresenca(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erros: [{ mensagem: 'Registro de presença não encontrado(a)' }] });
    });

    it('returns presenca when found', async () => {
      const pres = { id: 40 };
      mockPresencaService.getById.mockResolvedValue(pres);
      req = { params: { id: '40' } };
      await Controller.obterPresenca(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: PresencaDTO.from(pres) });
    });
  });

  describe('atualizarPresenca', () => {
    it('returns 404 when not found', async () => {
      mockPresencaService.update.mockResolvedValue(null);
      req = { params: { id: '99' }, body: {} };
      await Controller.atualizarPresenca(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erros: [{ mensagem: 'Registro de presença não encontrado(a)' }] });
    });

    it('returns 409 on conflict', async () => {
      mockPresencaService.update.mockResolvedValue({ conflict: true });
      req = { params: { id: '10' }, body: { data_registro: '2025-01-01' } };
      await Controller.atualizarPresenca(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Já existe presença para este aluno nesta aula e data' });
    });

    it('updates and returns presenca', async () => {
      const pres = { id: 50 };
      mockPresencaService.update.mockResolvedValue(pres);
      req = { params: { id: '50' }, body: { status: 'atraso' } };
      await Controller.atualizarPresenca(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: PresencaDTO.from(pres) });
    });
  });

  describe('registrarPresencasBulk', () => {
    it('returns 400 when no items', async () => {
      req = { body: [] };
      await Controller.registrarPresencasBulk(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('bulk registers and returns results', async () => {
      const items = [{ idAluno:1, idAula:2, status:'presente', data_registro:'2025-01-01' }];
      const pres = { id: 60 };
      mockPresencaService.bulkRegister.mockResolvedValue([{ presenca: pres }]);
      req = { body: items };
      await Controller.registrarPresencasBulk(req, res, next);
      expect(PresencaService.bulkRegister).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: { resultados: [{ presenca: PresencaDTO.from(pres) }] } });
    });
  });
});
