import { supabase } from "@/integrations/supabase/client";
import { serializeReleaseNotes } from "@/lib/app-updates-service";

export type FeedbackType = "bug" | "feature_request";
export type FeedbackStatus = "pending" | "in_progress" | "resolved";

export type AdminUserRow = {
  id: string;
  email: string;
  licenseKey: string;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
};

export type AdminFeedbackRow = {
  id: string;
  userId: string | null;
  email: string | null;
  machineId: string;
  type: FeedbackType;
  typeLabel: string;
  message: string;
  createdAt: string;
  status: FeedbackStatus;
  statusLabel: string;
};

export type DashboardStats = {
  totalUsers: number;
  activeLicenses: number;
  pendingFeedback: number;
  pendingLicenseResets: number;
};

export type LicenseResetRequestRow = {
  id: string;
  machineId: string;
  boundEmail: string | null;
  message: string;
  status: "pending" | "resolved" | "rejected";
  createdAt: string;
  resolvedAt: string | null;
};

export type AppUpdateRecord = {
  id: string;
  version_number: string;
  download_url: string;
  release_notes: string;
  is_critical: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const TYPE_LABEL: Record<FeedbackType, string> = {
  bug: "Bug Report",
  feature_request: "Feature Request",
};

function mapFeedbackStatus(raw: string | null): FeedbackStatus {
  const s = (raw ?? "pending").toLowerCase().replace(/\s+/g, "_");
  if (s === "in_progress" || s === "inprogress") return "in_progress";
  if (s === "resolved") return "resolved";
  return "pending";
}

function licenseStatus(
  status: string | null,
  expiresAt: string | null,
): AdminUserRow["status"] {
  const s = (status ?? "active").toLowerCase();
  if (s === "revoked") return "revoked";
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return "expired";
  if (s === "expired") return "expired";
  return "active";
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [profilesRes, licensesRes, feedbackRes, resetRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("licenses")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString()),
    supabase
      .from("user_feedback")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("license_reset_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (licensesRes.error) throw new Error(licensesRes.error.message);
  if (feedbackRes.error) throw new Error(feedbackRes.error.message);
  if (resetRes.error) throw new Error(resetRes.error.message);

  return {
    totalUsers: profilesRes.count ?? 0,
    activeLicenses: licensesRes.count ?? 0,
    pendingFeedback: feedbackRes.count ?? 0,
    pendingLicenseResets: resetRes.count ?? 0,
  };
}

export async function fetchLicenseResetRequests(): Promise<LicenseResetRequestRow[]> {
  const { data, error } = await supabase
    .from("license_reset_requests")
    .select("id, machine_id, bound_email, message, status, created_at, resolved_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    machineId: row.machine_id,
    boundEmail: row.bound_email,
    message: row.message,
    status: (row.status as LicenseResetRequestRow["status"]) ?? "pending",
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  }));
}

/** Clear machine_id on licenses + revoke desktop binding (user can activate with new email). */
export async function resetDesktopBinding(machineId: string): Promise<void> {
  const mid = machineId.trim();
  if (!mid) throw new Error("Machine ID is required");

  const { error: rpcErr } = await supabase.rpc("admin_reset_desktop_binding", {
    p_machine_id: mid,
  });

  if (!rpcErr) return;

  const { error: licErr } = await supabase
    .from("licenses")
    .update({ machine_id: null })
    .eq("machine_id", mid);
  if (licErr) throw new Error(licErr.message);

  const { error: bindErr } = await supabase
    .from("desktop_bindings")
    .update({ revoked_at: new Date().toISOString(), bound_email: "[revoked]" })
    .eq("machine_id", mid);
  if (bindErr) throw new Error(bindErr.message);

  const { error: reqErr } = await supabase
    .from("license_reset_requests")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("machine_id", mid)
    .eq("status", "pending");
  if (reqErr) throw new Error(reqErr.message);
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, license_key, status, expires_at")
    .order("created_at", { ascending: false });

  if (pErr) throw new Error(pErr.message);

  const { data: licenses } = await supabase
    .from("licenses")
    .select("user_id, license_key, status, expires_at")
    .order("created_at", { ascending: false });

  const licenseByUser = new Map<string, (typeof licenses)[0]>();
  for (const row of licenses ?? []) {
    if (row.user_id && !licenseByUser.has(row.user_id)) {
      licenseByUser.set(row.user_id, row);
    }
  }

  return (profiles ?? []).map((p) => {
    const lic = licenseByUser.get(p.id);
    const expiresAt = lic?.expires_at ?? p.expires_at;
    const key = lic?.license_key ?? p.license_key;
    const st = licenseStatus(lic?.status ?? p.status, expiresAt);
    return {
      id: p.id,
      email: p.email,
      licenseKey: key,
      expiresAt,
      status: st,
    };
  });
}

