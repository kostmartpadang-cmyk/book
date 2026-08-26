'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DEFAULT_THEME } from '@/lib/themes';

interface ThemeContextValue {
  theme: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem('app-theme');
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (id: string) => {
    setThemeState(id);
    localStorage.setItem('app-theme', id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
