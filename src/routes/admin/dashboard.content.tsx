import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannersTab } from "@/components/admin/BannersTab";
import { VersionManagerTab } from "@/components/admin/VersionManagerTab";
import { KeyFeaturesTab } from "@/components/admin/KeyFeaturesTab";
import { DownloadConfigTab } from "@/components/admin/DownloadConfigTab";
import { SiteSettingsTab } from "@/components/admin/SiteSettingsTab";
import { NotificationsListTab } from "@/components/admin/NotificationsListTab";
import { BlogPostsTab } from "@/components/admin/BlogPostsTab";

export const Route = createFileRoute("/admin/dashboard/content")({
  component: AppContentPage,
});

function AppContentPage() {
  const [activeTab, setActiveTab] = useState("notifications");

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
          Manage notifications, banners, versions, features, page configuration, site settings, and blog posts.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-card/60 border border-border/60">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="banners">Banners & Notices</TabsTrigger>
          <TabsTrigger value="versions">Version Manager</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
          <TabsTrigger value="config">Download Config</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsListTab />
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          <BlogPostsTab />
        </TabsContent>

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

        <TabsContent value="settings" className="space-y-4">
          <SiteSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
