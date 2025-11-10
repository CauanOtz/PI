import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssistidosDoResponsavel } from '../../services/responsavel';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn() } }));
import { http } from '../../lib/http';

describe('responsavel service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns raw array when response is array', async () => {
    (http.get as any).mockResolvedValue({ data: [{ id: 1 }] });
    const res = await getAssistidosDoResponsavel(1);
    expect(http.get).toHaveBeenCalledWith('/responsaveis/1/assistidos');
    expect(Array.isArray(res)).toBe(true);
  });

  it('unwraps dados.assistidos', async () => {
    (http.get as any).mockResolvedValue({ data: { dados: { assistidos: [{ id: 2 }] } } });
    const res = await getAssistidosDoResponsavel(2);
    expect(res[0].id).toBe(2);
  });

  it('unwraps assistidos field if present', async () => {
    (http.get as any).mockResolvedValue({ data: { assistidos: [{ id: 3 }] } });
    const res = await getAssistidosDoResponsavel(3);
    expect(res[0].id).toBe(3);
  });
});
