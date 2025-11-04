import { jest } from '@jest/globals';

const mockUsuarioService = {
  create: jest.fn(),
  list: jest.fn(),
  getByCPF: jest.fn(),
  getById: jest.fn(),
  updateByCPF: jest.fn(),
  removeByCPF: jest.fn(),
  authenticate: jest.fn()
};

jest.unstable_mockModule('../../src/services/usuario.service.js', () => ({ default: mockUsuarioService }));
jest.unstable_mockModule('../../src/dto/index.js', () => ({
  UsuarioDTO: {
    from: (m) => ({ id: m && m.id, dto: true }),
    list: (arr) => Array.isArray(arr) ? arr.map(m => ({ id: m && m.id, dto: true })) : []
  },
  PaginationDTO: class { constructor(opts){ this.total = opts.total; this.paginaAtual = opts.paginaAtual; this.totalPaginas = opts.totalPaginas; this.itensPorPagina = opts.itensPorPagina } }
}));

const Controller = await import('../../src/controllers/usuario.controller.js');
const UsuarioService = (await import('../../src/services/usuario.service.js')).default;
const { UsuarioDTO } = await import('../../src/dto/index.js');

describe('UsuarioController', () => {
  let req, res, next;
  beforeEach(() => {
    res = { status: jest.fn(() => res), json: jest.fn(() => res) };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('registrarUsuario', () => {
    it('creates and returns 201', async () => {
      const user = { id: 1 };
      mockUsuarioService.create.mockResolvedValue({ usuario: user, token: 'tok' });
      req = { body: { nome: 'A' }, usuario: { role: 'admin' } };
      await Controller.registrarUsuario(req, res, next);
      expect(UsuarioService.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ sucesso: true, dados: { usuario: UsuarioDTO.from(user), token: 'tok' } });
    });

    it('returns 409 on conflict', async () => {
      mockUsuarioService.create.mockResolvedValue({ conflict: true });
      req = { body: {}, usuario: { role: 'admin' } };
      await Controller.registrarUsuario(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('listarUsuarios', () => {
    it('returns paginated users', async () => {
      mockUsuarioService.list.mockResolvedValue({ count: 2, usuarios: [{ id: 1 }, { id: 2 }], page:1, limit:10 });
      req = { query: {} };
      await Controller.listarUsuarios(req, res, next);
      expect(UsuarioService.list).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('obterMeusDados', () => {
    it('returns 404 when not found', async () => {
      mockUsuarioService.getById.mockResolvedValue(null);
      req = { usuario: { id: 9 } };
      await Controller.obterMeusDados(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('login', () => {
    it('returns 401 when invalid', async () => {
      mockUsuarioService.authenticate.mockResolvedValue(null);
      req = { body: { email: 'a@b', senha: 'x' } };
      await Controller.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('buscarPorCPF', () => {
    it('returns 404 when not found', async () => {
      mockUsuarioService.getByCPF.mockResolvedValue(null);
      req = { params: { cpf: '85687118047' }, usuario: { role: 'admin' } };
      await Controller.buscarPorCPF(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('returns 400 when cpf invalid', async () => {
      mockUsuarioService.getByCPF.mockResolvedValue({ invalidCpf: true });
      req = { params: { cpf: '123' }, usuario: { role: 'admin' } };
      await Controller.buscarPorCPF(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('atualizarUsuarioPorCPF', () => {
    it('returns 404 when not found', async () => {
      mockUsuarioService.updateByCPF.mockResolvedValue(null);
      req = { params: { cpf: '85687118047' }, body: {}, usuario: { role: 'admin' } };
      await Controller.atualizarUsuarioPorCPF(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('returns 400 when cpf invalid', async () => {
      mockUsuarioService.updateByCPF.mockResolvedValue({ invalidCpf: true });
      req = { params: { cpf: '123' }, body: {}, usuario: { role: 'admin' } };
      await Controller.atualizarUsuarioPorCPF(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('excluirUsuarioPorCPF', () => {
    it('returns 404 when not found', async () => {
      mockUsuarioService.removeByCPF.mockResolvedValue(null);
      req = { params: { cpf: '85687118047' }, usuario: { role: 'admin', cpf: '000.000.000-00' } };
      await Controller.excluirUsuarioPorCPF(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('returns 400 when cpf invalid', async () => {
      mockUsuarioService.removeByCPF.mockResolvedValue({ invalidCpf: true });
      req = { params: { cpf: '123' }, usuario: { role: 'admin', cpf: '000.000.000-00' } };
      await Controller.excluirUsuarioPorCPF(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
