/** Dashboard design tokens — values come from CSS variables per theme. */

export type Density = 'compact' | 'default' | 'comfortable';

export type DashboardThemeId = 'midnight' | 'pulse' | 'ocean' | 'crextio';

export const DENSITY_STORAGE_KEY = 'relvion-density';
export const THEME_STORAGE_KEY = 'relvion-dashboard-theme';

export const DASHBOARD_THEMES: {
  id: DashboardThemeId;
  name: string;
  description: string;
  swatches: [string, string, string];
}[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark rail · crisp white workspace',
    swatches: ['#0A0A0B', '#2563EB', '#FFFFFF'],
  },
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Bold red · conference energy',
    swatches: ['#DC2626', '#FFFFFF', '#171717'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Fleet blue · rental dashboard pro',
    swatches: ['#1B1F2A', '#3B82F6', '#F2F4F8'],
  },
  {
    id: 'crextio',
    name: 'Crextio',
    description: 'Warm gold · soft glass UI',
    swatches: ['#F59E0B', '#FFF8E7', '#1C1C1E'],
  },
];

export const dash = {
  bodyBg: 'bg-[var(--dash-body-bg)]',
  bg: 'bg-[var(--dash-bg)]',
  sidebar: 'bg-[var(--dash-sidebar)] backdrop-blur-md',
  sidebarText: 'text-[var(--dash-sidebar-text)]',
  sidebarTextMuted: 'text-[var(--dash-sidebar-text-muted)]',
  sidebarBorder: 'border-[var(--dash-sidebar-border)]',
  sidebarHover: 'hover:bg-[var(--dash-sidebar-hover)]',
  mainPanel: 'bg-[var(--dash-main-panel)]',
  surface: 'bg-[var(--dash-surface)]',
  agentPanel: 'bg-[var(--dash-agent-panel)]',
  elevated:
    'bg-[var(--dash-elevated-bg)] border border-[var(--dash-elevated-border)] shadow-[var(--dash-elevated-shadow)]',
  glassToolbar:
    'bg-[var(--dash-glass-bg)] border-b border-[var(--dash-glass-border)] backdrop-blur-md',
  hover: 'hover:bg-[var(--dash-hover)]',
  border: 'border-[var(--dash-border)]',
  navActive:
    'bg-[var(--dash-nav-active-bg)] shadow-[inset_3px_0_0_0_var(--dash-nav-active-indicator)]',
  navActivePill: 'bg-[var(--dash-nav-active-bg)] shadow-none rounded-xl',
  text: 'text-[var(--dash-text)]',
  textMuted: 'text-[var(--dash-text-muted)]',
  textSubtle: 'text-[var(--dash-text-subtle)]',
  accent: 'text-[var(--dash-accent)]',
  accentBg:
    'bg-[var(--dash-accent-bg)] hover:bg-[var(--dash-accent-bg-hover)] text-[var(--dash-accent-text)]',
  accentSoft: 'bg-[var(--dash-accent-soft-bg)] text-[var(--dash-accent-soft-text)]',
  compose:
    'bg-gradient-to-r from-[var(--dash-compose-from)] to-[var(--dash-compose-to)] text-[var(--dash-compose-text)] shadow-[var(--dash-compose-shadow)] hover:opacity-95',
  search:
    'bg-[var(--dash-search-bg)] border border-[var(--dash-search-border)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]',
  searchFocus:
    'ring-2 ring-[var(--dash-search-focus-ring)] border-[var(--dash-search-focus-border)]',
  input:
    'bg-[var(--dash-input-bg)] border border-[var(--dash-input-border)] focus:border-[var(--dash-input-focus-border)]',
  chip: 'bg-[var(--dash-chip-bg)] text-[var(--dash-chip-text)]',
  code: 'bg-[var(--dash-code-bg)] text-[var(--dash-code-text)]',
  rowActive:
    'bg-[var(--dash-row-active-bg)] shadow-[inset_3px_0_0_0_var(--dash-row-active-indicator)]',
  rowUnread: 'font-semibold text-[var(--dash-row-unread)]',
  rowRead: 'font-normal text-[var(--dash-row-read)]',
  rowCard:
    'rounded-xl mx-1 border border-transparent transition-colors hover:bg-[var(--dash-row-hover)]',
  avatar:
    'bg-[var(--dash-avatar-bg)] text-[var(--dash-avatar-text)] ring-1 ring-[var(--dash-avatar-ring)]',
  iconWell: 'bg-[var(--dash-icon-well-bg)] text-[var(--dash-icon-well-text)]',
  chatUser:
    'bg-gradient-to-br from-[var(--dash-chat-user-from)] to-[var(--dash-chat-user-to)] text-[var(--dash-chat-user-text)] shadow-sm',
  chatAgent:
    'border border-[var(--dash-chat-agent-border)] bg-[var(--dash-chat-agent-bg)] text-[var(--dash-text)]',
  chatAttachment:
    'border border-[var(--dash-border)] bg-[var(--dash-surface)] hover:border-[var(--dash-input-focus-border)]',
  chatCopyBtn:
    'border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-accent)]',
  accentHover: 'hover:text-[var(--dash-accent-hover)]',
  accentRing: 'focus:ring-[var(--dash-search-focus-ring)]',
  accentSoftBg: 'bg-[var(--dash-accent-soft-bg)] text-[var(--dash-accent)]',
  accentSelected: 'bg-[var(--dash-row-active-bg)] text-[var(--dash-accent)]',
  progressTrack: 'bg-[var(--dash-progress-track)]',
  divider: 'bg-[var(--dash-divider)]',
  online: 'bg-[#22c55e]',
  resizeHandle: 'hover:bg-[var(--dash-hover)]',
  resizeHandleActive: 'bg-[var(--dash-row-active-bg)]',
  filterBar:
    'rounded-xl border border-[var(--dash-filter-bar-border)] bg-[var(--dash-filter-bar-bg)] p-0.5',
  filterActive:
    'bg-[var(--dash-filter-active-bg)] text-[var(--dash-filter-active-text)] shadow-[var(--dash-filter-active-shadow)] ring-1 ring-[var(--dash-filter-active-ring)]',
  workspaceShell: 'dashboard-workspace-shell',
  workspacePanel: 'dashboard-workspace-panel',
} as const;

export const densityTokens: Record<
  Density,
  {
    rowPy: string;
    rowPx: string;
    gap: string;
    avatar: string;
    showSnippet: boolean;
    singleLine: boolean;
  }
> = {
  compact: {
    rowPy: 'py-2',
    rowPx: 'px-3',
    gap: 'gap-2.5',
    avatar: 'h-8 w-8 text-xs',
    showSnippet: false,
    singleLine: true,
  },
  default: {
    rowPy: 'py-3',
    rowPx: 'px-4',
    gap: 'gap-3',
    avatar: 'h-10 w-10 text-sm',
    showSnippet: false,
    singleLine: true,
  },
  comfortable: {
    rowPy: 'py-4',
    rowPx: 'px-5',
    gap: 'gap-4',
    avatar: 'h-11 w-11 text-sm',
    showSnippet: true,
    singleLine: false,
  },
};

export function dashCn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function isDashboardThemeId(value: string): value is DashboardThemeId {
  return DASHBOARD_THEMES.some((t) => t.id === value);
}
