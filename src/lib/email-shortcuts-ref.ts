import type { EmailShortcutHandlers } from '@/hooks/useKeyboardShortcuts';

/** Shared ref so email shortcuts survive route changes within the workspace shell. */
export const emailShortcutsRef: { current: EmailShortcutHandlers | null } = { current: null };
