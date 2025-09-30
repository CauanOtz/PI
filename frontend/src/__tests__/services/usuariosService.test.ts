import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usuariosService } from '../../services/users';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('usuariosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list forwards params and unwraps data', async () => {
    (http.get as any).mockResolvedValue({ data: { usuarios: [{ id: 1, nome: 'A' }], total: 1 } });
    const res = await usuariosService.list({ page: 2, limit: 5, search: 'a', role: 'admin' });
    expect(http.get).toHaveBeenCalledWith('/usuarios', { params: { page: 2, limit: 5, search: 'a', role: 'admin' } });
    expect(res.usuarios?.length).toBe(1);
  });

  it('getByCPF calls correct path', async () => {
    (http.get as any).mockResolvedValue({ data: { usuario: { id: 9, nome: 'X' } } });
    const data = await usuariosService.getByCPF('123');
    expect(http.get).toHaveBeenCalledWith('/usuarios/123');
  expect(data.usuario?.nome).toBe('X');
  });

  it('create posts and returns data', async () => {
    (http.post as any).mockResolvedValue({ data: { ok: true, user: { id: 1 } } });
    const result = await usuariosService.create({ nome: 'Novo', cpf: '1', senha: 's' });
    expect(http.post).toHaveBeenCalledWith('/usuarios/registrar', { nome: 'Novo', cpf: '1', senha: 's' });
    expect(result.ok).toBe(true);
  });

  it('updateByCPF puts and returns data', async () => {
    (http.put as any).mockResolvedValue({ data: { atualizado: true } });
    const out = await usuariosService.updateByCPF('321', { nome: 'Edit' });
    expect(http.put).toHaveBeenCalledWith('/usuarios/321', { nome: 'Edit' });
    expect(out.atualizado).toBe(true);
  });

  it('removeByCPF deletes and returns data', async () => {
    (http.delete as any).mockResolvedValue({ data: { removido: true } });
    const res = await usuariosService.removeByCPF('999');
    expect(http.delete).toHaveBeenCalledWith('/usuarios/999');
    expect(res.removido).toBe(true);
  });
});
