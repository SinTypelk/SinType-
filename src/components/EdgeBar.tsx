import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Download, KeyRound, HelpCircle, Info, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { LoginModal } from "@/components/LoginModal";

const items = [
  { to: "/", label: "Converter", icon: Home, exact: true },
  { to: "/download", label: "Desktop App", icon: Download },
  { to: "/license", label: "Get Key", icon: KeyRound },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
  { to: "/about", label: "About", icon: Info },
] as const;

const navBtnClass =
  "relative w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-150 hover:scale-105 active:scale-95";

const activePillClass =
  "absolute inset-0 rounded-2xl pointer-events-none edge-nav-active";

export function EdgeBar() {
  const { theme, setTheme } = useApp();
  const { user, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<string>("/license");
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/m/")) return null;

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const requiresAuth = (to: string) => to === "/download" || to === "/license";

  return (
    <aside
      className="fixed left-3 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col items-center gap-2 p-2 rounded-3xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
      style={{
        background: "color-mix(in oklab, var(--card) 55%, transparent)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
      }}
    >
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        redirectTo={loginRedirect}
      />
      <Link
        to="/"
        className="p-1.5 rounded-2xl"
        title="SinType home"
        aria-label="SinType home"
      >
        <BrandLogo className="w-8 h-8" alt="" aria-hidden />
      </Link>
      <div className="h-px w-8 bg-white/10 my-1" />

      <nav className="flex flex-col gap-1 relative">
        {items.map((it) => {
          const active = isActive(it.to, "exact" in it ? it.exact : false);
          const Icon = it.icon;
          const locked = requiresAuth(it.to) && !user;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="group relative"
              aria-label={locked ? `${it.label} (sign in required)` : it.label}
              onClick={(e) => {
                if (!locked) return;
                e.preventDefault();
                setLoginRedirect(it.to);
                setLoginOpen(true);
              }}
            >
              <div className={navBtnClass}>
                {active && <span className={activePillClass} aria-hidden />}
                <Icon
                  className={`relative w-5 h-5 transition-colors ${active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                  aria-hidden
                />
              </div>
              <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition border border-border bg-card/90 backdrop-blur">
                {locked ? `${it.label} (sign in)` : it.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="h-px w-8 bg-white/10 my-1" />

      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`${navBtnClass} text-muted-foreground hover:text-foreground`}
        aria-label="Toggle theme"
      >
        <span key={theme} className="edge-theme-icon">
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </span>
      </button>

      {user ? (
        <button
          type="button"
          onClick={signOut}
          className={`${navBtnClass} text-muted-foreground hover:text-foreground`}
          title={user.email ?? "Sign out"}
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" aria-hidden />
        </button>
      ) : (
        <Link to="/login" aria-label="Sign in">
          <div
            className={`${navBtnClass} text-primary-foreground`}
            style={{ background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))" }}
          >
            <LogIn className="w-5 h-5" aria-hidden />
          </div>
        </Link>
      )}
    </aside>
  );
}

/** Compact bottom dock for mobile (sm:hidden). */
export function EdgeDock() {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<string>("/license");
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/m/")) return null;
  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");
  const requiresAuth = (to: string) => to === "/download" || to === "/license";

  const dockBtnClass =
    "relative w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90";

  return (
    <div className="sm:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} redirectTo={loginRedirect} />
      <div
        className="flex items-center gap-1 p-1.5 rounded-full border border-white/10 shadow-2xl"
        style={{
          background: "color-mix(in oklab, var(--card) 60%, transparent)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        {items.map((it) => {
          const active = isActive(it.to, "exact" in it ? it.exact : false);
          const Icon = it.icon;
          const locked = requiresAuth(it.to) && !user;
          return (
            <Link
              key={it.to}
              to={it.to}
              aria-label={locked ? `${it.label} (sign in required)` : it.label}
              onClick={(e) => {
                if (!locked) return;
                e.preventDefault();
                setLoginRedirect(it.to);
                setLoginOpen(true);
              }}
            >
              <div className={dockBtnClass}>
                {active && (
                  <span
                    className="absolute inset-0 rounded-full pointer-events-none edge-nav-active"
                    aria-hidden
                  />
                )}
                <Icon
                  className={`relative w-4.5 h-4.5 ${active ? "text-foreground" : "text-muted-foreground"}`}
                  aria-hidden
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
