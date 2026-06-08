import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannersTab } from "@/components/admin/BannersTab";
import { VersionManagerTab } from "@/components/admin/VersionManagerTab";
import { KeyFeaturesTab } from "@/components/admin/KeyFeaturesTab";
import { DownloadConfigTab } from "@/components/admin/DownloadConfigTab";

export const Route = createFileRoute("/admin/dashboard/content")({
  component: AppContentPage,
});

function AppContentPage() {
  const [activeTab, setActiveTab] = useState("banners");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Management
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          App <span className="text-gradient">Content</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage banners, versions, features, and page configuration.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/60 border border-border/60">
          <TabsTrigger value="banners">Banners & Notices</TabsTrigger>
          <TabsTrigger value="versions">Version Manager</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
          <TabsTrigger value="config">Download Config</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <BannersTab />
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <VersionManagerTab />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <KeyFeaturesTab />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <DownloadConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
