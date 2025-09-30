import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAlunosDoResponsavel } from '../../services/responsavel';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn() } }));
import { http } from '../../lib/http';

describe('responsavel service (error paths)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('propagates fetch error', async () => {
    const err: any = new Error('network boom');
    err.response = { status: 500, data: { mensagem: 'network boom' } };
    (http.get as any).mockRejectedValue(err);
    await expect(getAlunosDoResponsavel(42)).rejects.toThrow('network boom');
  });
});
