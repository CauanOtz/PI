import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  run: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T>(asyncFn: (...args: any[]) => Promise<T>, opts?: { immediate?: boolean; onError?: (e: any) => void; onSuccess?: (d: T) => void; }) : UseAsyncState<T> {
  const { immediate = false, onError, onSuccess } = opts || {};
  const mountedRef = useRef(true);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (...args: any[]) => {
    setLoading(true); setError(null);
    try {
      const result = await asyncFn(...args);
      if (!mountedRef.current) return null;
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      if (!mountedRef.current) return null;
      const msg = err?.response?.data?.mensagem || err?.message || 'Erro inesperado';
      setError(String(msg));
      onError?.(err);
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [asyncFn, onError, onSuccess]);

  const reset = () => { setData(null); setError(null); };

  useEffect(() => {
    if (immediate) run();
    return () => { mountedRef.current = false; };
  }, [immediate, run]);

  return { data, loading, error, run, reset };
}

export default useAsync;
