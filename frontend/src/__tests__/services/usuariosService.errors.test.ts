import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usuariosService } from '../../services/users';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('usuariosService (error paths)', () => {
  const buildErr = (message = 'fail', status = 500) => {
    const error: any = new Error(message);
    error.response = { status, data: { mensagem: message } };
    return error;
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('list propagates rejection', async () => {
    (http.get as any).mockRejectedValue(buildErr('list boom'));
    await expect(usuariosService.list({ page: 1 })).rejects.toThrow('list boom');
    expect(http.get).toHaveBeenCalledWith('/usuarios', { params: { page: 1 } });
  });

  it('getByCPF propagates rejection', async () => {
    (http.get as any).mockRejectedValue(buildErr('cpf missing', 404));
    await expect(usuariosService.getByCPF('999')).rejects.toThrow('cpf missing');
    expect(http.get).toHaveBeenCalledWith('/usuarios/999');
  });

  it('create propagates rejection', async () => {
    (http.post as any).mockRejectedValue(buildErr('duplicate cpf', 409));
    await expect(usuariosService.create({ nome: 'X', cpf: '1', senha: 's' })).rejects.toThrow('duplicate cpf');
    expect(http.post).toHaveBeenCalled();
  });

  it('updateByCPF propagates rejection', async () => {
    (http.put as any).mockRejectedValue(buildErr('not found', 404));
    await expect(usuariosService.updateByCPF('123', { nome: 'Y' })).rejects.toThrow('not found');
    expect(http.put).toHaveBeenCalled();
  });

  it('removeByCPF propagates rejection', async () => {
    (http.delete as any).mockRejectedValue(buildErr('cannot delete', 400));
    await expect(usuariosService.removeByCPF('123')).rejects.toThrow('cannot delete');
    expect(http.delete).toHaveBeenCalled();
  });
});
