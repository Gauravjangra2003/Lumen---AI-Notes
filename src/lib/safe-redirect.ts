const PLACEHOLDER_ORIGIN = "http://placeholder.invalid";

/**
 * Returns `value` as a same-origin path (e.g. `/share/abc`), or `fallback`, so
 * a `?next=` parameter can't send users to another site after signing in.
 * Parsing (rather than prefix checks) also catches tricks like `/\t/evil.com`.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/notes") {
  if (!value?.startsWith("/")) return fallback;
  try {
    const url = new URL(value, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
