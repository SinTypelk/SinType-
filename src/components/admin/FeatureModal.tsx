import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import type { KeyFeature } from "@/lib/app-content-service";

interface FeatureModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    icon: string;
    title: string;
    description: string;
    page: "home" | "download";
    is_visible: boolean;
  }) => Promise<void>;
  initialData?: Partial<KeyFeature>;
  isLoading?: boolean;
}

export function FeatureModal({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FeatureModalProps) {
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [page, setPage] = useState<"home" | "download">(
    (initialData?.page as any) || "home",
  );
  const [isVisible, setIsVisible] = useState(initialData?.is_visible ?? true);

  const handleSubmit = async () => {
    if (!icon.trim() || !title.trim() || !description.trim()) {
      return;
    }
    await onSubmit({
      icon: icon.trim(),
      title: title.trim(),
      description: description.trim(),
      page,
      is_visible: isVisible,
    });
    setIcon("");
    setTitle("");
    setDescription("");
    setPage("home");
    setIsVisible(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Feature" : "Add Feature"}
          </DialogTitle>
          <DialogDescription>
            Add a key feature for home or download page
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature-icon">Icon *</Label>
            <Input
              id="feature-icon"
              placeholder="e.g., 🚀 or icon-name"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter emoji or icon name
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-title">Title *</Label>
            <Input
              id="feature-title"
              placeholder="e.g., Fast Conversion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-description">Description *</Label>
            <Textarea
              id="feature-description"
              placeholder="Feature description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-page">Page</Label>
            <Select value={page} onValueChange={(v: any) => setPage(v)}>
              <SelectTrigger id="feature-page" disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home Page</SelectItem>
                <SelectItem value="download">Download Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
            <Switch
              id="feature-visible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
              disabled={isLoading}
            />
            <Label htmlFor="feature-visible" className="cursor-pointer">
              Visible
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
            disabled={
              isLoading ||
              !icon.trim() ||
              !title.trim() ||
              !description.trim()
            }
            className="bg-[image:var(--gradient-primary)] text-primary-foreground"
          >
            {isLoading ? "Saving…" : "Save Feature"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
