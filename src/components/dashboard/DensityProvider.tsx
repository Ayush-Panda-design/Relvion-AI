'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { DENSITY_STORAGE_KEY, type Density } from '@/components/dashboard/theme';

type DensityContextValue = {
  density: Density;
  setDensity: (d: Density) => void;
};

const DensityContext = createContext<DensityContextValue>({
  density: 'default',
  setDensity: () => {},
});

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<Density>('default');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DENSITY_STORAGE_KEY) as Density | null;
      if (saved === 'compact' || saved === 'default' || saved === 'comfortable') {
        setDensityState(saved);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setDensity = (d: Density) => {
    setDensityState(d);
    try {
      localStorage.setItem(DENSITY_STORAGE_KEY, d);
    } catch {
      /* ignore */
    }
  };

  if (!ready) {
    return <>{children}</>;
  }

  return (
    <DensityContext.Provider value={{ density, setDensity }}>{children}</DensityContext.Provider>
  );
}

export function useDensity() {
  return useContext(DensityContext);
}
