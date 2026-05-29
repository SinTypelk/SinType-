import { ReactNode } from "react";
import { Navigate, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAdminAuth } from "@/lib/admin-auth-context";

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { isAuthed } = useAdminAuth();
  if (!isAuthed) return <Navigate to="/admin" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]" />
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8">{children ?? <Outlet />}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
