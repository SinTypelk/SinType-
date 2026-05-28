import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SUPABASE_CONFIGURED, supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authRedirectInProgress: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRedirectInProgress, setAuthRedirectInProgress] = useState(false);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      // Allow the app to run (converter/marketing pages) even if Supabase env vars
      // are not set. Auth/mobilesync/license pages will prompt for configuration.
      setLoading(false);
      setAuthRedirectInProgress(false);
      setSession(null);
      return;
    }

    const hasOAuthParams = () => {
      if (typeof window === "undefined") return false;
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      // Covers implicit flow (#access_token=...) and PKCE (?code=...)
      return (
        hash.includes("access_token=") ||
        hash.includes("refresh_token=") ||
        hash.includes("&access_token=") ||
        search.includes("code=") ||
        search.includes("error=")
      );
    };

    if (typeof window !== "undefined") {
      // Requested debugging: confirm whether code/tokens arrive before being wiped.
      // eslint-disable-next-line no-console
      console.log("Current URL:", window.location.href);
    }

    setAuthRedirectInProgress(hasOAuthParams());

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.log("Current URL:", window.location.href);
      }
      setSession(s);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setAuthRedirectInProgress(false);
      }
      setLoading(false);
    });
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setAuthRedirectInProgress(hasOAuthParams() && !data.session);

        // If we have an OAuth callback in the URL but no session yet, keep the app in
        // a loading state briefly to give Supabase time to exchange PKCE codes.
        if (hasOAuthParams() && !data.session) {
          setLoading(true);
        }
      })
      .finally(() => {
        // Delay clearing callback params until Supabase has had a chance to read them.
        // This prevents routers or eager URL cleanup from breaking the PKCE exchange.
        if (typeof window !== "undefined" && hasOAuthParams()) {
          window.setTimeout(() => {
            try {
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch {
              // ignore
            } finally {
              setAuthRedirectInProgress(false);
              setLoading(false);
            }
          }, 1200);
          return;
        }

        setLoading(false);
      });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };
  const signUp: AuthCtx["signUp"] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };
  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, loading, authRedirectInProgress, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
