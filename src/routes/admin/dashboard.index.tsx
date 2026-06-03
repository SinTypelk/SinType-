import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, KeyRound, MessageSquareWarning, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchDashboardStats,
  fetchAdminFeedback,
  type AdminFeedbackRow,
  type DashboardStats,
} from "@/lib/admin-service";

export const Route = createFileRoute("/admin/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminFeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, feedback] = await Promise.all([
          fetchDashboardStats(),
          fetchAdminFeedback(),
        ]);
        if (!cancelled) {
          setStats(s);
          setRecent(feedback.slice(0, 5));
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
    { label: "Active Licenses", value: stats?.activeLicenses ?? 0, icon: KeyRound },
    { label: "Pending Feedbacks", value: stats?.pendingFeedback ?? 0, icon: MessageSquareWarning },
    {
      label: "License reset requests",
      value: stats?.pendingLicenseResets ?? 0,
      icon: KeyRound,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Overview
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Mission <span className="text-gradient">Control</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Live counts from Supabase — users, licenses, and feedback.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((s) => (
          <Card
            key={s.label}
            className="relative overflow-hidden border-border/60 bg-[image:var(--gradient-surface)]"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-3xl font-semibold tracking-tight">{s.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-accent" /> Recent feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback yet.</p>
          ) : (
            <ul className="divide-y divide-border/60 text-sm">
              {recent.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{f.typeLabel}</p>
                    <p className="text-muted-foreground line-clamp-1">{f.message}</p>
                  </div>
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                    {f.statusLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
