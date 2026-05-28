import { supabase } from "@/integrations/supabase/client";

export const LICENSE_DAYS = 7;
export const SEVEN_DAYS_MS = LICENSE_DAYS * 24 * 60 * 60 * 1000;

export interface UserLicense {
  license_key: string;
  email: string;
  created_at: string;
  /** Absolute expiry (from `expires_at` or created_at + 7 days). */
  expires_at: string;
  expiry_date: string;
  status: string;
  is_active: boolean;
}

export interface GeneratedLicense {
  key: string;
  created_at: number;
  expires_at: number;
  expiry_date: string;
}

function segment(): string {
  const bytes = new Uint8Array(2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function generateLicenseKey(): string {
  return `STKR-${segment()}-${segment()}-${segment()}`;
}

/** Expiry = exactly 7 days after `created_at`. */
export function computeExpiresAtFromCreated(createdAt: Date): Date {
  return new Date(createdAt.getTime() + SEVEN_DAYS_MS);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type LicenseRow = {
  license_key: string | null;
  email: string | null;
  created_at: string | null;
  expires_at: string | null;
  expiry_date: string | null;
  status: string | null;
  is_active: boolean | null;
};

function resolveExpiresAtIso(row: LicenseRow): string | null {
  if (row.expires_at) {
    return row.expires_at;
  }
  if (row.created_at) {
    return computeExpiresAtFromCreated(new Date(row.created_at)).toISOString();
  }
  if (row.expiry_date) {
    return new Date(`${row.expiry_date}T23:59:59.999Z`).toISOString();
  }
  return null;
}

function isLicenseRowActive(row: LicenseRow): boolean {
  const status = (row.status ?? "active").toLowerCase();
  if (status === "expired" || status === "revoked") {
    return false;
  }
  if (row.is_active === false) {
    return false;
  }
  const expiresIso = resolveExpiresAtIso(row);
  if (!expiresIso) {
    return false;
  }
  return new Date(expiresIso).getTime() > Date.now();
}

function rowToUserLicense(row: LicenseRow): UserLicense | null {
  const key = row.license_key?.trim();
  const email = row.email?.trim();
  if (!key || !email) {
    return null;
  }
  const createdAt = row.created_at ?? new Date().toISOString();
  const expiresIso = resolveExpiresAtIso(row) ?? computeExpiresAtFromCreated(new Date(createdAt)).toISOString();
  const expiryDate =
    row.expiry_date ?? new Date(expiresIso).toISOString().split("T")[0];

  return {
    license_key: key,
    email,
    created_at: createdAt,
    expires_at: expiresIso,
    expiry_date: expiryDate,
    status: row.status ?? "active",
    is_active: row.is_active !== false,
  };
}

/** Most recent non-expired license for this email. */
export async function fetchActiveLicenseForEmail(
  email: string,
): Promise<UserLicense | null> {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from("licenses")
    .select(
      "license_key, email, created_at, expires_at, expiry_date, status, is_active",
    )
    .eq("email", normalized)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as LicenseRow[];
  for (const row of rows) {
    if (isLicenseRowActive(row)) {
      const license = rowToUserLicense(row);
      if (license) {
        return license;
      }
    }
  }
  return null;
}

/** Return existing active license or create a new 7-day key. */
export async function getOrCreateSevenDayLicense(
  email: string,
): Promise<UserLicense> {
  const existing = await fetchActiveLicenseForEmail(email);
  if (existing) {
    return existing;
  }
  return createSevenDayLicense(email);
}

/** Create a new 7-day license; `expires_at` is always created_at + 7 days. */
export async function createSevenDayLicense(
  email: string,
): Promise<UserLicense> {
  const normalized = normalizeEmail(email);
  const createdAt = new Date();
  const expiresAt = computeExpiresAtFromCreated(createdAt);
  const expiryDate = expiresAt.toISOString().split("T")[0];
  const key = generateLicenseKey();

  const { data, error } = await supabase
    .from("licenses")
    .insert({
      email: normalized,
      license_key: key,
      key_code: key,
      expiry_date: expiryDate,
      expires_at: expiresAt.toISOString(),
      is_active: true,
      status: "active",
      machine_id: null,
      is_ad_key: false,
    })
    .select(
      "license_key, email, created_at, expires_at, expiry_date, status, is_active",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const license = rowToUserLicense(data as LicenseRow);
  if (!license) {
    throw new Error("License was created but could not be read back.");
  }
  return license;
}

/** @deprecated Use UserLicense — kept for copy/progress helpers. */
export function userLicenseToDisplay(license: UserLicense): GeneratedLicense {
  const createdMs = new Date(license.created_at).getTime();
  const expiresMs = new Date(license.expires_at).getTime();
  return {
    key: license.license_key,
    created_at: createdMs,
    expires_at: expiresMs,
    expiry_date: license.expiry_date,
  };
}
