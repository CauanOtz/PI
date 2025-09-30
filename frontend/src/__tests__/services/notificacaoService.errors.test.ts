import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificacaoService } from '../../services/notificacao';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('notificacaoService (error paths)', () => {
  const err = (msg: string, status = 500) => {
    const e: any = new Error(msg);
    e.response = { status, data: { mensagem: msg } };
    return e;
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('list propagates error', async () => {
    (http.get as any).mockRejectedValue(err('list fail'));
    await expect(notificacaoService.list()).rejects.toThrow('list fail');
  });

  it('update propagates error', async () => {
    (http.put as any).mockRejectedValue(err('update fail'));
    await expect(notificacaoService.update('9', { titulo: 't', mensagem: 'm', tipo: 'info' })).rejects.toThrow('update fail');
  });

  it('enviar propagates error', async () => {
    (http.post as any).mockRejectedValue(err('enviar fail'));
    await expect(notificacaoService.enviar('1', ['123'])).rejects.toThrow('enviar fail');
  });

  it('markAsRead propagates error', async () => {
    (http.post as any).mockRejectedValue(err('mark fail'));
    await expect(notificacaoService.markAsRead('55')).rejects.toThrow('mark fail');
  });

  it('delete propagates error', async () => {
    (http.delete as any).mockRejectedValue(err('delete fail'));
    await expect(notificacaoService.delete('42')).rejects.toThrow('delete fail');
  });
});
