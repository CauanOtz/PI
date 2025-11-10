import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listAtividades, createAtividade, updateAtividade, deleteAtividade } from '../../services/atividade';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('atividade service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('listAtividades returns data', async () => {
    (http.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    const data = await listAtividades();
    expect(http.get).toHaveBeenCalledWith('/atividades');
    expect(data.length).toBe(1);
  });

  it('createAtividade posts payload', async () => {
    (http.post as any).mockResolvedValue({ data: { id: 2 } });
    const payload = { titulo: 'T', data: '2025-01-01', horario: '10:00' };
    const res = await createAtividade(payload);
    expect(http.post).toHaveBeenCalledWith('/atividades', payload);
    expect(res.id).toBe(2);
  });

  it('updateAtividade puts partial data', async () => {
    (http.put as any).mockResolvedValue({ data: { ok: true } });
    const out = await updateAtividade(9, { descricao: 'Nova' });
    expect(http.put).toHaveBeenCalledWith('/atividades/9', { descricao: 'Nova' });
    expect(out.ok).toBe(true);
  });

  it('deleteAtividade calls delete', async () => {
    (http.delete as any).mockResolvedValue({ status: 204 });
    const resp = await deleteAtividade(4);
    expect(http.delete).toHaveBeenCalledWith('/atividades/4');
    expect(resp.status).toBe(204);
  });
});