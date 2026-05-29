import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Ban, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  extendLicense30Days,
  fetchAdminUsers,
  revokeUserLicense,
  type AdminUserRow,
} from "@/lib/admin-service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/users")({
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await fetchAdminUsers());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        u.licenseKey.toLowerCase().includes(term),
    );
  }, [users, q]);

  const onExtend = async (u: AdminUserRow) => {
    setBusyId(u.id);
    try {
      await extendLicense30Days(u.id);
      toast.success(`Extended license for ${u.email} by 30 days`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Extend failed");
    } finally {
      setBusyId(null);
    }
  };

  const onRevoke = async (u: AdminUserRow) => {
    setBusyId(u.id);
    try {
      await revokeUserLicense(u.id);
      toast(`Revoked license for ${u.email}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Revoke failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Customer base
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Users & Licenses</h1>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">All accounts</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by email or license key…"
              className="pl-9"
            />
          </div>
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
                    <TableHead>Email</TableHead>
                    <TableHead>License Key</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No users match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((u) => (
                      <TableRow key={u.id} className="hover:bg-accent/5">
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {u.licenseKey}
                        </TableCell>
                        <TableCell>
                          {u.expiresAt
                            ? new Date(u.expiresAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {u.status === "active" ? (
                            <Badge className="border-[var(--success)]/30 bg-[var(--success)]/15 text-[var(--success)] hover:bg-[var(--success)]/15">
                              ● Active
                            </Badge>
                          ) : u.status === "revoked" ? (
                            <Badge
                              variant="outline"
                              className="border-destructive/40 bg-destructive/10 text-destructive"
                            >
                              ● Revoked
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 bg-amber-500/10 text-amber-400"
                            >
                              ● Expired
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === u.id}
                              onClick={() => onExtend(u)}
                            >
                              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Extend 30 Days
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busyId === u.id}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => onRevoke(u)}
                            >
                              <Ban className="mr-1.5 h-3.5 w-3.5" /> Revoke
                            </Button>
                          </div>
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