export async function extendLicense30Days(userId: string): Promise<void> {
  const { data: profile, error: fetchErr } = await supabase
    .from("profiles")
    .select("expires_at, status")
    .eq("id", userId)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);

  const base =
    profile?.expires_at && new Date(profile.expires_at) > new Date()
      ? new Date(profile.expires_at)
      : new Date();
  base.setDate(base.getDate() + 30);
  const expiresIso = base.toISOString();
  const expiryDate = expiresIso.split("T")[0];

  const { error: pErr } = await supabase
    .from("profiles")
    .update({ expires_at: expiresIso, status: "active" })
    .eq("id", userId);

  if (pErr) throw new Error(pErr.message);

  const { error: lErr } = await supabase
    .from("licenses")
    .update({
      expires_at: expiresIso,
      expiry_date: expiryDate,
      status: "active",
      is_active: true,
    })
    .eq("user_id", userId);

  if (lErr) throw new Error(lErr.message);
}

export async function revokeUserLicense(userId: string): Promise<void> {
  const { error: pErr } = await supabase
    .from("profiles")
    .update({ status: "revoked" })
    .eq("id", userId);

  if (pErr) throw new Error(pErr.message);

  const { error: lErr } = await supabase
    .from("licenses")
    .update({ status: "revoked", is_active: false })
    .eq("user_id", userId);

  if (lErr) throw new Error(lErr.message);
}

export async function fetchAdminFeedback(): Promise<AdminFeedbackRow[]> {
  const { data, error } = await supabase
    .from("user_feedback")
    .select("id, user_id, email, machine_id, feedback_type, message, created_at, status")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const type = (row.feedback_type as FeedbackType) ?? "bug";
    const status = mapFeedbackStatus(row.status);
    return {
      id: row.id,
      userId: row.user_id,
      email: row.email,
      machineId: row.machine_id,
      type,
      typeLabel: TYPE_LABEL[type] ?? type,
      message: row.message,
      createdAt: row.created_at,
      status,
      statusLabel: STATUS_LABEL[status],
    };
  });
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<void> {
  const { error } = await supabase
    .from("user_feedback")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function sendNotification(params: {
  title: string;
  message: string;
  userId?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    title: params.title.trim(),
    message: params.message.trim(),
    user_id: params.userId?.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function publishAppUpdate(params: {
  version: string;
  downloadUrl: string;
  notes: string[];
  critical: boolean;
}): Promise<AppUpdateRecord> {
  const { data, error } = await supabase
    .from("app_updates")
    .insert({
      version_number: params.version.trim(),
      download_url: params.downloadUrl.trim(),
      release_notes: serializeReleaseNotes(params.notes),
      is_critical: params.critical,
    })
    .select("id, version_number, download_url, release_notes, is_critical, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as AppUpdateRecord;
}

export async function fetchRecentAppUpdates(limit = 10): Promise<AppUpdateRecord[]> {
  const { data, error } = await supabase
    .from("app_updates")
    .select("id, version_number, download_url, release_notes, is_critical, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AppUpdateRecord[];
}

export async function updateAppUpdate(
  id: string,
  patch: {
    version_number?: string;
    download_url?: string;
    release_notes?: string[];
    is_critical?: boolean;
  },
): Promise<AppUpdateRecord> {
  const body: Record<string, unknown> = {};
  if (patch.version_number !== undefined) {
    body.version_number = patch.version_number.trim();
  }
  if (patch.download_url !== undefined) {
    body.download_url = patch.download_url.trim();
  }
  if (patch.release_notes !== undefined) {
    body.release_notes = serializeReleaseNotes(patch.release_notes);
  }
  if (patch.is_critical !== undefined) {
    body.is_critical = patch.is_critical;
  }

  const { data, error } = await supabase
    .from("app_updates")
    .update(body)
    .eq("id", id)
    .select("id, version_number, download_url, release_notes, is_critical, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as AppUpdateRecord;
}

export async function deleteAppUpdate(id: string): Promise<void> {
  const { error } = await supabase.from("app_updates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
