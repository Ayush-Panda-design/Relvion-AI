'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { THEME_STORAGE_KEY, type WorkspaceTheme } from '@/components/dashboard/theme';

type ThemeContextValue = {
  theme: WorkspaceTheme;
  setTheme: (theme: WorkspaceTheme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: WorkspaceTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<WorkspaceTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as WorkspaceTheme | null;
    const initial: WorkspaceTheme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: WorkspaceTheme) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: WorkspaceTheme = prev === 'dark' ? 'light' : 'dark';
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
