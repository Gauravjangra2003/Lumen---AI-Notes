// Dependency-free so the root layout (a Server Component) can import the init script.

export const SIDEBAR_STORAGE_KEY = "lumen-sidebar";
export const SIDEBAR_MIN_WIDTH = 208;
export const SIDEBAR_MAX_WIDTH = 480;
export const SIDEBAR_DEFAULT_WIDTH = 256;

/** Attribute on <html>; CSS reads it through the `sidebar-collapsed` variant. */
export const SIDEBAR_COLLAPSED_ATTRIBUTE = "data-sidebar-collapsed";
export const SIDEBAR_WIDTH_PROPERTY = "--sidebar-width";

export function clampSidebarWidth(width: number) {
  return Math.round(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width)));
}

/**
 * Runs in <head> before first paint so the saved width and collapsed state
 * apply without a layout jump. Must stay dependency-free and ES5-safe.
 */
export const sidebarInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  SIDEBAR_STORAGE_KEY,
)})||"{}");var r=document.documentElement;if(typeof s.width==="number")r.style.setProperty(${JSON.stringify(
  SIDEBAR_WIDTH_PROPERTY,
)},Math.round(Math.min(${SIDEBAR_MAX_WIDTH},Math.max(${SIDEBAR_MIN_WIDTH},s.width)))+"px");if(s.collapsed===true)r.setAttribute(${JSON.stringify(
  SIDEBAR_COLLAPSED_ATTRIBUTE,
)},"")}catch(e){}})()`;
