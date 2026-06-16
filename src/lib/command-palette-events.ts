const TOGGLE_EVENT = 'relvion:toggle-command-palette';
const OPEN_EVENT = 'relvion:open-command-palette';

export function toggleCommandPalette() {
  window.dispatchEvent(new CustomEvent(TOGGLE_EVENT));
}

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function subscribeCommandPalette(
  handlers: { onToggle?: () => void; onOpen?: () => void }
) {
  const onToggle = () => handlers.onToggle?.();
  const onOpen = () => handlers.onOpen?.();
  window.addEventListener(TOGGLE_EVENT, onToggle);
  window.addEventListener(OPEN_EVENT, onOpen);
  return () => {
    window.removeEventListener(TOGGLE_EVENT, onToggle);
    window.removeEventListener(OPEN_EVENT, onOpen);
  };
}
