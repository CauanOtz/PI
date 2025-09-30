import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificacaoService } from '../services/notificacao';
import { http } from '../lib/http';

vi.mock('../lib/http', () => {
  return {
    http: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
    }
  };
});

const sample = [{ id: 1, titulo: 'Teste' }];

describe('notificacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list extracts arrays from root', async () => {
    (http.get as any).mockResolvedValue({ data: sample });
    const res = await notificacaoService.list();
    expect(res).toEqual(sample);
  });

  it('list handles nested notificacoes', async () => {
    (http.get as any).mockResolvedValue({ data: { notificacoes: sample } });
    const res = await notificacaoService.list();
    expect(res).toEqual(sample);
  });

  it('listMinhas passes params', async () => {
    (http.get as any).mockResolvedValue({ data: sample });
    await notificacaoService.listMinhas(2, 5);
    expect(http.get).toHaveBeenCalledWith('/notificacoes/minhas', { params: { page: 2, limit: 5 } });
  });

  it('update normalizes empty string to null', async () => {
    (http.put as any).mockResolvedValue({ data: { ok: true } });
    await notificacaoService.update('10', { titulo: 'X', mensagem: 'Y', tipo: 'info', dataExpiracao: '' });
    expect(http.put).toHaveBeenCalledWith('/notificacoes/10', { titulo: 'X', mensagem: 'Y', tipo: 'info', dataExpiracao: null });
  });

  it('enviar posts usuarios payload', async () => {
    (http.post as any).mockResolvedValue({ data: { ok: true } });
    await notificacaoService.enviar('7', ['1','2']);
    expect(http.post).toHaveBeenCalledWith('/notificacoes/7/enviar', { usuarios: ['1','2'] });
  });

  it('markAsRead posts to correct endpoint', async () => {
    (http.post as any).mockResolvedValue({ data: { ok: true } });
    await notificacaoService.markAsRead('55');
    expect(http.post).toHaveBeenCalledWith('/notificacoes/55/marcar-lida');
  });

  it('delete calls delete endpoint', async () => {
    (http.delete as any).mockResolvedValue({ data: { ok: true } });
    await notificacaoService.delete('88');
    expect(http.delete).toHaveBeenCalledWith('/notificacoes/88');
  });
});
