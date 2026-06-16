'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState, startTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type WorkspaceNavContextValue = {
  activeFolder: string;
  navigateFolder: (folder: string) => void;
  routerReady: boolean;
};

const WorkspaceNavContext = createContext<WorkspaceNavContextValue>({
  activeFolder: 'inbox',
  navigateFolder: () => {},
  routerReady: false,
});

export function useWorkspaceNav() {
  return useContext(WorkspaceNavContext);
}

function resolveActiveFolder(pathname: string, folderParam: string | null): string {
  if (pathname === '/settings') return 'settings';
  if (pathname === '/analytics') return 'analytics';
  return folderParam || 'inbox';
}

export function WorkspaceNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const routerReady = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    routerReady.current = true;
    setReady(true);
  }, []);

  const activeFolder = resolveActiveFolder(pathname, searchParams.get('folder'));

  const navigateFolder = useCallback(
    (folder: string) => {
      if (!routerReady.current) return;

      const go = () => {
        if (folder === 'settings') {
          router.push('/settings');
          return;
        }
        if (folder === 'analytics') {
          router.push('/analytics');
          return;
        }
        router.push(`/dashboard?folder=${folder}`);
      };

      startTransition(go);
    },
    [router]
  );

  return (
    <WorkspaceNavContext.Provider value={{ activeFolder, navigateFolder, routerReady: ready }}>
      {children}
    </WorkspaceNavContext.Provider>
  );
}
