/** HMAC token helpers — shared by server login and static-host client fallback. */

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bytesToBase64Url(new Uint8Array(sig));
}

export async function createAdminToken(email: string, secret: string): Promise<string> {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({ email: email.trim(), exp: Date.now() + TOKEN_TTL_MS }),
    ),
  );
  const sig = await hmacSign(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifyAdminToken(
  token: string,
  secret: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const parts = token.trim().split(".");
  if (parts.length !== 2) return { ok: false, error: "Invalid token format." };

  const [payload, sig] = parts;
  const expected = await hmacSign(payload, secret);
  if (expected.length !== sig.length) return { ok: false, error: "Invalid token signature." };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return { ok: false, error: "Invalid token signature." };

  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
      email?: string;
      exp?: number;
    };
    if (!json.email || typeof json.exp !== "number") {
      return { ok: false, error: "Invalid token payload." };
    }
    if (Date.now() > json.exp) return { ok: false, error: "Token expired." };
    return { ok: true, email: json.email };
  } catch {
    return { ok: false, error: "Invalid token payload." };
  }
}

export { TOKEN_TTL_MS };
