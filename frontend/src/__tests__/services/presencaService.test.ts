import { describe, it, expect, vi, beforeEach } from 'vitest';
import { presencaService } from '../../services/presencaService';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('presencaService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list fetches presencas', async () => {
    (http.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    const res = await presencaService.list({ page: 1 });
    expect(http.get).toHaveBeenCalledWith('/presencas', { params: { page: 1 } });
    expect(res.length).toBe(1);
  });

  it('create posts a presence', async () => {
    (http.post as any).mockResolvedValue({ data: { id: 10 } });
    const created = await presencaService.create({ idAssistido: 1, idAtividade: 2, status: 'presente' });
    expect(http.post).toHaveBeenCalledWith('/presencas', { idAssistido: 1, idAtividade: 2, status: 'presente' });
    expect(created.id).toBe(10);
  });

  it('update modifies presence', async () => {
    (http.put as any).mockResolvedValue({ data: { updated: true } });
    const res = await presencaService.update(5, { status: 'falta' });
    expect(http.put).toHaveBeenCalledWith('/presencas/5', { status: 'falta' });
    expect(res.updated).toBe(true);
  });

  it('delete removes presence', async () => {
    (http.delete as any).mockResolvedValue({ status: 204 });
    const resp = await presencaService.delete(7);
    expect(http.delete).toHaveBeenCalledWith('/presencas/7');
    expect(resp.status).toBe(204);
  });

  it('listByAtividade fetches atividade presencas', async () => {
    (http.get as any).mockResolvedValue({ data: { presencas: [{ id: 2 }], atividade: { id: 9, titulo: 'Test' } } });
    const res = await presencaService.listByAtividade(9, { page: 1 });
    expect(http.get).toHaveBeenCalledWith('/presencas/atividades/9', { params: { page: 1 } });
    expect(res.presencas.length).toBe(1);
  });

  it('listByAssistido fetches assistido presencas', async () => {
    (http.get as any).mockResolvedValue({ data: { presencas: [{ id: 3 }], paginacao: { total: 1 } } });
    const res = await presencaService.listByAssistido(11, { page: 2 });
    expect(http.get).toHaveBeenCalledWith('/presencas/assistidos/11', { params: { page: 2 } });
    expect(res.presencas.length).toBe(1);
  });

  it('bulkCreate posts array', async () => {
    (http.post as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });
    const items = [
      { idAssistido: 1, idAtividade: 2, status: 'presente' as const },
      { idAssistido: 3, idAtividade: 2, status: 'falta' as const },
    ];
    const res = await presencaService.bulkCreate(items);
    expect(http.post).toHaveBeenCalledWith('/presencas/bulk', items);
    expect(res.length).toBe(2);
  });
});
