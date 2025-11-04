import { jest } from '@jest/globals';

const mockAulaService = {
  listAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  getById: jest.fn(),
  remove: jest.fn()
};

// Ensure mock is installed before modules are imported (ESM)
jest.unstable_mockModule('../../src/services/aula.service.js', () => ({ default: mockAulaService }));
// Mock DTO to return predictable plain objects for assertions
jest.unstable_mockModule('../../src/dto/index.js', () => ({
  AulaDTO: {
    from: (m) => ({ id: m.id, titulo: m.titulo, dto: true }),
    list: (arr) => Array.isArray(arr) ? arr.map((m) => ({ id: m.id, titulo: m.titulo, dto: true })) : []
  }
}));

const Controller = await import('../../src/controllers/aula.controller.js');
const AulaService = (await import('../../src/services/aula.service.js')).default;
const { AulaDTO } = await import('../../src/dto/index.js');

describe('AulaController', () => {
  let req, res, next;

  beforeEach(() => {
    res = { status: jest.fn(() => res), json: jest.fn(() => res), end: jest.fn(() => res) };
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => jest.clearAllMocks());

  describe('listarAulas', () => {
    it('delegates to AulaService.listAll and returns 200', async () => {
      const fake = [{ id: 1, titulo: 'A' }];
      mockAulaService.listAll.mockResolvedValue(fake);
      req = {};
      await Controller.listarAulas(req, res, next);
      expect(mockAulaService.listAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: { aulas: [AulaDTO.from(fake[0])] } });
    });
  });

  describe('criarAula', () => {
    it('delegates to AulaService.create and returns 201', async () => {
      const payload = { titulo: 'T', data: '2025-01-01', horario: '10:00:00', descricao: 'd' };
      const created = { id: 5, ...payload };
      mockAulaService.create.mockResolvedValue(created);
      req = { body: payload };
      await Controller.criarAula(req, res, next);
      expect(mockAulaService.create).toHaveBeenCalledWith(payload);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: AulaDTO.from(created) });
    });
  });

  describe('atualizarAula', () => {
    it('delegates to AulaService.update and returns 200', async () => {
      const updated = { id: 10, titulo: 'Novo' };
      mockAulaService.update.mockResolvedValue(updated);
      req = { params: { id: '10' }, body: { titulo: 'Novo' } };
      await Controller.atualizarAula(req, res, next);
      expect(AulaService.update).toHaveBeenCalledWith('10', { titulo: 'Novo', data: undefined, horario: undefined, descricao: undefined });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: AulaDTO.from(updated) });
    });

    it('returns 404 when service returns null', async () => {
      mockAulaService.update.mockResolvedValue(null);
      req = { params: { id: '99' }, body: { titulo: 'X' } };
      await Controller.atualizarAula(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Aula não encontrada.' });
    });
  });

  describe('getAulaPorId', () => {
    it('delegates to AulaService.getById and returns 200', async () => {
      const found = { id: 7, titulo: 'Found' };
      mockAulaService.getById.mockResolvedValue(found);
      req = { params: { id: '7' } };
      await Controller.getAulaPorId(req, res, next);
      expect(AulaService.getById).toHaveBeenCalledWith('7');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: AulaDTO.from(found) });
    });
  });

  describe('excluirAula', () => {
    it('delegates to AulaService.remove and returns 204', async () => {
      mockAulaService.remove.mockResolvedValue(true);
      req = { params: { id: '20' } };
      await Controller.excluirAula(req, res, next);
      expect(mockAulaService.remove).toHaveBeenCalledWith('20');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('returns 404 when not found', async () => {
      mockAulaService.remove.mockResolvedValue(null);
      req = { params: { id: '999' } };
      await Controller.excluirAula(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Aula não encontrada.' });
    });
  });
});
