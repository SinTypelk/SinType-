import { TOKEN_TTL_MS, createAdminToken as signToken, verifyAdminToken as verifyToken } from "./admin-token";

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_JWT_SECRET?.trim();
  return { email, password, secret };
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
  return signToken(email, secret);
}

export async function verifyAdminToken(
  token: string | null | undefined,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const { secret } = getAdminCredentials();
  if (!secret) return { ok: false, error: "Admin auth is not configured on the server." };
  if (!token?.trim()) return { ok: false, error: "Missing admin token." };
  return verifyToken(token, secret);
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
