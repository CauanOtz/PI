import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from '../hooks/useAsync';

describe('useAsync', () => {
  it('resolves data', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => {
      await result.current.run();
    });
    expect(result.current.data).toBe('ok');
    expect(result.current.loading).toBe(false);
  });

  it('handles error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => { await result.current.run(); });
    expect(result.current.error).toBe('boom');
  });

  it('runs immediately and fires callbacks', async () => {
    const fn = vi.fn().mockResolvedValue('auto');
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useAsync(fn, { immediate: true, onSuccess }));
    await act(async () => {});
    expect(fn).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith('auto');
    expect(result.current.data).toBe('auto');
  });
});
