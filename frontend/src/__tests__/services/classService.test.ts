import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listAulas, createAula, updateAula, deleteAula } from '../../services/class';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

describe('class service (aulas)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('listAulas returns data', async () => {
    (http.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    const data = await listAulas();
    expect(http.get).toHaveBeenCalledWith('/aulas');
    expect(data.length).toBe(1);
  });

  it('createAula posts payload', async () => {
    (http.post as any).mockResolvedValue({ data: { id: 2 } });
    const payload = { titulo: 'T', data: '2025-01-01', horario: '10:00' };
    const res = await createAula(payload);
    expect(http.post).toHaveBeenCalledWith('/aulas', payload);
    expect(res.id).toBe(2);
  });

  it('updateAula puts partial data', async () => {
    (http.put as any).mockResolvedValue({ data: { ok: true } });
    const out = await updateAula(9, { descricao: 'Nova' });
    expect(http.put).toHaveBeenCalledWith('/aulas/9', { descricao: 'Nova' });
    expect(out.ok).toBe(true);
  });

  it('deleteAula calls delete', async () => {
    (http.delete as any).mockResolvedValue({ status: 204 });
    const resp = await deleteAula(4);
    expect(http.delete).toHaveBeenCalledWith('/aulas/4');
    expect(resp.status).toBe(204);
  });
});
