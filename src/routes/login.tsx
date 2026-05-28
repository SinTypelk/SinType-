import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, Zap } from "lucide-react";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Sintype.lk" },
      {
        name: "description",
        content:
          "Sign in to Sintype.lk to generate activation keys and sync your phone with your desktop.",
      },
    ],
  }),
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.4 4.5 9.8 8.8 6.3 14.1z" />
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-4.9c-2 1.4-4.4 2.3-6.9 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.7 39.1 16.3 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6 4.9c-.4.4 6.7-4.9 6.7-14.2 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const target = redirect && redirect.startsWith("/") ? redirect : "/license";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (user) navigate({ to: target });
  }, [user, navigate, target]);

  const signInGoogle = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setMsg(error.message);
      setBusy(false);
    }
  };

  const onEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) {
      setMsg(error);
      return;
    }
    if (mode === "signup") {
      setMsg("Check your email to confirm your account, then sign in.");
      return;
    }
    navigate({ to: target });
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Zap className="w-10 h-10 text-[var(--neon-cyan)] logo-glow mx-auto" />
        <h1 className="font-display text-3xl neon-text mt-3">Welcome to Sintype</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to generate activation keys and use mobile sync.
        </p>
      </div>

      <div className="neon-border p-6 space-y-4">
        <form onSubmit={onEmailAuth} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-primary-foreground disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
            }}
          >
            <LogIn className="w-4 h-4" />
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={signInGoogle}
          disabled={busy}
          className="group w-full relative inline-flex items-center justify-center gap-3 py-3 rounded-lg font-semibold bg-background border border-border hover:border-[var(--neon-cyan)] transition-all disabled:opacity-60"
        >
          <GoogleIcon />
          <span>{busy ? "Redirecting…" : "Sign in with Google"}</span>
        </button>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button type="button" className="underline" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Have an account?{" "}
              <button type="button" className="underline" onClick={() => setMode("signin")}>
                Sign in
              </button>
            </>
          )}
        </p>

        {msg && <p className="text-sm text-destructive text-center">{msg}</p>}

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">Privacy</Link>.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        <Link to="/">← Back to converter</Link>
      </p>
    </section>
  );
}
