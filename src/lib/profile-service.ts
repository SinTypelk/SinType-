import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

const PROFILE_RETRY_MS = 600;
const PROFILE_MAX_ATTEMPTS = 6;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

export async function fetchProfileByUserId(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, license_key, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[profile] fetch failed:", error.message);
    return null;
  }
  if (!data) return null;
  return rowToProfile(data as ProfileRow);
}

/**
 * Load profile created by the DB trigger on auth.users.
 * Retries briefly so OAuth sign-in is not blocked while the trigger finishes.
 * Never throws — auth must keep working even if profile sync fails.
 */
export async function loadProfileForUser(
  user: User,
): Promise<UserProfile | null> {
  if (!user?.id) return null;

  for (let attempt = 1; attempt <= PROFILE_MAX_ATTEMPTS; attempt++) {
    const profile = await fetchProfileByUserId(user.id);
    if (profile) {
      const email = (user.email ?? "").trim().toLowerCase();
      if (email && profile.email.toLowerCase() !== email) {
        await supabase
          .from("profiles")
          .update({ email })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.warn("[profile] email sync:", error.message);
          });
        return { ...profile, email };
      }
      return profile;
    }
    if (attempt < PROFILE_MAX_ATTEMPTS) {
      await sleep(PROFILE_RETRY_MS);
    }
  }

  console.warn(
    "[profile] No row yet for user",
    user.id,
    "— check Supabase trigger public.handle_new_user on auth.users",
  );
  return null;
}

/** @deprecated Use loadProfileForUser — trigger creates the row on sign-up. */
export async function ensureProfileWithLicense(
  user: User,
): Promise<UserProfile | null> {
  return loadProfileForUser(user);
}
