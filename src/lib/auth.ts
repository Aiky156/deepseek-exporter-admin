const COOKIE_NAME = 'dse_admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function getSecretKey(): string {
  return (
    process.env.COOKIE_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'dse-admin-super-secure-internal-fallback-secret-2026'
  );
}

// HMAC-SHA256 signer using Web Crypto API (works in Edge Runtime & Node.js)
async function getCryptoKey(): Promise<CryptoKey> {
  const secret = getSecretKey();
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp));
  const hexSig = bufferToHex(signature);
  return `${timestamp}.${hexSig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, hexSig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  if (Date.now() - timestamp > SESSION_DURATION || timestamp > Date.now() + 60000) {
    return false;
  }

  try {
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const signatureBytes = hexToBuffer(hexSig);
    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(timestampStr)
    );
  } catch {
    return false;
  }
}

export { COOKIE_NAME, SESSION_DURATION };
