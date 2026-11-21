export function getSharePath(token: string) {
  return `/share/${token}`;
}

/** Absolute share URL. Browser-only: call from event handlers or client-only UI. */
export function getShareUrl(token: string) {
  return new URL(getSharePath(token), window.location.origin).toString();
}
