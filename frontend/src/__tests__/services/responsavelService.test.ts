import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAlunosDoResponsavel } from '../../services/responsavel';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn() } }));
import { http } from '../../lib/http';

describe('responsavel service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns raw array when response is array', async () => {
    (http.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    const res = await getAlunosDoResponsavel(1);
    expect(http.get).toHaveBeenCalledWith('/responsaveis/1/alunos');
    expect(Array.isArray(res)).toBe(true);
  });

  it('unwraps dados.alunos', async () => {
    (http.get as any).mockResolvedValue({ data: { dados: { alunos: [{ id: 2 }] } } });
    const res = await getAlunosDoResponsavel(2);
    expect(res[0].id).toBe(2);
  });

  it('unwraps alunos field if present', async () => {
    (http.get as any).mockResolvedValue({ data: { alunos: [{ id: 3 }] } });
    const res = await getAlunosDoResponsavel(3);
    expect(res[0].id).toBe(3);
  });
});
