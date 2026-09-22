import { useEffect, useRef } from 'react';

/**
 * Runs `callback` on an interval, with three behaviours that a bare
 * setInterval does not give you and that a chat screen needs:
 *
 *  1. The latest callback is always used, so the interval never has to be
 *     torn down and recreated when a dependency changes.
 *  2. Polling pauses while the browser tab is hidden — a backgrounded tab
 *     otherwise keeps consuming the API rate limit for nobody's benefit.
 *  3. Overlapping runs are skipped: if one request is still in flight when
 *     the next tick arrives, that tick is dropped rather than queued.
 */
export function usePolling(callback, intervalMs, enabled = true) {
  const savedCallback = useRef(callback);
  const runningRef = useRef(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !intervalMs) return undefined;

    const tick = async () => {
      if (runningRef.current) return;
      if (document.visibilityState === 'hidden') return;

      runningRef.current = true;
      try {
        await savedCallback.current();
      } finally {
        runningRef.current = false;
      }
    };

    const id = setInterval(tick, intervalMs);

    // Coming back to the tab should feel instant rather than waiting out
    // the remainder of the interval.
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs, enabled]);
}

export default usePolling;
