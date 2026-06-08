import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  MessageSquareWarning,
  Bell,
  Rocket,
  KeyRound,
  LogOut,
  BookOpen,
  FileText,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth-context";

const items = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users & Licenses", url: "/admin/dashboard/users", icon: Users },
  {
    title: "License resets",
    url: "/admin/dashboard/license-resets",
    icon: KeyRound,
  },
  { title: "Feedback & Bugs", url: "/admin/dashboard/feedback", icon: MessageSquareWarning },
  { title: "Notifications", url: "/admin/dashboard/notifications", icon: Bell },
  { title: "App Updates", url: "/admin/dashboard/updates", icon: Rocket },
  { title: "Blog Manager", url: "/admin/dashboard/blog", icon: BookOpen },
  { title: "App Content", url: "/admin/dashboard/content", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { email, logout } = useAdminAuth();

  const isActive = (url: string) =>
    url === "/admin/dashboard"
      ? path === "/admin/dashboard" || path === "/admin/dashboard/"
      : path.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <BrandLogo
            className="h-9 w-9 rounded-lg"
            alt="SinType admin dashboard logo"
          />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-gradient">
                SinType
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Admin Console
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex flex-col gap-2 p-2">
            <div className="rounded-md bg-sidebar-accent/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Signed in
              </p>
              <p className="truncate text-xs font-medium text-sidebar-foreground">{email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={logout} className="mx-auto my-2">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
