"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and hydration, `true` afterwards. Gate browser-only output
 * (e.g. random content) behind it so server and client markup always match.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
