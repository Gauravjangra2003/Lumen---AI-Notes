"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a debounced function plus `flush` (run any pending call now) and
 * `cancel`. Pending calls are flushed on unmount so no work is silently lost.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<Args | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const flush = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    const args = pendingArgsRef.current;
    pendingArgsRef.current = null;
    if (args) callbackRef.current(...args);
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    pendingArgsRef.current = null;
  }, []);

  const debounced = useCallback(
    (...args: Args) => {
      pendingArgsRef.current = args;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(flush, delay);
    },
    [delay, flush],
  );

  useEffect(() => flush, [flush]);

  return { debounced, flush, cancel };
}
