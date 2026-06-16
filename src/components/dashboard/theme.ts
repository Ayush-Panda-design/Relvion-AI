/** Notion-inspired light + Gmail-style dark workspace tokens. */

export type Density = 'compact' | 'default' | 'comfortable';
export type WorkspaceTheme = 'light' | 'dark';

export const DENSITY_STORAGE_KEY = 'relvion-density';
export const THEME_STORAGE_KEY = 'relvion-workspace-theme';

export const dash = {
  /* Surfaces — Notion light / Gmail dark neutrals */
  bg: 'bg-white dark:bg-[#202124]',
  sidebar: 'bg-[#F7F7F5] dark:bg-[#292a2d]',
  mainPanel: 'bg-white dark:bg-[#202124]',
  surface: 'bg-white dark:bg-[#292a2d]',
  elevated:
    'bg-white border border-[#E9E9E7] shadow-[0_1px_3px_rgba(15,15,15,0.04),0_4px_12px_rgba(15,15,15,0.03)] dark:bg-[#292a2d] dark:border-[#3c4043] dark:shadow-none',

  glassToolbar:
    'bg-white/90 border-b border-[#E9E9E7] dark:bg-[#292a2d] dark:border-[#3c4043]',

  /* Interaction */
  hover: 'hover:bg-[rgba(55,53,47,0.06)] dark:hover:bg-[#3c4043]',
  border: 'border-[#E9E9E7] dark:border-[#3c4043]',
  navActive:
    'bg-[rgba(55,53,47,0.08)] shadow-[inset_3px_0_0_0_#2383E2] dark:bg-[#3c4043] dark:shadow-[inset_3px_0_0_0_#8ab4f8]',

  /* Typography */
  text: 'text-[#37352F] dark:text-[#e8eaed]',
  textMuted: 'text-[#787774] dark:text-[#9aa0a6]',
  textSubtle: 'text-[#9B9A97] dark:text-[#9aa0a6]',

  /* Accent — Notion blue (light) / Gmail blue (dark) */
  accent: 'text-[#2383E2] dark:text-[#8ab4f8]',
  accentBg: 'bg-[#2383E2] hover:bg-[#1a6fc2] text-white shadow-sm dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] dark:text-[#202124]',
  accentSoft:
    'bg-[rgba(55,53,47,0.08)] text-[#37352F] dark:bg-[#3c4043] dark:text-[#e8eaed]',

  compose:
    'bg-[#2383E2] text-white shadow-[0_1px_2px_rgba(15,15,15,0.05)] hover:bg-[#1a6fc2] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#aecbfa]',

  search:
    'bg-[#F7F7F5] border border-[#E9E9E7] shadow-none dark:bg-[#303134] dark:border-transparent',
  searchFocus:
    'ring-2 ring-[#2383E2]/25 border-[#2383E2]/35 dark:ring-[#8ab4f8]/25 dark:border-[#8ab4f8]/30',

  input:
    'bg-[#F7F7F5] border border-[#E9E9E7] focus:border-[#2383E2]/30 focus:bg-white dark:bg-[#303134] dark:border-[#5f6368] dark:focus:border-[#8ab4f8]',

  chip: 'bg-[#F1F1EF] text-[#787774] dark:bg-[#3c4043] dark:text-[#9aa0a6]',
  code: 'bg-[#F1F1EF] text-[#2383E2] dark:bg-[#3c4043] dark:text-[#8ab4f8]',

  /* Email rows */
  rowActive:
    'bg-[rgba(55,53,47,0.06)] shadow-[inset_3px_0_0_0_#2383E2] dark:bg-[#3c4043]/60 dark:shadow-[inset_3px_0_0_0_#8ab4f8]',
  rowUnread: 'font-semibold text-[#37352F] dark:text-[#e8eaed]',
  rowRead: 'font-normal text-[#37352F] dark:text-[#9aa0a6]',
  rowCard:
    'rounded-lg mx-1 border border-transparent transition-colors hover:bg-[rgba(55,53,47,0.04)] dark:hover:bg-[#3c4043]/50',
  avatar:
    'bg-[#2383E2]/10 text-[#2383E2] ring-1 ring-[#2383E2]/15 dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8] dark:ring-[#8ab4f8]/25',

  iconWell: 'bg-[#F1F1EF] text-[#2383E2] dark:bg-[#3c4043] dark:text-[#8ab4f8]',

  /* Chat / agent */
  chatUser:
    'bg-[#2383E2] text-white shadow-sm dark:bg-[#8ab4f8] dark:text-[#202124]',
  chatAgent:
    'border border-[#E9E9E7] bg-[#F7F7F5] text-[#37352F] dark:border-[#3c4043] dark:bg-[#292a2d] dark:text-[#e8eaed]',
  chatAttachment:
    'border border-[#E9E9E7] bg-white dark:border-[#3c4043] dark:bg-[#292a2d] hover:border-[#2383E2]/40 dark:hover:border-[#8ab4f8]',
  chatCopyBtn:
    'border border-[#E9E9E7] bg-white text-[#787774] hover:bg-[#F1F1EF] hover:text-[#2383E2] dark:border-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6] dark:hover:bg-[#292a2d] dark:hover:text-[#8ab4f8]',

  accentHover: 'hover:text-[#2383E2] dark:hover:text-[#8ab4f8]',
  accentRing: 'focus:ring-[#2383E2]/25 dark:focus:ring-[#8ab4f8]/25',
  accentSoftBg: 'bg-[#2383E2]/10 text-[#2383E2] dark:bg-[#8ab4f8]/15 dark:text-[#8ab4f8]',
  accentSelected: 'bg-[#2383E2]/12 text-[#2383E2] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]',
  progressTrack: 'bg-[#F1F1EF] dark:bg-[#3c4043]',
  divider: 'bg-[#E9E9E7] dark:bg-[#5f6368]',
  online: 'bg-[#22c55e]',
  resizeHandle: 'hover:bg-[#2383E2]/20 dark:hover:bg-[#8ab4f8]/25',
  resizeHandleActive: 'bg-[#2383E2]/35 dark:bg-[#8ab4f8]/40',
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
