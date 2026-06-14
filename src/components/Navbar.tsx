import { Link, useRouterState } from "@tanstack/react-router";
import { LogIn, LogOut, Moon, Sun, Bell, Loader2, Monitor, Zap, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { fetchLiveUsageStats, type LiveUsageStats } from "@/lib/usage-stats";
import { fetchActiveNotifications, type AppNotification } from "@/lib/notifications-service";

export function Navbar() {
  const { theme, setTheme } = useApp();
  const { user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isMobileRoute = path.startsWith("/m/");
  const [stats, setStats] = useState<LiveUsageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const updateScrollState = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      setScrolled(window.scrollY > 8);
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await fetchActiveNotifications(10);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
    setLoadingNotifications(false);
  };

  useEffect(() => {
    if (showNotificationPanel) {
      loadNotifications();
    }
  }, [showNotificationPanel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(e.target as Node)
      ) {
        setShowNotificationPanel(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNotificationPanel(false);
    };

    if (showNotificationPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showNotificationPanel]);

  if (isMobileRoute) return null;

  const pings = stats?.pingsLast24h ?? 0;
  const sessions = stats?.activeSessions5m ?? 0;
  const unique = stats?.totalSessions ?? 0;
  const unreadNotifications = notifications.length > 0;

  return (
    <header
      className={`site-navbar sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b transition-all duration-300 ${
        scrolled ? "site-navbar-scrolled border-[var(--neon-cyan)]/25" : "border-transparent"
      }`}
    >
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
        aria-hidden
      />
      <div className="max-w-7xl mx-auto flex items-center justify-center px-2 sm:px-4 py-3 gap-1.5 sm:gap-4">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-1 sm:gap-2 absolute left-2 sm:left-4" aria-label="SinType home">
          <BrandLogo
            className="w-6 h-6 sm:w-7 sm:h-7"
            alt="SinType logo — Singlish to Sinhala converter home"
          />
          <span className="font-display text-base sm:text-lg lg:text-xl font-bold tracking-wider neon-text hidden sm:inline">
            Sintype.lk
          </span>
        </Link>

        {/* Center: Try Converter Button */}
        <a href="/#converter" className="btn-converter-nav inline-flex items-center justify-center text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2">
          ⚡ Try Converter
        </a>

        {/* Right: Stats + Bell + Auth */}
        <div className="absolute right-2 sm:right-4 flex items-center gap-1 sm:gap-3 lg:gap-4">
          {/* Live Stats - Redesigned Chips */}
          <div className="hidden lg:flex items-center gap-2">
            {loadingStats ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                {/* Pings Chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-muted-foreground">Pings</span>
                  <span className="text-sm font-bold text-foreground">{pings.toLocaleString()}</span>
                </div>

                {/* Active Sessions Chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-muted-foreground">Active</span>
                  <span className="text-sm font-bold text-foreground">{sessions.toLocaleString()}</span>
                </div>

                {/* Unique Sessions Chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">24h</span>
                  <span className="text-sm font-bold text-foreground">{unique.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notificationPanelRef}>
            <button
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className="relative p-1.5 sm:p-2 rounded-md border border-border hover:bg-accent/30 transition"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {showNotificationPanel && (
              <div className="absolute right-0 mt-2 w-80 sm:w-72 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-9999" style={{ background: "rgba(10, 15, 30, 0.98)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)" }}>
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </h3>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/10 mb-3" />

                  {/* Content */}
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="flex justify-center mb-3">
                        <Bell className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <p className="text-xs text-muted-foreground">No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-2.5 rounded-md border border-white/5 bg-white/3 hover:bg-white/5 transition text-xs"
                        >
                          <p className="font-semibold text-foreground mb-0.5">{notif.title}</p>
                          <p className="text-muted-foreground text-xs leading-relaxed">{notif.message}</p>
                          {notif.link && (
                            <a
                              href={notif.link}
                              className="inline-block mt-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-medium"
                            >
                              Learn more →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle - Smaller on mobile */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 sm:p-2 rounded-md border border-border hover:bg-accent/30 transition hidden sm:inline-flex"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Auth Button */}
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-border hover:bg-accent/30"
              title={user.email ?? "Sign out"}
              aria-label="Sign out"
            >
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden />{" "}
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-semibold text-primary-foreground"
              style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))" }}
              aria-label="Sign in"
            >
              <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden />{" "}
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
