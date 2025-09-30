import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from '../services/dashboard';
import { http } from '../lib/http';
import { notificacaoService } from '../services/notificacao';

vi.mock('../lib/http', () => ({
  http: {
    get: vi.fn(),
  }
}));

vi.mock('../services/notificacao', () => ({
  notificacaoService: {
    list: vi.fn()
  }
}));

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAlunosCount', () => {
    it('extracts total directly', async () => {
      (http.get as any).mockResolvedValueOnce({ data: { dados: { paginacao: { total: 42 } } } });
      const total = await dashboardService.getAlunosCount();
      expect(total).toBe(42);
    });

    it('falls back to alternative path when first fails', async () => {
      (http.get as any)
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ data: { dados: { paginacao: { total: 5 } } } });
      const total = await dashboardService.getAlunosCount();
      expect(total).toBe(5);
    });
  });

  describe('getNotifications', () => {
    it('prefers notificacaoService.list', async () => {
      (notificacaoService.list as any).mockResolvedValue([{ id: 1 }]);
      const res = await dashboardService.getNotifications();
      expect(res).toEqual([{ id: 1 }]);
    });

    it('tries fallback candidates', async () => {
      (notificacaoService.list as any).mockRejectedValue(new Error('x'));
      (http.get as any)
        .mockResolvedValueOnce({ data: { foo: [] } }) 
        .mockResolvedValueOnce({ data: { items: [{ id: 9 }] } }); 
      const res = await dashboardService.getNotifications();
      expect(res).toEqual([{ id: 9 }]);
    });
  });

  it('getRecentActivities returns empty array when none', async () => {
    (http.get as any).mockRejectedValue(new Error('x'));
    const res = await dashboardService.getRecentActivities();
    expect(Array.isArray(res)).toBe(true);
  });

  it('getRecentActivities returns sliced list when available', async () => {
    (http.get as any).mockResolvedValue({ data: { rows: [1,2,3,4,5,6,7].map(i => ({ id: i })) } });
    const res = await dashboardService.getRecentActivities();
    expect(res.length).toBe(6);
  });

  it('getUpcomingEvents returns first successful slice', async () => {

    (http.get as any)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ data: { data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }] } });
    const res = await dashboardService.getUpcomingEvents();
    expect(res.length).toBe(6);
  });
});
