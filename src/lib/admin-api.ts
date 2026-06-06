import { TOKEN_TTL_MS, createAdminToken } from "@/lib/admin-token";

const STORAGE_KEY = "sintype_admin_auth_v2";

type StoredAdminSession = {
  email: string;
  token: string;
  exp: number;
};

function getClientFallbackCreds() {
  const env = import.meta.env as ImportMetaEnv & {
    VITE_ADMIN_EMAIL?: string;
    VITE_ADMIN_PASSWORD?: string;
    VITE_ADMIN_JWT_SECRET?: string;
    VITE_ADMIN_FALLBACK_LOGIN?: string;
  };
  if (env.VITE_ADMIN_FALLBACK_LOGIN !== "true") return null;
  const email = env.VITE_ADMIN_EMAIL?.trim();
  const password = env.VITE_ADMIN_PASSWORD;
  const secret = env.VITE_ADMIN_JWT_SECRET?.trim();
  if (!email || !password || !secret) return null;
  return { email, password, secret };
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAdminSession;
    if (!parsed.token || Date.now() > parsed.exp) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

export function saveAdminSession(email: string, token: string, expMs: number) {
  const payload: StoredAdminSession = { email, token, exp: expMs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("sintype_admin_auth_v1");
}

export function getStoredAdminEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as StoredAdminSession).email ?? null;
  } catch {
    return null;
  }
}

async function tryClientFallbackLogin(
  email: string,
  password: string,
): Promise<{ ok: true; email: string; token: string; exp: number } | { ok: false; error: string }> {
  const creds = getClientFallbackCreds();
  if (!creds) {
    return {
      ok: false,
      error:
        "Admin API is unavailable. Deploy the server worker or enable VITE_ADMIN_FALLBACK_LOGIN for static hosting.",
    };
  }
  if (email.trim() !== creds.email || password !== creds.password) {
    return { ok: false, error: "Invalid email or password." };
  }
  const token = await createAdminToken(email, creds.secret);
  return { ok: true, email: creds.email, token, exp: Date.now() + TOKEN_TTL_MS };
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await res.json()) as {
        token?: string;
        email?: string;
        error?: string;
        exp?: number;
      };
      if (res.ok && body.token && body.email) {
        saveAdminSession(body.email, body.token, body.exp ?? Date.now() + TOKEN_TTL_MS);
        return { ok: true, email: body.email };
      }
      if (!res.ok) {
        return { ok: false, error: body.error ?? "Login failed" };
      }
    }

    const fallback = await tryClientFallbackLogin(email, password);
    if (fallback.ok) {
      saveAdminSession(fallback.email, fallback.token, fallback.exp);
      return { ok: true, email: fallback.email };
    }
    return {
      ok: false,
      error:
        fallback.error ??
        "Admin API returned an invalid response. Check server deployment and environment variables.",
    };
  } catch {
    const fallback = await tryClientFallbackLogin(email, password);
    if (fallback.ok) {
      saveAdminSession(fallback.email, fallback.token, fallback.exp);
      return { ok: true, email: fallback.email };
    }
    return { ok: false, error: fallback.error ?? "Network error — could not reach admin login." };
  }
}

export async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAdminToken();
  if (!token) throw new Error("Not signed in. Please log in again.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, { ...init, headers });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "Admin API unavailable (static host?). Enable VITE_ADMIN_FALLBACK_LOGIN or deploy the server worker.",
    );
  }

  const body = (await res.json()) as T & { error?: string };
  if (res.status === 401) {
    clearAdminSession();
    throw new Error(body.error ?? "Session expired. Please sign in again.");
  }
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}
