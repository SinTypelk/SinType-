import { Link, useRouterState } from "@tanstack/react-router";
import { LogIn, LogOut, Moon, Sun, Bell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { fetchLiveUsageStats, type LiveUsageStats } from "@/lib/usage-stats";

export function Navbar() {
  const { theme, setTheme } = useApp();
  const { user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isMobileRoute = path.startsWith("/m/");
  const [stats, setStats] = useState<LiveUsageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchLiveUsageStats();
      if (!cancelled) {
        setStats(data);
        setLoadingStats(false);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (isMobileRoute) return null;

  const pings = stats?.pingsLast24h ?? 0;
  const sessions = stats?.activeSessions5m ?? 0;
  const unique = stats?.totalSessions ?? 0;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-center px-4 py-3 gap-4">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 absolute left-4" aria-label="SinType home">
          <BrandLogo
            className="w-7 h-7"
            alt="SinType logo — Singlish to Sinhala converter home"
          />
          <span className="font-display text-lg sm:text-xl font-bold tracking-wider neon-text hidden sm:inline">
            Sintype.lk
          </span>
        </Link>

        {/* Center: Try Converter Button */}
        <a href="/#converter" className="btn-converter-nav inline-flex items-center justify-center text-xs sm:text-sm">
          ⚡ Try Converter
        </a>

        {/* Right: Stats + Bell + Auth */}
        <div className="absolute right-4 flex items-center gap-3 sm:gap-4">
          {/* Live Stats Bar */}
          <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
            {loadingStats ? (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-muted-foreground">🖥️</span>
                  <span className="text-foreground font-semibold">{pings.toLocaleString()}</span>
                  <span className="text-muted-foreground hidden sm:inline">pings</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-muted-foreground">⚡</span>
                  <span className="text-foreground font-semibold">{sessions.toLocaleString()}</span>
                  <span className="text-muted-foreground hidden sm:inline">active</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-muted-foreground">👥</span>
                  <span className="text-foreground font-semibold">{unique.toLocaleString()}</span>
                  <span className="text-muted-foreground hidden sm:inline">24h</span>
                </div>
              </>
            )}
          </div>

          {/* Notification Bell */}
          <button
            className="p-2 rounded-md border border-border hover:bg-accent/30 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md border border-border hover:bg-accent/30 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Auth Button */}
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border hover:bg-accent/30"
              title={user.email ?? "Sign out"}
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden />{" "}
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))" }}
              aria-label="Sign in"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden />{" "}
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
