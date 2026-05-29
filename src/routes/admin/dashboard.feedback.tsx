import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAdminFeedback,
  updateFeedbackStatus,
  type AdminFeedbackRow,
  type FeedbackStatus,
} from "@/lib/admin-service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/feedback")({
  component: FeedbackPage,
});

type FilterKey = "all" | "bug" | "feature_request";

const STATUS_OPTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

function FeedbackPage() {
  const [feedback, setFeedback] = useState<AdminFeedbackRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFeedback(await fetchAdminFeedback());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return feedback;
    return feedback.filter((f) => f.type === filter);
  }, [feedback, filter]);

  const onStatusChange = async (id: string, status: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(id, status);
      const label = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
      toast.success(`Status updated → ${label}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Product signal
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Feedback & Bugs</h1>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Submissions</CardTitle>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bug">Bug Reports</TabsTrigger>
              <TabsTrigger value="feature_request">Feature Requests</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-44">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No submissions in this filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((f) => (
                      <TableRow key={f.id} className="hover:bg-accent/5">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {f.email ?? f.userId ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              f.type === "bug"
                                ? "rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                                : "rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-foreground"
                            }
                          >
                            {f.typeLabel}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-2 text-sm">{f.message}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={f.status}
                            onValueChange={(v) => onStatusChange(f.id, v as FeedbackStatus)}
                          >
                            <SelectTrigger className="h-8 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
