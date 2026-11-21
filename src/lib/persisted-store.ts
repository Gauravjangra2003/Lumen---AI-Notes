import { useSyncExternalStore } from "react";

type PersistedStoreOptions<T> = {
  key: string;
  defaults: T;
  /** Turns whatever is in storage into a valid state; must never throw. */
  parse: (raw: unknown) => T;
  /** Runs after every change, including ones from other tabs. */
  onChange?: (state: T) => void;
};

/**
 * A tiny localStorage-backed store for UI preferences. Server renders and
 * hydration see `defaults`; the browser value takes over right after, so
 * there are no hydration mismatches. Changes sync across tabs.
 */
export function createPersistedStore<T extends object>({
  key,
  defaults,
  parse,
  onChange,
}: PersistedStoreOptions<T>) {
  let state: T | null = null;
  const listeners = new Set<() => void>();

  function read(): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? parse(JSON.parse(raw)) : defaults;
    } catch {
      return defaults;
    }
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== key) return;
    state = read();
    onChange?.(state);
    emit();
  }

  function getState(): T {
    state ??= read();
    return state;
  }

  function setState(patch: Partial<T> | ((current: T) => Partial<T>)) {
    const current = getState();
    const next = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };
    state = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage can be full or blocked; the in-memory state still works.
    }
    onChange?.(next);
    emit();
  }

  function subscribe(listener: () => void) {
    if (listeners.size === 0) window.addEventListener("storage", handleStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
    };
  }

  function useStore<S>(selector: (state: T) => S): S {
    return useSyncExternalStore(
      subscribe,
      () => selector(getState()),
      () => selector(defaults),
    );
  }

  return { getState, setState, useStore };
}
