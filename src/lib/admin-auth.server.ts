const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_JWT_SECRET?.trim();
  return { email, password, secret };
}

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

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export function adminAuthConfigured(): boolean {
  const { email, password, secret } = getAdminCredentials();
  return Boolean(email && password && secret);
}

export function validateAdminLogin(email: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (!creds.email || !creds.password) return false;
  return email.trim() === creds.email && password === creds.password;
}

export async function createAdminToken(email: string): Promise<string> {
  const { secret } = getAdminCredentials();
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not configured");
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ email: email.trim(), exp: Date.now() + TOKEN_TTL_MS })),
  );
  const sig = await hmacSign(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifyAdminToken(
  token: string | null | undefined,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const { secret } = getAdminCredentials();
  if (!secret) return { ok: false, error: "Admin auth is not configured on the server." };
  if (!token?.trim()) return { ok: false, error: "Missing admin token." };

  const parts = token.trim().split(".");
  if (parts.length !== 2) return { ok: false, error: "Invalid token format." };

  const [payload, sig] = parts;
  const valid = await hmacVerify(payload, sig, secret);
  if (!valid) return { ok: false, error: "Invalid token signature." };

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

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function requireAdmin(request: Request) {
  const token = getBearerToken(request);
  const result = await verifyAdminToken(token);
  if (!result.ok) {
    return {
      authorized: false as const,
      response: new Response(JSON.stringify({ error: result.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { authorized: true as const, email: result.email };
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
