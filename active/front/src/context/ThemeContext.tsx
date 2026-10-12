import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';

const STORAGE_KEY = 'bp_theme';

function resolvedCarbonTheme(mode: ThemeMode): CarbonTheme {
  if (mode === 'light') return 'white';
  if (mode === 'dark') return 'g100';
  // system
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'g100' : 'white';
}

interface ThemeContextValue {
  mode: ThemeMode;
  carbonTheme: CarbonTheme;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'system',
  );
  const [carbonTheme, setCarbonTheme] = useState<CarbonTheme>(() =>
    resolvedCarbonTheme(mode),
  );

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, m);
    setModeState(m);
    setCarbonTheme(resolvedCarbonTheme(m));
  }, []);

  // React to OS-level dark/light changes when mode === 'system'
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setCarbonTheme(resolvedCarbonTheme('system'));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, carbonTheme, setMode }),
    [mode, carbonTheme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
