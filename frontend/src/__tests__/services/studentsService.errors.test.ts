import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentsService } from '../../services/students';

vi.mock('../../lib/http', () => ({ http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
import { http } from '../../lib/http';

// Mirrors pattern used in other *Service.errors.test.ts files
describe('studentsService (error paths)', () => {
  const build = (msg: string, status = 500) => {
    const e: any = new Error(msg);
    e.response = { status, data: { mensagem: msg } };
    return e;
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('list error', async () => {
    (http.get as any).mockRejectedValue(build('list failed'));
    await expect(studentsService.list({ page: 1 })).rejects.toThrow('list failed');
  });

  it('get error', async () => {
    (http.get as any).mockRejectedValue(build('get failed'));
    await expect(studentsService.get(99)).rejects.toThrow('get failed');
  });

  it('create error', async () => {
    (http.post as any).mockRejectedValue(build('create failed'));
    await expect(studentsService.create({ nome: 'X' })).rejects.toThrow('create failed');
  });

  it('update error', async () => {
    (http.put as any).mockRejectedValue(build('update failed'));
    await expect(studentsService.update(1, { nome: 'Y' })).rejects.toThrow('update failed');
  });

  it('remove error', async () => {
    (http.delete as any).mockRejectedValue(build('remove failed'));
    await expect(studentsService.remove(1)).rejects.toThrow('remove failed');
  });
});
