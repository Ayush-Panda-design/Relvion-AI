/** Gmail-accurate design tokens (soft dark gray, not high-contrast black). */

export type Density = 'compact' | 'default' | 'comfortable';

export const DENSITY_STORAGE_KEY = 'relvion-density';

export const dash = {
  bg: 'bg-[#f6f8fc] dark:bg-[#202124]',
  sidebar: 'bg-[#f6f8fc] dark:bg-[#202124]',
  surface: 'bg-white dark:bg-[#202124]',
  elevated: 'bg-white dark:bg-[#292a2d]',
  hover: 'hover:bg-[#e8eaed] dark:hover:bg-[#3c4043]/70',
  border: 'border-[#dadce0] dark:border-[#3c4043]/80',
  text: 'text-[#202124] dark:text-[#e8eaed]',
  textMuted: 'text-[#5f6368] dark:text-[#9aa0a6]',
  textSubtle: 'text-[#80868b] dark:text-[#9aa0a6]',
  accent: 'text-[#1a73e8] dark:text-[#8ab4f8]',
  accentBg: 'bg-[#1a73e8] hover:bg-[#1967d2] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] dark:text-[#202124]',
  accentSoft:
    'bg-[#d3e3fd] text-[#041e49] dark:bg-[#394457] dark:text-[#c2e7ff]',
  compose:
    'bg-[#c2e7ff] text-[#001d35] shadow-sm hover:shadow-md dark:bg-[#36373a] dark:text-[#e8eaed] dark:hover:bg-[#3c4043] dark:shadow-[0_1px_3px_1px_rgba(0,0,0,.45)]',
  search:
    'bg-[#eaf1fb] dark:bg-[#303134] shadow-sm dark:shadow-[0_1px_3px_1px_rgba(0,0,0,0.45)]',
  searchFocus: 'ring-2 ring-[#1a73e8]/25 dark:ring-[#8ab4f8]/20',
  input:
    'bg-[#f1f3f4] dark:bg-[#303134] border-transparent focus:bg-white dark:focus:bg-[#303134]',
  rowActive: 'bg-[#d3e3fd]/50 dark:bg-[#3c4043]',
  rowUnread: 'font-semibold text-[#202124] dark:text-[#e8eaed]',
  rowRead: 'font-normal text-[#202124] dark:text-[#e8eaed]',
  avatar: 'bg-[#1a73e8]/15 text-[#1a73e8] dark:bg-[#8ab4f8]/15 dark:text-[#8ab4f8]',
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
