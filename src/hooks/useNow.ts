import { useCallback, useEffect, useState } from 'react';

/**
 * Wall-clock time for rendering, read outside of render so components stay pure.
 * The value is taken on mount, every `intervalMs`, and whenever `refresh` is called from an event handler.
 */
export function useNow(intervalMs: number): [now: number, refresh: () => void] {
  const [now, setNow] = useState(() => Date.now());
  const refresh = useCallback(() => setNow(Date.now()), []);
  useEffect(() => {
    const intervalId = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(intervalId);
  }, [intervalMs, refresh]);
  return [now, refresh];
}
