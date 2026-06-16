export function hashContactKey(key: string): number {
  const normalized = key.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash + normalized.charCodeAt(i) * (i + 1)) % 10000;
  }
  return hash;
}

export function getContactInitials(from: string): string {
  const cleaned = from.replace(/<[^>]+>/g, '').replace(/"/g, '').trim();
  const name = cleaned || from;
  const parts = name.split(/\s+/).filter((p) => p.length > 0 && !p.includes('@'));
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1) {
    const word = parts[0].includes('@') ? parts[0].split('@')[0] : parts[0];
    if (word.length >= 2) return word.slice(0, 2).toUpperCase();
    return word[0]?.toUpperCase() || '?';
  }
  return '?';
}

/** 0–3 — subtle diagram-style variants, all theme-token based */
export function contactAvatarVariantIndex(key: string): number {
  return hashContactKey(key) % 4;
}
