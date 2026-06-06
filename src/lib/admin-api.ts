const STORAGE_KEY = "sintype_admin_auth_v2";

type StoredAdminSession = {
  email: string;
  token: string;
  exp: number;
};

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

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as { token?: string; email?: string; error?: string; exp?: number };
  if (!res.ok) return { ok: false, error: body.error ?? "Login failed" };
  if (!body.token || !body.email) return { ok: false, error: "Invalid login response" };
  saveAdminSession(body.email, body.token, body.exp ?? Date.now() + 24 * 60 * 60 * 1000);
  return { ok: true, email: body.email };
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
  const body = (await res.json()) as T & { error?: string };
  if (res.status === 401) {
    clearAdminSession();
    throw new Error(body.error ?? "Session expired. Please sign in again.");
  }
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}
