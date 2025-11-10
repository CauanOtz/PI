import { describe, it, expect, vi, beforeEach } from 'vitest';
import { presencaService } from '../../services/presencaService';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('presencaService (error paths)', () => {
  const build = (msg: string, status = 500) => {
    const e: any = new Error(msg);
    e.response = { status, data: { mensagem: msg } };
    return e;
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('list error', async () => {
    (http.get as any).mockRejectedValue(build('list failed'));
    await expect(presencaService.list()).rejects.toThrow('list failed');
  });

  it('create error', async () => {
    (http.post as any).mockRejectedValue(build('create failed'));
    await expect(presencaService.create({ idAssistido: 1, idAtividade: 2, status: 'presente' })).rejects.toThrow('create failed');
  });

  it('update error', async () => {
    (http.put as any).mockRejectedValue(build('update failed'));
    await expect(presencaService.update(1, { status: 'falta' })).rejects.toThrow('update failed');
  });

  it('delete error', async () => {
    (http.delete as any).mockRejectedValue(build('delete failed'));
    await expect(presencaService.delete(1)).rejects.toThrow('delete failed');
  });

  it('listByAtividade error', async () => {
    (http.get as any).mockRejectedValue(build('atividade failed'));
    await expect(presencaService.listByAtividade(1)).rejects.toThrow('atividade failed');
  });

  it('listByAssistido error', async () => {
    (http.get as any).mockRejectedValue(build('assistido failed'));
    await expect(presencaService.listByAssistido(1)).rejects.toThrow('assistido failed');
  });

  it('bulkCreate error', async () => {
    (http.post as any).mockRejectedValue(build('bulk failed'));
    await expect(presencaService.bulkCreate([{ idAssistido: 1, idAtividade: 2, status: 'presente' }])).rejects.toThrow('bulk failed');
  });
});
