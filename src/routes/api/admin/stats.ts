import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, requireAdmin } from "@/lib/admin-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireAdmin(request);
        if (!auth.authorized) return auth.response;

        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [profilesRes, licensesRes, feedbackRes, resetRes, usageRes, updateRes] =
          await Promise.all([
            supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
            supabaseAdmin
              .from("licenses")
              .select("id", { count: "exact", head: true })
              .eq("status", "active")
              .gt("expires_at", new Date().toISOString()),
            supabaseAdmin
              .from("user_feedback")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending"),
            supabaseAdmin
              .from("license_reset_requests")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending"),
            supabaseAdmin
              .from("app_usage")
              .select("session_id")
              .gte("created_at", dayAgo),
            supabaseAdmin
              .from("app_updates")
              .select("version_number, download_url")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

        const usageRows = usageRes.data ?? [];
        const totalAppSessions = new Set(
          usageRows.map((r) => r.session_id).filter(Boolean),
        ).size;

        return jsonResponse({
          totalUsers: profilesRes.count ?? 0,
          activeLicenses: licensesRes.count ?? 0,
          pendingFeedback: feedbackRes.count ?? 0,
          pendingLicenseResets: resetRes.count ?? 0,
          totalAppSessions,
          latestDownloadUrl: updateRes.data?.download_url ?? null,
          latestVersion: updateRes.data?.version_number ?? null,
        });
      },
    },
  },
});
