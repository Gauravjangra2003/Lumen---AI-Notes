"use client";

import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  DARK_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  isTheme,
  resolveTheme,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme";

const THEME_CHANGE_EVENT = "lumen:theme-change";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribeToStoredTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function readSystemPrefersDark() {
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

function subscribeToSystemTheme(onChange: () => void) {
  const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

/** Applies the theme while suppressing CSS transitions to avoid a colour sweep. */
function applyThemeToDocument(resolved: ResolvedTheme) {
  const root = document.documentElement;
  const disableTransitions = document.createElement("style");
  disableTransitions.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(disableTransitions);

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;

  // Force a reflow so the transition-free styles are committed before removal.
  void window.getComputedStyle(root).opacity;
  disableTransitions.remove();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToStoredTheme,
    readStoredTheme,
    () => "system" as const,
  );
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    readSystemPrefersDark,
    () => false,
  );
  const resolvedTheme = resolveTheme(theme, systemPrefersDark);

  // Reads the sources of truth directly (not the hydration snapshot) so the
  // first pass never undoes what the inline <head> script already applied.
  useLayoutEffect(() => {
    applyThemeToDocument(resolveTheme(readStoredTheme(), readSystemPrefersDark()));
  }, [theme, systemPrefersDark]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked by the browser; the default theme is used instead.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
