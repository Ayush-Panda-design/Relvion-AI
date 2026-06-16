'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { safeRouterPush, workspaceHref } from '@/lib/safe-router';

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
  const pendingHref = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    const markReady = () => {
      if (cancelled) return;
      routerReady.current = true;
      setReady(true);

      if (pendingHref.current) {
        const href = pendingHref.current;
        pendingHref.current = null;
        safeRouterPush(router, href);
      }
    };

    frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(markReady);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [router]);

  const activeFolder = resolveActiveFolder(pathname, searchParams.get('folder'));

  const navigateFolder = useCallback(
    (folder: string) => {
      const href = workspaceHref(folder);

      if (!routerReady.current) {
        pendingHref.current = href;
        return;
      }

      safeRouterPush(router, href);
    },
    [router]
  );

  return (
    <WorkspaceNavContext.Provider value={{ activeFolder, navigateFolder, routerReady: ready }}>
      {children}
    </WorkspaceNavContext.Provider>
  );
}
