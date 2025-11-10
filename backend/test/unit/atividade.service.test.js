import { jest } from '@jest/globals';

const mockAtividade = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn(),
};

jest.unstable_mockModule('../../src/models/Atividade.model.js', () => ({ default: mockAtividade }));
jest.unstable_mockModule('../../src/config/database.js', () => ({ sequelize: mockSequelize }));

const Atividade = (await import('../../src/models/Atividade.model.js')).default;
const { sequelize } = await import('../../src/config/database.js');
const AtividadeService = (await import('../../src/services/atividade.service.js')).default;

describe('AtividadeService', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = { commit: jest.fn().mockResolvedValue(undefined), rollback: jest.fn().mockResolvedValue(undefined) };
    mockSequelize.transaction.mockImplementation(async (cb) => {
      if (cb) return cb(mockTransaction);
      return mockTransaction;
    });

    mockAtividade.findAll.mockReset();
    mockAtividade.findByPk.mockReset();
    mockAtividade.create.mockReset();
  });

  afterEach(() => jest.clearAllMocks());

  it('listAll returns atividades', async () => {
    const fake = [{ id: 1, titulo: 'A' }, { id: 2, titulo: 'B' }];
    mockAtividade.findAll.mockResolvedValue(fake);
    const res = await AtividadeService.listAll();
    expect(res).toBe(fake);
    expect(mockAtividade.findAll).toHaveBeenCalled();
  });

  it('getById throws 400 for invalid id', async () => {
    await expect(AtividadeService.getById('abc')).rejects.toHaveProperty('status', 400);
  });

  it('getById throws 404 when not found', async () => {
    mockAtividade.findByPk.mockResolvedValue(null);
    await expect(AtividadeService.getById(999)).rejects.toHaveProperty('status', 404);
  });

  it('create creates atividade and commits', async () => {
    const body = { titulo: 'X', data: '2025-01-01', horario: '10:00:00', descricao: 'd' };
    const created = { id: 5, ...body };
    mockAtividade.create.mockResolvedValue(created);
    const res = await AtividadeService.create(body);
    expect(res).toBe(created);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('update returns null when not found and commits', async () => {
    mockAtividade.findByPk.mockResolvedValue(null);
    const res = await AtividadeService.update(999, { titulo: 'x' });
    expect(res).toBeNull();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('update updates atividade and commits', async () => {
    const atividade = { id: 10, update: jest.fn().mockResolvedValue(undefined) };
    mockAtividade.findByPk.mockResolvedValue(atividade);
    const res = await AtividadeService.update(10, { titulo: 'novo' });
    expect(atividade.update).toHaveBeenCalledWith({ titulo: 'novo', data: undefined, horario: undefined, descricao: undefined }, { transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(res).toBe(atividade);
  });

  it('remove returns null when not found and commits', async () => {
    mockAtividade.findByPk.mockResolvedValue(null);
    const res = await AtividadeService.remove(999);
    expect(res).toBeNull();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('remove destroys and returns true', async () => {
    const atividade = { id: 20, destroy: jest.fn().mockResolvedValue(undefined) };
    mockAtividade.findByPk.mockResolvedValue(atividade);
    const res = await AtividadeService.remove(20);
    expect(atividade.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(res).toBe(true);
  });
});