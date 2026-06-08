import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Globe2, User2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendNotification } from "@/lib/admin-service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/notifications")({
  component: NotificationsPage,
});

type Mode = "global" | "private";

function NotificationsPage() {
  const [mode, setMode] = useState<Mode>("global");
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "private" && !target.trim()) {
      toast.error("Target User ID is required for private messages");
      return;
    }
    setSending(true);
    try {
      await sendNotification({
        title,
        message: body,
        userId: mode === "private" ? target.trim() : null,
      });
      toast.success(
        mode === "global"
          ? `Broadcast “${title}” sent to all users`
          : `Message sent to user ${target.trim()}`,
      );
      setTitle("");
      setBody("");
      setTarget("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Outbound
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Notifications</h1>
      </div>

      <Card className="max-w-2xl border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>Compose message</CardTitle>
          <CardDescription>
            Global broadcast uses a single row with no user_id. Private messages target one
            profile id.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSend} className="space-y-6">
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as Mode)}
              className="grid gap-3 sm:grid-cols-2"
            >
              <label
                htmlFor="m-global"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  mode === "global"
                    ? "border-primary/60 bg-primary/5 shadow-[var(--shadow-glow)]"
                    : "border-border/60 hover:bg-accent/5"
                }`}
              >
                <RadioGroupItem value="global" id="m-global" className="mt-0.5" />
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Globe2 className="h-4 w-4" /> Global Broadcast
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    One notification row visible to every user.
                  </p>
                </div>
              </label>
              <label
                htmlFor="m-private"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  mode === "private"
                    ? "border-primary/60 bg-primary/5 shadow-[var(--shadow-glow)]"
                    : "border-border/60 hover:bg-accent/5"
                }`}
              >
                <RadioGroupItem value="private" id="m-private" className="mt-0.5" />
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <User2 className="h-4 w-4" /> Private Message
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Insert with profiles.id as user_id.
                  </p>
                </div>
              </label>
            </RadioGroup>

            {mode === "private" && (
              <div className="space-y-2">
                <Label htmlFor="target">Target User ID (UUID)</Label>
                <Input
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="auth user / profile uuid"
                  className="font-mono"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New feature available"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message…"
                rows={5}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
