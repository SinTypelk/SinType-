import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { SiteBanner } from "@/lib/app-content-service";

interface BannerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    message: string;
    show_on: "download" | "home" | "all";
    color_scheme: "warning" | "info" | "success" | "danger";
    is_active: boolean;
  }) => Promise<void>;
  initialData?: Partial<SiteBanner>;
  isLoading?: boolean;
}

export function BannerModal({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: BannerModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [message, setMessage] = useState(initialData?.message || "");
  const [showOn, setShowOn] = useState<"download" | "home" | "all">(
    (initialData?.show_on as any) || "all",
  );
  const [colorScheme, setColorScheme] = useState<
    "warning" | "info" | "success" | "danger"
  >((initialData?.color_scheme as any) || "info");
  const [isActive, setIsActive] = useState(initialData?.is_active || false);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      return;
    }
    await onSubmit({
      title: title.trim(),
      message: message.trim(),
      show_on: showOn,
      color_scheme: colorScheme,
      is_active: isActive,
    });
    setTitle("");
    setMessage("");
    setShowOn("all");
    setColorScheme("info");
    setIsActive(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Banner" : "Add Banner"}
          </DialogTitle>
          <DialogDescription>
            Create a site-wide banner or notice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banner-title">Title *</Label>
            <Input
              id="banner-title"
              placeholder="e.g., Maintenance Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-message">Message *</Label>
            <Textarea
              id="banner-message"
              placeholder="Banner message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="show-on">Show On</Label>
              <Select value={showOn} onValueChange={(v: any) => setShowOn(v)}>
                <SelectTrigger id="show-on" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="download">Download Only</SelectItem>
                  <SelectItem value="home">Home Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-scheme">Color</Label>
              <Select
                value={colorScheme}
                onValueChange={(v: any) => setColorScheme(v)}
              >
                <SelectTrigger id="color-scheme" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning (Orange)</SelectItem>
                  <SelectItem value="info">Info (Blue)</SelectItem>
                  <SelectItem value="success">Success (Green)</SelectItem>
                  <SelectItem value="danger">Danger (Red)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
            <Label htmlFor="is-active" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !title.trim() || !message.trim()}
            className="bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            {isLoading ? "Saving…" : "Save Banner"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
