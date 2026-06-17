'use client';

import {
  Calendar,
  Settings,
  BarChart2,
  Inbox,
  Send,
  Archive,
  Trash,
  FileText,
  PenLine,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandMark } from '@/components/brand/BrandMark';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { useTheme } from '@/components/dashboard/ThemeProvider';
import { prefetchFolderEmails } from '@/hooks/useFolderEmails';
import { prefetchCalendarEvents } from '@/hooks/useCalendarEvents';
import { prefetchJson } from '@/lib/client-cache';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { useWorkspaceShell } from '@/contexts/workspace-shell';

export function Sidebar({
  activeFolder,
  onFolderChange,
  onComposeClick,
}: {
  activeFolder: string;
  onFolderChange: (f: string) => void;
  onComposeClick?: () => void;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<{ email: string; name: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const pillNav = theme === 'ocean' || theme === 'crextio' || theme === 'oxfin' || theme === 'limedock';
  const { mobileNavOpen, closeMobileNav } = useWorkspaceShell();

  const afterNavigate = () => closeMobileNav();

  useEffect(() => {
    if (mobileNavOpen) setCollapsed(false);
  }, [mobileNavOpen]);

  useEffect(() => {
    fetch('/api/gmail/counts').then((r) => r.json()).then(setCounts).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (me?.email) {
          setProfile({ email: me.email, name: me.email.split('@')[0] });
        }
      })
      .catch(() => {});

    fetch('/api/gmail/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.email) {
          setProfile({ email: data.email, name: data.email.split('@')[0] });
        }
      })
      .catch(() => {});
  }, []);

  const folders = [
    { name: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox || 0 },
    { name: 'snoozed', label: 'Snoozed', icon: Clock, count: counts.snoozed || 0 },
    { name: 'drafts', label: 'Drafts', icon: FileText, count: counts.drafts || 0 },
    { name: 'sent', label: 'Sent', icon: Send, count: counts.sent || 0 },
    { name: 'spam', label: 'Spam', icon: Archive, count: counts.spam || 0 },
    { name: 'trash', label: 'Trash', icon: Trash, count: counts.trash || 0 },
  ];

  const NavItem = ({
    active,
    onClick,
    href,
    icon: Icon,
    label,
    count,
  }: {
    active: boolean;
    onClick?: () => void;
    href?: string;
    icon: typeof Inbox;
    label: string;
    count?: number;
  }) => {
    const content = (
      <>
        {active && (
          <span
            className={cn(
              'absolute inset-0',
              pillNav ? dash.navActivePill : cn('rounded-lg', dash.navActive)
            )}
          />
        )}
        <Icon
          size={20}
          strokeWidth={1.75}
          className={cn(
            'relative z-10 shrink-0 transition-colors',
            active ? (pillNav ? 'dash-nav-active-icon text-white' : dash.accent) : ''
          )}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="relative z-10 flex flex-1 items-center justify-between overflow-hidden font-medium"
            >
              <span
                className={cn(
                  active
                    ? pillNav
                      ? 'dash-nav-active-label text-white'
                      : dash.sidebarText
                    : dash.sidebarTextMuted
                )}
              >
                {label}
              </span>
              {count !== undefined && count > 0 && (
                <span className={cn('text-xs font-medium tabular-nums', active && pillNav ? 'text-white/90' : dash.accent)}>
                  {count}
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </>
    );

    const className = cn(
      'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 text-left',
      active ? dash.sidebarText : dash.sidebarTextMuted,
      !active && dash.sidebarHover
    );

    if (href) {
      const folderPrefetch =
        label === 'Inbox'
          ? 'inbox'
          : label === 'Drafts'
            ? 'drafts'
            : label === 'Sent'
              ? 'sent'
              : label === 'Spam'
                ? 'spam'
                : label === 'Trash'
                  ? 'trash'
                  : label === 'Snoozed'
                    ? 'snoozed'
                    : null;

      return (
        <Link
          href={href}
          prefetch={false}
          className={className}
          onClick={afterNavigate}
          onMouseEnter={() => {
            if (href === '/analytics') prefetchJson('analytics', '/api/analytics');
            else if (folderPrefetch) prefetchFolderEmails(folderPrefetch);
          }}
        >
          {content}
        </Link>
      );
    }

    return (
      <motion.button
        type="button"
        onClick={() => {
          onClick?.();
          afterNavigate();
        }}
        onMouseEnter={() => {
          if (label === 'Calendar') prefetchCalendarEvents();
          else if (['Inbox', 'Drafts', 'Sent', 'Spam', 'Trash'].includes(label)) {
            const map: Record<string, string> = {
              Inbox: 'inbox',
              Drafts: 'drafts',
              Sent: 'sent',
              Spam: 'spam',
              Trash: 'trash',
            };
            prefetchFolderEmails(map[label] || 'inbox');
          }
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={className}
      >
        {content}
      </motion.button>
    );
  };

  const sidebarBody = (
    <>
      <div className={cn('flex items-center gap-2 p-3', collapsed ? 'justify-center' : 'px-4')}>
        <Link href="/" prefetch={false} className="flex items-center gap-2.5" onClick={afterNavigate}>
          <BrandMark size={28} variant="auto" />
          {!collapsed && (
            <span className={cn('text-lg font-semibold tracking-tight', dash.sidebarText)}>
              Relvion<span className={dash.accent}>.</span>
            </span>
          )}
        </Link>
      </div>

      <div className={cn('px-3 pb-2', collapsed && 'px-2')}>
        <ShimmerButton
          onClick={() => {
            onComposeClick?.();
            afterNavigate();
          }}
          title="Compose new email (C)"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-100',
            dash.compose,
            collapsed ? 'px-0' : 'px-4'
          )}
        >
          <PenLine size={18} />
          {!collapsed && <span>Compose</span>}
        </ShimmerButton>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-2 py-2">
        <div>
          {!collapsed && (
            <p className={cn('mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider', dash.sidebarTextMuted)}>
              Mail
            </p>
          )}
          <div className="space-y-0.5">
            {folders.map((f) => (
              <NavItem
                key={f.name}
                active={activeFolder === f.name}
                href={`/dashboard?folder=${f.name}`}
                icon={f.icon}
                label={f.label}
                count={f.count}
              />
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className={cn('mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider', dash.sidebarTextMuted)}>
              Apps
            </p>
          )}
          <NavItem
            active={activeFolder === 'calendar'}
            href="/dashboard?folder=calendar"
            icon={Calendar}
            label="Calendar"
          />
        </div>

        <div>
          {!collapsed && (
            <p className={cn('mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider', dash.sidebarTextMuted)}>
              More
            </p>
          )}
          <NavItem href="/analytics" active={activeFolder === 'analytics'} icon={BarChart2} label="Analytics" />
          <NavItem href="/settings" active={activeFolder === 'settings'} icon={Settings} label="Settings" />
        </div>
      </div>

      <div className={cn('border-t p-3', dash.sidebarBorder)}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <ContactAvatar
            name={profile?.name || profile?.email || 'User'}
            sizeClass="h-9 w-9 text-sm"
            variant="theme"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className={cn('truncate text-sm font-medium', dash.sidebarText)}>{profile?.name || 'User'}</p>
              <p className={cn('truncate text-xs', dash.sidebarTextMuted)}>{profile?.email || ''}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'mt-3 hidden w-full items-center justify-center rounded-lg p-2 transition-colors lg:flex',
            dash.sidebarHover,
            dash.sidebarTextMuted
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className={cn(
          'relative z-20 hidden h-screen shrink-0 flex-col border-r lg:flex',
          dash.sidebar,
          dash.sidebarBorder
        )}
      >
        {sidebarBody}
      </motion.aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
              onClick={closeMobileNav}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              className={cn(
                'fixed inset-y-0 left-0 z-50 flex w-[min(300px,88vw)] flex-col border-r shadow-2xl lg:hidden',
                dash.sidebar,
                dash.sidebarBorder
              )}
            >
              <div className="flex items-center justify-end border-b p-2 lg:hidden" style={{ borderColor: 'var(--dash-border)' }}>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className={cn('rounded-full p-2.5', dash.hover, dash.textMuted)}
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarBody}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
