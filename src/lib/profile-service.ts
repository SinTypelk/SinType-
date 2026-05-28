import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { generateLicenseKey } from "@/lib/license-service";

export type UserProfile = {
  id: string;
  email: string;
  license_key: string;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  license_key: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function rowToProfile(row: ProfileRow): UserProfile | null {
  if (!row?.id) return null;
  const email = (row.email ?? "").trim();
  const key = (row.license_key ?? "").trim();
  if (!email || !key) return null;
  return {
    id: row.id,
    email,
    license_key: key,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

export async function fetchProfileByUserId(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, license_key, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToProfile(data as ProfileRow);
}

/**
 * Ensure the logged-in user has exactly one permanent activation license key.
 * - keyed by `profiles.id = auth.users.id` (RLS-safe)
 * - only generates a key if missing
 */
export async function ensureProfileWithLicense(user: User): Promise<UserProfile> {
  if (!user?.id) throw new Error("Missing user id.");
  const email = (user.email ?? "").trim().toLowerCase();
  if (!email) throw new Error("Missing user email.");

  const existing = await fetchProfileByUserId(user.id);
  if (existing?.license_key) {
    // keep email in sync opportunistically
    if (existing.email.toLowerCase() !== email) {
      const { error } = await supabase
        .from("profiles")
        .update({ email })
        .eq("id", user.id);
      if (error) throw new Error(error.message);
      return { ...existing, email };
    }
    return existing;
  }

  const license_key = generateLicenseKey();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email,
        license_key,
      },
      { onConflict: "id" },
    )
    .select("id, email, license_key, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);
  const profile = rowToProfile(data as ProfileRow);
  if (!profile) throw new Error("Profile saved but could not be read back.");
  return profile;
}

