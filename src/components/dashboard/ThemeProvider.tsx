'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  DASHBOARD_THEMES,
  THEME_STORAGE_KEY,
  isDashboardThemeId,
  type DashboardThemeId,
} from '@/components/dashboard/theme';

type ThemeContextValue = {
  theme: DashboardThemeId;
  setTheme: (theme: DashboardThemeId) => void;
  /** Cycles through all dashboard themes — kept for legacy toggle buttons. */
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME: DashboardThemeId = 'midnight';

function migrateLegacyTheme(stored: string | null): DashboardThemeId {
  if (stored && isDashboardThemeId(stored)) return stored;
  if (stored === 'dark') return 'midnight';
  if (stored === 'light') return 'pulse';
  return DEFAULT_THEME;
}

function applyTheme(theme: DashboardThemeId) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<DashboardThemeId>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = migrateLegacyTheme(localStorage.getItem(THEME_STORAGE_KEY));
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: DashboardThemeId) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = DASHBOARD_THEMES.findIndex((t) => t.id === prev);
      const next = DASHBOARD_THEMES[(idx + 1) % DASHBOARD_THEMES.length].id;
      localStorage.setItem(THEME_STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { DASHBOARD_THEMES };
