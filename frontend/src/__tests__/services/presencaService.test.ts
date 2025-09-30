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
    const created = await presencaService.create({ idAluno: 1, idAula: 2, status: 'presente' });
    expect(http.post).toHaveBeenCalledWith('/presencas', { idAluno: 1, idAula: 2, status: 'presente' });
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

  it('listByAula fetches aula presencas', async () => {
    (http.get as any).mockResolvedValue({ data: [{ id: 2 }] });
    const res = await presencaService.listByAula(9, { page: 1 });
    expect(http.get).toHaveBeenCalledWith('/presencas/aulas/9', { params: { page: 1 } });
    expect(res.length).toBe(1);
  });

  it('listByAluno fetches aluno presencas', async () => {
    (http.get as any).mockResolvedValue({ data: [{ id: 3 }] });
    const res = await presencaService.listByAluno(11, { page: 2 });
    expect(http.get).toHaveBeenCalledWith('/presencas/alunos/11', { params: { page: 2 } });
    expect(res.length).toBe(1);
  });

  it('bulkCreate posts array', async () => {
    (http.post as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });
    const items = [
      { idAluno: 1, idAula: 2, status: 'presente' as const },
      { idAluno: 3, idAula: 2, status: 'falta' as const },
    ];
    const res = await presencaService.bulkCreate(items);
    expect(http.post).toHaveBeenCalledWith('/presencas/bulk', items);
    expect(res.length).toBe(2);
  });
});
