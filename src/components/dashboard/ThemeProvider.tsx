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
  APPEARANCE_STORAGE_KEY,
  DASHBOARD_THEMES,
  THEME_STORAGE_KEY,
  isDashboardThemeId,
  type DashboardAppearance,
  type DashboardThemeId,
} from '@/components/dashboard/theme';

type ThemeContextValue = {
  theme: DashboardThemeId;
  appearance: DashboardAppearance;
  setTheme: (theme: DashboardThemeId) => void;
  setAppearance: (appearance: DashboardAppearance) => void;
  toggleAppearance: () => void;
  /** Cycles through all dashboard themes — kept for legacy toggle buttons. */
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME: DashboardThemeId = 'midnight';
const DEFAULT_APPEARANCE: DashboardAppearance = 'light';

const VALID_THEMES = DASHBOARD_THEMES.map((t) => t.id);

function migrateLegacyTheme(stored: string | null): DashboardThemeId {
  if (stored && isDashboardThemeId(stored)) return stored;
  if (stored === 'dark') return 'midnight';
  if (stored === 'light') return 'pulse';
  return DEFAULT_THEME;
}

function migrateAppearance(stored: string | null): DashboardAppearance {
  return stored === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: DashboardThemeId, appearance: DashboardAppearance) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-appearance', appearance);
  document.documentElement.classList.toggle('dark', appearance === 'dark');
  document.documentElement.style.colorScheme = appearance;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<DashboardThemeId>(DEFAULT_THEME);
  const [appearance, setAppearanceState] = useState<DashboardAppearance>(DEFAULT_APPEARANCE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = migrateLegacyTheme(localStorage.getItem(THEME_STORAGE_KEY));
    const initialAppearance = migrateAppearance(localStorage.getItem(APPEARANCE_STORAGE_KEY));
    setThemeState(initialTheme);
    setAppearanceState(initialAppearance);
    applyTheme(initialTheme, initialAppearance);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: DashboardThemeId) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setAppearanceState((currentAppearance) => {
      applyTheme(next, currentAppearance);
      return currentAppearance;
    });
  }, []);

  const setAppearance = useCallback((next: DashboardAppearance) => {
    setAppearanceState(next);
    localStorage.setItem(APPEARANCE_STORAGE_KEY, next);
    setThemeState((currentTheme) => {
      applyTheme(currentTheme, next);
      return currentTheme;
    });
  }, []);

  const toggleAppearance = useCallback(() => {
    setAppearanceState((prev) => {
      const next: DashboardAppearance = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(APPEARANCE_STORAGE_KEY, next);
      setThemeState((currentTheme) => {
        applyTheme(currentTheme, next);
        return currentTheme;
      });
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = DASHBOARD_THEMES.findIndex((t) => t.id === prev);
      const next = DASHBOARD_THEMES[(idx + 1) % DASHBOARD_THEMES.length].id;
      localStorage.setItem(THEME_STORAGE_KEY, next);
      setAppearanceState((currentAppearance) => {
        applyTheme(next, currentAppearance);
        return currentAppearance;
      });
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        appearance,
        setTheme,
        setAppearance,
        toggleAppearance,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { DASHBOARD_THEMES, VALID_THEMES };
