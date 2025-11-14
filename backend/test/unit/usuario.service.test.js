import { jest } from '@jest/globals';

const mockUsuario = {
  findOne: jest.fn(),
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  count: jest.fn(),
};

jest.unstable_mockModule('../../src/models/Usuario.model.js', () => ({ default: mockUsuario }));
jest.unstable_mockModule('../../src/utils/jwt.js', () => ({ signToken: () => 'signed-token' }));

const Usuario = (await import('../../src/models/Usuario.model.js')).default;
const UsuarioService = (await import('../../src/services/usuario.service.js')).default;

describe('UsuarioService', () => {
  afterEach(() => jest.clearAllMocks());

  it('create returns usuario and token when success', async () => {
    mockUsuario.findOne.mockResolvedValue(null);
    const created = { id: 1, nome: 'A' };
    mockUsuario.create.mockResolvedValue(created);
    const res = await UsuarioService.create({ nome: 'A', email: 'a@b.com', senha: 's', cpf: '85687118047' }, 'admin');
    expect(res.usuario).toBe(created);
    expect(res.token).toBe('signed-token');
  });

  it('create returns conflict when email/cpf exists', async () => {
    mockUsuario.findOne.mockResolvedValue({ id: 2 });
    const res = await UsuarioService.create({ nome: 'B', email: 'b@b.com', senha: 's', cpf: '85687118047' }, 'admin');
    expect(res.conflict).toBe(true);
  });

  it('list returns count and usuarios', async () => {
    mockUsuario.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ id: 1 }, { id: 2 }] });
    const res = await UsuarioService.list({ page: 1, limit: 10 });
    expect(res.count).toBe(2);
    expect(res.usuarios).toHaveLength(2);
  });

  it('getByCPF returns null for invalid cpf', async () => {
    const res = await UsuarioService.getByCPF('123');
    expect(res).toEqual({ invalidCpf: true });
  });

  it('updateByCPF returns null when not found', async () => {
    mockUsuario.findOne.mockResolvedValue(null);
    const res = await UsuarioService.updateByCPF('85687118047', { nome: 'X' });
    expect(res).toBeNull();
  });

  it('removeByCPF prevents self delete', async () => {
    const raw = '85687118047';
    const formatted = '856.871.180-47';
    const res = await UsuarioService.removeByCPF(raw, formatted);
    expect(res).toEqual({ selfDelete: true });
  });

  it('authenticate returns null when not found or wrong password', async () => {
    mockUsuario.findOne.mockResolvedValue(null);
    const res = await UsuarioService.authenticate('noone@x.com', 's');
    expect(res).toBeNull();
  });
});
