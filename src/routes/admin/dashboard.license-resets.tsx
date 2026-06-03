import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchLicenseResetRequests,
  resetDesktopBinding,
  type LicenseResetRequestRow,
} from "@/lib/admin-service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/license-resets")({
  component: LicenseResetsPage,
});

function LicenseResetsPage() {
  const [rows, setRows] = useState<LicenseResetRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchLicenseResetRequests());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);

  const onReset = async (row: LicenseResetRequestRow) => {
    if (
      !confirm(
        `Clear binding for machine ${row.machineId.slice(0, 12)}…?\n\n` +
          `Bound email: ${row.boundEmail ?? "unknown"}\n\n` +
          "User can activate again with a new Gmail on that PC.",
      )
    ) {
      return;
    }
    setBusyId(row.id);
    try {
      await resetDesktopBinding(row.machineId);
      toast.success("Machine binding cleared");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          License support
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Email reset requests</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          When a user forgets their bound Gmail or signed in with another account on the website,
          they send a request from the desktop License tab. Approve by clearing the machine
          binding — this removes <code className="text-xs">machine_id</code> from licenses and
          revokes the PC email lock.
        </p>
      </div>

      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Pending ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Bound email</TableHead>
                  <TableHead>Machine ID</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{row.boundEmail ?? "—"}</TableCell>
                    <TableCell className="max-w-[140px] truncate font-mono text-xs">
                      {row.machineId}
                    </TableCell>
                    <TableCell className="max-w-md text-sm">{row.message}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === row.id}
                        onClick={() => onReset(row)}
                      >
                        {busyId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="mr-1 h-4 w-4" />
                            Clear binding
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && rows.length > pending.length && (
        <Card className="border-border/60 bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows
                  .filter((r) => r.status !== "pending")
                  .slice(0, 30)
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs capitalize">{row.status}</TableCell>
                      <TableCell className="text-sm">{row.boundEmail ?? "—"}</TableCell>
                      <TableCell className="max-w-[120px] truncate font-mono text-xs">
                        {row.machineId}
                      </TableCell>
                      <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                        {row.message}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
