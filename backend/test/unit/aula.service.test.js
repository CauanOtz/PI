import { jest } from '@jest/globals';

const mockAula = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn(),
};

jest.unstable_mockModule('../../src/models/Aula.model.js', () => ({ default: mockAula }));
jest.unstable_mockModule('../../src/config/database.js', () => ({ sequelize: mockSequelize }));

const Aula = (await import('../../src/models/Aula.model.js')).default;
const { sequelize } = await import('../../src/config/database.js');
const AulaService = (await import('../../src/services/aula.service.js')).default;

describe('AulaService', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = { commit: jest.fn().mockResolvedValue(undefined), rollback: jest.fn().mockResolvedValue(undefined) };
    mockSequelize.transaction.mockImplementation(async (cb) => {
      if (cb) return cb(mockTransaction);
      return mockTransaction;
    });

    mockAula.findAll.mockReset();
    mockAula.findByPk.mockReset();
    mockAula.create.mockReset();
  });

  afterEach(() => jest.clearAllMocks());

  it('listAll returns aulas', async () => {
    const fake = [{ id: 1, titulo: 'A' }, { id: 2, titulo: 'B' }];
    mockAula.findAll.mockResolvedValue(fake);
    const res = await AulaService.listAll();
    expect(res).toBe(fake);
    expect(mockAula.findAll).toHaveBeenCalled();
  });

  it('getById throws 400 for invalid id', async () => {
    await expect(AulaService.getById('abc')).rejects.toHaveProperty('status', 400);
  });

  it('getById throws 404 when not found', async () => {
    mockAula.findByPk.mockResolvedValue(null);
    await expect(AulaService.getById(999)).rejects.toHaveProperty('status', 404);
  });

  it('create creates aula and commits', async () => {
    const body = { titulo: 'X', data: '2025-01-01', horario: '10:00:00', descricao: 'd' };
    const created = { id: 5, ...body };
    mockAula.create.mockResolvedValue(created);
    const res = await AulaService.create(body);
    expect(res).toBe(created);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('update returns null when not found and commits', async () => {
    mockAula.findByPk.mockResolvedValue(null);
    const res = await AulaService.update(999, { titulo: 'x' });
    expect(res).toBeNull();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('update updates aula and commits', async () => {
    const aula = { id: 10, update: jest.fn().mockResolvedValue(undefined) };
    mockAula.findByPk.mockResolvedValue(aula);
    const res = await AulaService.update(10, { titulo: 'novo' });
    expect(aula.update).toHaveBeenCalledWith({ titulo: 'novo', data: undefined, horario: undefined, descricao: undefined }, { transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(res).toBe(aula);
  });

  it('remove returns null when not found and commits', async () => {
    mockAula.findByPk.mockResolvedValue(null);
    const res = await AulaService.remove(999);
    expect(res).toBeNull();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('remove destroys and returns true', async () => {
    const aula = { id: 20, destroy: jest.fn().mockResolvedValue(undefined) };
    mockAula.findByPk.mockResolvedValue(aula);
    const res = await AulaService.remove(20);
    expect(aula.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(res).toBe(true);
  });
});
