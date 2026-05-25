'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'theme-green' | 'theme-purple' | 'theme-blue' | 'theme-rose';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('theme-green');

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('psychai-theme') as Theme | null;
    if (saved) {
      setThemeState(saved);
      document.documentElement.className = saved;
    } else {
      document.documentElement.className = 'theme-green';
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('psychai-theme', t);
    document.documentElement.className = t;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
