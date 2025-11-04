import { jest } from '@jest/globals';

const mockPresenca = {
  findOrCreate: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  upsert: jest.fn(),
};

const mockAluno = { findByPk: jest.fn() };
const mockAula = { findByPk: jest.fn() };

const mockSequelize = { transaction: jest.fn() };

jest.unstable_mockModule('../../src/models/Presenca.model.js', () => ({ default: mockPresenca }));
jest.unstable_mockModule('../../src/models/Aluno.model.js', () => ({ default: mockAluno }));
jest.unstable_mockModule('../../src/models/Aula.model.js', () => ({ default: mockAula }));
jest.unstable_mockModule('../../src/config/database.js', () => ({ sequelize: mockSequelize }));

const Presenca = (await import('../../src/models/Presenca.model.js')).default;
const Aluno = (await import('../../src/models/Aluno.model.js')).default;
const Aula = (await import('../../src/models/Aula.model.js')).default;
const { sequelize } = await import('../../src/config/database.js');
const PresencaService = (await import('../../src/services/presenca.service.js')).default;

describe('PresencaService', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = { commit: jest.fn().mockResolvedValue(undefined), rollback: jest.fn().mockResolvedValue(undefined) };
    mockSequelize.transaction.mockImplementation(async (cb) => {
      if (cb) return cb(mockTransaction);
      return mockTransaction;
    });

    mockPresenca.findOrCreate.mockReset();
    mockPresenca.findAll.mockReset();
    mockPresenca.findByPk.mockReset();
    mockPresenca.findOne.mockReset();
    mockPresenca.upsert.mockReset();
    mockAluno.findByPk.mockReset();
    mockAula.findByPk.mockReset();
  });

  afterEach(() => jest.clearAllMocks());

  it('registrarPresenca creates when not existing', async () => {
    const fake = { id: 1 };
    mockAluno.findByPk.mockResolvedValue({ id: 1 });
    mockAula.findByPk.mockResolvedValue({ id: 2 });
    mockPresenca.findOrCreate.mockResolvedValue([fake, true]);
    const res = await PresencaService.registrarPresenca({ idAluno: 1, idAula: 2, status: 'presente' });
    expect(res.presenca).toBe(fake);
    expect(res.created).toBe(true);
  });

  it('registrarPresenca returns created false when exists', async () => {
    const fake = { id: 2 };
    mockAluno.findByPk.mockResolvedValue({ id: 1 });
    mockAula.findByPk.mockResolvedValue({ id: 2 });
    mockPresenca.findOrCreate.mockResolvedValue([fake, false]);
    const res = await PresencaService.registrarPresenca({ idAluno: 1, idAula: 2, status: 'presente' });
    expect(res.presenca).toBe(fake);
    expect(res.created).toBe(false);
  });

  it('registrarPresenca returns notFound when aluno missing', async () => {
    mockAluno.findByPk.mockResolvedValue(null);
    mockAula.findByPk.mockResolvedValue({ id: 2 });
    const res = await PresencaService.registrarPresenca({ idAluno: 999, idAula: 2, status: 'presente' });
    expect(res).toEqual({ notFound: 'Aluno' });
  });

  it('registrarPresenca returns notFound when aula missing', async () => {
    mockAluno.findByPk.mockResolvedValue({ id: 1 });
    mockAula.findByPk.mockResolvedValue(null);
    const res = await PresencaService.registrarPresenca({ idAluno: 1, idAula: 999, status: 'presente' });
    expect(res).toEqual({ notFound: 'Aula' });
  });

  it('listAll returns array', async () => {
    const arr = [{ id: 1 }];
    mockPresenca.findAll.mockResolvedValue(arr);
    const res = await PresencaService.listAll({});
    expect(res).toBe(arr);
  });

  it('listByAula returns null when aula not found', async () => {
    mockAula.findByPk.mockResolvedValue(null);
    const res = await PresencaService.listByAula(10, {});
    expect(res).toBeNull();
  });

  it('listByAula returns aula and presencas', async () => {
    const aula = { id: 10, titulo: 'A' };
    mockAula.findByPk.mockResolvedValue(aula);
    mockPresenca.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await PresencaService.listByAula(10, {});
    expect(res.aula).toBe(aula);
    expect(res.presencas).toBeInstanceOf(Array);
  });

  it('listByAluno returns null when aluno not found', async () => {
    mockAluno.findByPk.mockResolvedValue(null);
    const res = await PresencaService.listByAluno(5, {});
    expect(res).toBeNull();
  });

  it('getById returns null when not found', async () => {
    mockPresenca.findByPk.mockResolvedValue(null);
    const res = await PresencaService.getById(999);
    expect(res).toBeNull();
  });

  it('update returns null when not found', async () => {
    mockPresenca.findByPk.mockResolvedValue(null);
    const res = await PresencaService.update(99, { status: 'falta' });
    expect(res).toBeNull();
  });

  it('update returns conflict when colisao found', async () => {
    const pres = { id: 10, idAluno: 1, idAula: 2, update: jest.fn(), reload: jest.fn() };
    mockPresenca.findByPk.mockResolvedValue(pres);
    mockPresenca.findOne.mockResolvedValue({ id: 11 });
    const res = await PresencaService.update(10, { data_registro: '2025-01-01' });
    expect(res).toEqual({ conflict: true });
  });

  it('update updates and returns presenca', async () => {
    const pres = { id: 20, idAluno: 1, idAula: 2, update: jest.fn().mockResolvedValue(undefined), reload: jest.fn().mockResolvedValue(undefined) };
    mockPresenca.findByPk.mockResolvedValue(pres);
    mockPresenca.findOne.mockResolvedValue(null);
    const res = await PresencaService.update(20, { status: 'atraso' });
    expect(pres.update).toHaveBeenCalled();
    expect(res).toBe(pres);
  });

  it('bulkRegister upserts and returns results', async () => {
    const items = [{ idAluno:1, idAula:2, status:'presente', data_registro:'2025-01-01', observacao:null }];
    mockAluno.findByPk.mockResolvedValue({ id: 1 });
    mockAula.findByPk.mockResolvedValue({ id: 2 });
    mockPresenca.upsert.mockResolvedValue(undefined);
    mockPresenca.findOne.mockResolvedValue({ id: 50 });
    const res = await PresencaService.bulkRegister(items);
    expect(res).toHaveLength(1);
    expect(mockPresenca.upsert).toHaveBeenCalled();
  });

  it('bulkRegister returns error entry when aluno missing', async () => {
    const items = [{ idAluno:999, idAula:2, status:'presente', data_registro:'2025-01-01', observacao:null }];
    mockAluno.findByPk.mockResolvedValue(null);
    const res = await PresencaService.bulkRegister(items);
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({ presenca: null, error: 'Aluno' });
  });

  it('bulkRegister returns error entry when aula missing', async () => {
    const items = [{ idAluno:1, idAula:999, status:'presente', data_registro:'2025-01-01', observacao:null }];
    mockAluno.findByPk.mockResolvedValue({ id: 1 });
    mockAula.findByPk.mockResolvedValue(null);
    const res = await PresencaService.bulkRegister(items);
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({ presenca: null, error: 'Aula' });
  });
});
