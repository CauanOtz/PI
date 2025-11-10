import { jest } from '@jest/globals';

const mockPresenca = {
  findOrCreate: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  upsert: jest.fn(),
};

const mockAssistido = { findByPk: jest.fn() };
const mockAtividade = { findByPk: jest.fn() };

const mockSequelize = { transaction: jest.fn() };

jest.unstable_mockModule('../../src/models/Presenca.model.js', () => ({ default: mockPresenca }));
jest.unstable_mockModule('../../src/models/Assistido.model.js', () => ({ default: mockAssistido }));
jest.unstable_mockModule('../../src/models/Atividade.model.js', () => ({ default: mockAtividade }));
jest.unstable_mockModule('../../src/config/database.js', () => ({ sequelize: mockSequelize }));

const Presenca = (await import('../../src/models/Presenca.model.js')).default;
const Assistido = (await import('../../src/models/Assistido.model.js')).default;
const Atividade = (await import('../../src/models/Atividade.model.js')).default;
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
    mockAssistido.findByPk.mockReset();
    mockAtividade.findByPk.mockReset();
  });

  afterEach(() => jest.clearAllMocks());

  it('registrarPresenca creates when not existing', async () => {
    const fake = { id: 1 };
    mockAssistido.findByPk.mockResolvedValue({ id: 1 });
    mockAtividade.findByPk.mockResolvedValue({ id: 2 });
    mockPresenca.findOrCreate.mockResolvedValue([fake, true]);
    const res = await PresencaService.registrarPresenca({ idAssistido: 1, idAtividade: 2, status: 'presente' });
    expect(res.presenca).toBe(fake);
    expect(res.created).toBe(true);
  });

  it('registrarPresenca returns created false when exists', async () => {
    const fake = { id: 2 };
    mockAssistido.findByPk.mockResolvedValue({ id: 1 });
    mockAtividade.findByPk.mockResolvedValue({ id: 2 });
    mockPresenca.findOrCreate.mockResolvedValue([fake, false]);
    const res = await PresencaService.registrarPresenca({ idAssistido: 1, idAtividade: 2, status: 'presente' });
    expect(res.presenca).toBe(fake);
    expect(res.created).toBe(false);
  });

  it('registrarPresenca returns notFound when assistido missing', async () => {
    mockAssistido.findByPk.mockResolvedValue(null);
    mockAtividade.findByPk.mockResolvedValue({ id: 2 });
    const res = await PresencaService.registrarPresenca({ idAssistido: 999, idAtividade: 2, status: 'presente' });
    expect(res).toEqual({ notFound: 'Assistido' });
  });

  it('registrarPresenca returns notFound when atividade missing', async () => {
    mockAssistido.findByPk.mockResolvedValue({ id: 1 });
    mockAtividade.findByPk.mockResolvedValue(null);
    const res = await PresencaService.registrarPresenca({ idAssistido: 1, idAtividade: 999, status: 'presente' });
    expect(res).toEqual({ notFound: 'Atividade' });
  });

  it('listAll returns array', async () => {
    const arr = [{ id: 1 }];
    mockPresenca.findAll.mockResolvedValue(arr);
    const res = await PresencaService.listAll({});
    expect(res).toBe(arr);
  });

  it('listByAtividade returns null when atividade not found', async () => {
    mockAtividade.findByPk.mockResolvedValue(null);
    const res = await PresencaService.listByAtividade(10, {});
    expect(res).toBeNull();
  });

  it('listByAtividade returns atividade and presencas', async () => {
    const atividade = { id: 10, titulo: 'A' };
    mockAtividade.findByPk.mockResolvedValue(atividade);
    mockPresenca.findAll.mockResolvedValue([{ id: 1 }]);
    const res = await PresencaService.listByAtividade(10, {});
    expect(res.atividade).toBe(atividade);
    expect(res.presencas).toBeInstanceOf(Array);
  });

  it('listByAssistido returns null when assistido not found', async () => {
    mockAssistido.findByPk.mockResolvedValue(null);
    const res = await PresencaService.listByAssistido(5, {});
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
    const pres = { id: 10, idAssistido: 1, idAtividade: 2, update: jest.fn(), reload: jest.fn() };
    mockPresenca.findByPk.mockResolvedValue(pres);
    mockPresenca.findOne.mockResolvedValue({ id: 11 });
    const res = await PresencaService.update(10, { data_registro: '2025-01-01' });
    expect(res).toEqual({ conflict: true });
  });

  it('update updates and returns presenca', async () => {
    const pres = { id: 20, idAssistido: 1, idAtividade: 2, update: jest.fn().mockResolvedValue(undefined), reload: jest.fn().mockResolvedValue(undefined) };
    mockPresenca.findByPk.mockResolvedValue(pres);
    mockPresenca.findOne.mockResolvedValue(null);
    const res = await PresencaService.update(20, { status: 'atraso' });
    expect(pres.update).toHaveBeenCalled();
    expect(res).toBe(pres);
  });

  it('bulkRegister upserts and returns results', async () => {
    const items = [{ idAssistido:1, idAtividade:2, status:'presente', data_registro:'2025-01-01', observacao:null }];
    mockAssistido.findByPk.mockResolvedValue({ id: 1 });
    mockAtividade.findByPk.mockResolvedValue({ id: 2 });
    mockPresenca.upsert.mockResolvedValue(undefined);
    mockPresenca.findOne.mockResolvedValue({ id: 50 });
    const res = await PresencaService.bulkRegister(items);
    expect(res).toHaveLength(1);
    expect(mockPresenca.upsert).toHaveBeenCalled();
  });

  it('bulkRegister returns error entry when assistido missing', async () => {
    const items = [{ idAssistido:999, idAtividade:2, status:'presente', data_registro:'2025-01-01', observacao:null }];
    mockAssistido.findByPk.mockResolvedValue(null);
    const res = await PresencaService.bulkRegister(items);
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({ presenca: null, error: 'Assistido' });
  });

  it('bulkRegister returns error entry when atividade missing', async () => {
    const items = [{ idAssistido:1, idAtividade:999, status:'presente', data_registro:'2025-01-01', observacao:null }];
    mockAssistido.findByPk.mockResolvedValue({ id: 1 });
    mockAtividade.findByPk.mockResolvedValue(null);
    const res = await PresencaService.bulkRegister(items);
    expect(res).toHaveLength(1);
    expect(res[0]).toEqual({ presenca: null, error: 'Atividade' });
  });
});
