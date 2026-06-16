export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export function isTrashKey(e: KeyboardEvent): boolean {
  if (!e.key) return false;
  return e.key === '#' || (e.key === '3' && e.shiftKey);
}

/** Safe lowercase key — some events (IME, dead keys) omit `key`. */
export function eventKey(e: KeyboardEvent | React.KeyboardEvent): string {
  return (e.key ?? '').toLowerCase();
}
