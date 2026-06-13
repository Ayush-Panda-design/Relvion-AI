/**
 * Extracts plain-text and HTML body from a Gmail message payload.
 * Handles: text/plain, text/html, multipart/alternative, multipart/mixed.
 * All parts are base64url-encoded by Gmail; we decode them here.
 */

interface GmailPart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
}

export interface ExtractedBody {
  text: string;
  html: string;
}

function decodeBase64Url(encoded: string): string {
  if (!encoded) return '';
  // Convert base64url to standard base64
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

function extractFromParts(parts: GmailPart[], result: ExtractedBody): void {
  for (const part of parts) {
    const mime = part.mimeType || '';

    if (mime === 'text/plain' && part.body?.data) {
      if (!result.text) result.text = decodeBase64Url(part.body.data);
    } else if (mime === 'text/html' && part.body?.data) {
      if (!result.html) result.html = decodeBase64Url(part.body.data);
    } else if (mime.startsWith('multipart/') && part.parts) {
      extractFromParts(part.parts, result);
    }
  }
}

export function extractBody(payload: GmailPart): ExtractedBody {
  const result: ExtractedBody = { text: '', html: '' };

  if (!payload) return result;

  const mime = payload.mimeType || '';

  // Simple single-part message
  if (mime === 'text/plain' && payload.body?.data) {
    result.text = decodeBase64Url(payload.body.data);
    return result;
  }
  if (mime === 'text/html' && payload.body?.data) {
    result.html = decodeBase64Url(payload.body.data);
    return result;
  }

  // Multipart — recurse into parts
  if (payload.parts) {
    extractFromParts(payload.parts, result);
  }

  return result;
}
