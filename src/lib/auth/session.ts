const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
const COOKIE_NAME = 'relvion_session';

export interface SessionPayload {
  userId: string;
  tenantId: string;
  email: string;
}

const encoder = new TextEncoder();

function base64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const arr = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(base64urlStr: string): string {
  let b64 = base64urlStr.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  return atob(b64);
}

async function getKey() {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function sign(data: string): Promise<string> {
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64urlEncode(signature);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const dataStr = JSON.stringify(payload);
  const dataB64 = base64urlEncode(encoder.encode(dataStr));
  const sig = await sign(dataB64);
  return `${dataB64}.${sig}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) {
      console.warn('[verifySessionToken] No dot found in token');
      return null;
    }
    const dataB64 = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);
    if (!dataB64 || !sig) {
      console.warn('[verifySessionToken] Missing dataB64 or sig');
      return null;
    }

    const expectedSig = await sign(dataB64);
    if (sig !== expectedSig) {
      console.warn('[verifySessionToken] Signature mismatch');
      return null;
    }

    const jsonStr = base64urlDecode(dataB64);
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
      
      // Validate it's a proper SessionPayload (not a Corsair state token etc.)
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        (typeof parsed.userId === 'string' || typeof parsed.userId === 'number') &&
        typeof parsed.tenantId === 'string' &&
        typeof parsed.email === 'string'
      ) {
        return {
          ...parsed,
          userId: String(parsed.userId)
        } as SessionPayload;
      }
    } catch (e: any) {
      console.warn(`[verifySessionToken] JSON parse error on string: ${jsonStr}`);
      throw e;
    }
    
    console.warn(`[verifySessionToken] SessionPayload shape mismatch:`, parsed);
    return null;
  } catch (e: any) {
    console.warn(`[verifySessionToken] Outer catch triggered:`, e?.message || e);
    return null;
  }
}

export { COOKIE_NAME };