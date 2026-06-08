import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SUPABASE_CONFIGURED, supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/profile-service";
import { loadProfileForUser } from "@/lib/profile-service";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  authRedirectInProgress: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function hasOAuthCallbackParams(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash || "";
  const search = window.location.search || "";
  return (
    hash.includes("access_token=") ||
    hash.includes("refresh_token=") ||
    search.includes("code=") ||
    search.includes("error=")
  );
}

function cleanOAuthCallbackUrl(): void {
  if (typeof window === "undefined") return;
  try {
    window.history.replaceState({}, document.title, window.location.pathname || "/");
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRedirectInProgress, setAuthRedirectInProgress] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const initDoneRef = useRef(false);
  const oauthPendingRef = useRef(false);
  const urlCleanupTimerRef = useRef<number | null>(null);

  const syncProfile = async (u: User | null) => {
    if (!u) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const next = await loadProfileForUser(u);
      setProfile(next);
    } catch (err) {
      console.warn("[auth] profile sync failed:", err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      setAuthRedirectInProgress(false);
      setSession(null);
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    oauthPendingRef.current = hasOAuthCallbackParams();
    setAuthRedirectInProgress(oauthPendingRef.current);

    const applySession = (next: Session | null) => {
      setSession(next);
      void syncProfile(next?.user ?? null);
    };

    const finishBootstrap = () => {
      if (!initDoneRef.current) {
        initDoneRef.current = true;
      }
      setLoading(false);
    };

    const scheduleUrlCleanup = () => {
      if (!hasOAuthCallbackParams()) return;
      if (urlCleanupTimerRef.current !== null) {
        window.clearTimeout(urlCleanupTimerRef.current);
      }
      urlCleanupTimerRef.current = window.setTimeout(() => {
        urlCleanupTimerRef.current = null;
        if (hasOAuthCallbackParams()) {
          cleanOAuthCallbackUrl();
        }
        oauthPendingRef.current = false;
        setAuthRedirectInProgress(false);
      }, 1500);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") {
        applySession(nextSession);
        oauthPendingRef.current = hasOAuthCallbackParams() && !nextSession;
        setAuthRedirectInProgress(oauthPendingRef.current);
        finishBootstrap();
        if (nextSession && hasOAuthCallbackParams()) {
          scheduleUrlCleanup();
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        applySession(null);
        oauthPendingRef.current = false;
        setAuthRedirectInProgress(false);
        finishBootstrap();
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        applySession(nextSession);
        oauthPendingRef.current = false;
        setAuthRedirectInProgress(false);
        finishBootstrap();
        if (event === "SIGNED_IN" && hasOAuthCallbackParams()) {
          scheduleUrlCleanup();
        }
        return;
      }

      applySession(nextSession);
      finishBootstrap();
    });

    // Fallback for clients that do not emit INITIAL_SESSION promptly.
    void supabase.auth.getSession().then(({ data: { session: stored } }) => {
      if (initDoneRef.current) return;
      applySession(stored);
      oauthPendingRef.current = hasOAuthCallbackParams() && !stored;
      setAuthRedirectInProgress(oauthPendingRef.current);
      finishBootstrap();
      if (stored && hasOAuthCallbackParams()) {
        scheduleUrlCleanup();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (urlCleanupTimerRef.current !== null) {
        window.clearTimeout(urlCleanupTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };
  const signUp: AuthCtx["signUp"] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        loading,
        profileLoading,
        authRedirectInProgress,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
