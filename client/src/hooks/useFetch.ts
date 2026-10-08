import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { getErrorMessage } from '../api/client';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Runs the request again with the current dependencies */
  refetch: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Runs an async request whenever its dependencies change.
 * In-flight requests are aborted when dependencies change or the component unmounts.
 */
export function useFetch<T>(request: (signal: AbortSignal) => Promise<T>, deps: DependencyList): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Keep the latest request function without making it a dependency
  const requestRef = useRef(request);
  requestRef.current = request;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    requestRef
      .current(controller.signal)
      .then((result) => setData(result))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refetch, setData };
}
