/** Premium warm light (eye-safe) + Gmail-style dark workspace tokens. */

export type Density = 'compact' | 'default' | 'comfortable';
export type WorkspaceTheme = 'light' | 'dark';

export const DENSITY_STORAGE_KEY = 'relvion-density';
export const THEME_STORAGE_KEY = 'relvion-workspace-theme';

export const dash = {
  /* Surfaces — warm parchment light / Gmail dark */
  bg: 'bg-[#EEEDE8] dark:bg-[#202124]',
  sidebar: 'bg-[#E4E2DC] dark:bg-[#292a2d]',
  mainPanel: 'bg-[#F5F4F0] dark:bg-[#202124]',
  surface: 'bg-[#FAF9F6] dark:bg-[#292a2d]',
  elevated:
    'bg-[#FAF9F6] border border-[#D8D5CE] shadow-[0_1px_2px_rgba(44,43,40,0.04),0_8px_24px_-4px_rgba(13,148,136,0.08)] dark:bg-[#292a2d] dark:border-[#3c4043] dark:shadow-none',

  glassToolbar:
    'bg-[#F5F4F0]/95 border-b border-[#D8D5CE] backdrop-blur-sm dark:bg-[#292a2d] dark:border-[#3c4043]',

  /* Interaction */
  hover: 'hover:bg-[rgba(13,148,136,0.07)] dark:hover:bg-[#3c4043]',
  border: 'border-[#D8D5CE] dark:border-[#3c4043]',
  navActive:
    'bg-[#E0F2F1] shadow-[inset_3px_0_0_0_#0D9488] dark:bg-[#3c4043] dark:shadow-[inset_3px_0_0_0_#8ab4f8]',

  /* Typography — softer contrast for eye comfort */
  text: 'text-[#2C2B28] dark:text-[#e8eaed]',
  textMuted: 'text-[#5C5A54] dark:text-[#9aa0a6]',
  textSubtle: 'text-[#7A7770] dark:text-[#9aa0a6]',

  /* Accent — teal / emerald (light) · Gmail blue (dark only) */
  accent: 'text-[#0D9488] dark:text-[#8ab4f8]',
  accentBg:
    'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-[0_1px_3px_rgba(13,148,136,0.25)] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] dark:text-[#202124] dark:shadow-none',
  accentSoft: 'bg-[#E0F2F1] text-[#047857] dark:bg-[#3c4043] dark:text-[#e8eaed]',

  compose:
    'bg-gradient-to-r from-[#0D9488] to-[#059669] text-white shadow-[0_2px_8px_rgba(13,148,136,0.28)] hover:from-[#0F766E] hover:to-[#047857] dark:from-[#8ab4f8] dark:to-[#8ab4f8] dark:hover:from-[#aecbfa] dark:hover:to-[#aecbfa] dark:text-[#202124] dark:shadow-none',

  search:
    'bg-[#EBEAE5] border border-[#E8E6E1] shadow-[inset_0_1px_2px_rgba(44,43,40,0.04)] dark:bg-[#303134] dark:border-transparent dark:shadow-none',
  searchFocus:
    'ring-2 ring-[#0D9488]/20 border-[#0D9488]/40 dark:ring-[#8ab4f8]/25 dark:border-[#8ab4f8]/30',

  input:
    'bg-[#EBEAE5] border border-[#E8E6E1] focus:border-[#0D9488]/45 focus:bg-[#FAF9F6] dark:bg-[#303134] dark:border-[#5f6368] dark:focus:border-[#8ab4f8]',

  chip: 'bg-[#D1FAE5] text-[#047857] dark:bg-[#3c4043] dark:text-[#9aa0a6]',
  code: 'bg-[#FFEDD5] text-[#EA580C] dark:bg-[#3c4043] dark:text-[#8ab4f8]',

  /* Email rows */
  rowActive:
    'bg-[rgba(13,148,136,0.08)] shadow-[inset_3px_0_0_0_#0D9488] dark:bg-[#3c4043]/60 dark:shadow-[inset_3px_0_0_0_#8ab4f8]',
  rowUnread: 'font-semibold text-[#2C2B28] dark:text-[#e8eaed]',
  rowRead: 'font-normal text-[#5C5A54] dark:text-[#9aa0a6]',
  rowCard:
    'rounded-lg mx-1 border border-transparent transition-colors hover:bg-[rgba(13,148,136,0.05)] dark:hover:bg-[#3c4043]/50',
  avatar:
    'bg-[#E0F2F1] text-[#0D9488] ring-1 ring-[#0D9488]/20 dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8] dark:ring-[#8ab4f8]/25',

  iconWell: 'bg-[#FFEDD5] text-[#EA580C] dark:bg-[#3c4043] dark:text-[#8ab4f8]',

  /* Chat / agent */
  chatUser:
    'bg-gradient-to-br from-[#0D9488] to-[#059669] text-white shadow-sm dark:bg-[#8ab4f8] dark:from-[#8ab4f8] dark:to-[#8ab4f8] dark:text-[#202124]',
  chatAgent:
    'border border-[#E8E6E1] bg-[#EBEAE5] text-[#2C2B28] dark:border-[#3c4043] dark:bg-[#292a2d] dark:text-[#e8eaed]',
  chatAttachment:
    'border border-[#E8E6E1] bg-[#FAF9F6] hover:border-[#0D9488]/40 dark:border-[#3c4043] dark:bg-[#292a2d] dark:hover:border-[#8ab4f8]',
  chatCopyBtn:
    'border border-[#D8D5CE] bg-[#FAF9F6] text-[#5C5A54] hover:bg-[#E0F2F1] hover:text-[#0D9488] dark:border-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6] dark:hover:bg-[#292a2d] dark:hover:text-[#8ab4f8]',

  accentHover: 'hover:text-[#0D9488] dark:hover:text-[#8ab4f8]',
  accentRing: 'focus:ring-[#0D9488]/22 dark:focus:ring-[#8ab4f8]/25',
  accentSoftBg: 'bg-[#E0F2F1] text-[#0D9488] dark:bg-[#8ab4f8]/15 dark:text-[#8ab4f8]',
  accentSelected: 'bg-[rgba(13,148,136,0.14)] text-[#0D9488] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]',
  progressTrack: 'bg-[#E8E6E1] dark:bg-[#3c4043]',
  divider: 'bg-[#D8D5CE] dark:bg-[#5f6368]',
  online: 'bg-[#22c55e]',
  resizeHandle: 'hover:bg-[#0D9488]/18 dark:hover:bg-[#8ab4f8]/25',
  resizeHandleActive: 'bg-[#0D9488]/30 dark:bg-[#8ab4f8]/40',

  /* Toolbar / filter pills */
  filterBar:
    'rounded-lg border border-[#D8D5CE] bg-[#EBEAE5] p-0.5 dark:border-[#3c4043] dark:bg-[#303134]',
  filterActive:
    'bg-[#FAF9F6] text-[#2C2B28] shadow-[0_1px_3px_rgba(44,43,40,0.06)] ring-1 ring-[#0D9488]/15 dark:bg-[#3c4043] dark:text-[#e8eaed] dark:shadow-none dark:ring-0',
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
