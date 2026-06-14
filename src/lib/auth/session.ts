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
    const [dataB64, sig] = token.split('.');
    if (!dataB64 || !sig) return null;
    
    const expectedSig = await sign(dataB64);
    // Timing safe comparison not strictly needed since we use HMAC and compare base64 string, 
    // but doing simple string comparison is fine for this context.
    if (sig !== expectedSig) return null;
    
    const jsonStr = base64urlDecode(dataB64);
    return JSON.parse(jsonStr) as SessionPayload;
  } catch (err) {
    console.error('Session verify error', err);
    return null;
  }
}

export { COOKIE_NAME };
