import { startTransition } from 'react';

const ROUTER_INIT_ERROR = 'Router action dispatched before initialization';

export function workspaceHref(folder: string): string {
  if (folder === 'settings') return '/settings';
  if (folder === 'analytics') return '/analytics';
  return `/dashboard?folder=${encodeURIComponent(folder)}`;
}

type RouterLike = {
  push: (href: string) => void;
};

/**
 * Next.js 16 can throw if router.push runs before the internal action queue
 * is wired (common with Suspense + useSearchParams). Retry briefly, then fall
 * back to a full navigation.
 */
export function safeRouterPush(router: RouterLike, href: string, attempt = 0): void {
  const run = () => {
    try {
      router.push(href);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes(ROUTER_INIT_ERROR) && attempt < 40) {
        window.setTimeout(() => safeRouterPush(router, href, attempt + 1), 16);
        return;
      }
      window.location.assign(href);
    }
  };

  startTransition(run);
}
