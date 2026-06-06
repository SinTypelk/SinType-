import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  adminLogin,
  clearAdminSession,
  getAdminToken,
  getStoredAdminEmail,
} from "@/lib/admin-api";

interface AdminAuthCtx {
  isAuthed: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const Ctx = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedEmail = getStoredAdminEmail();
    const token = getAdminToken();
    setEmail(token ? storedEmail : null);
    setReady(true);
  }, []);

  const login = async (e: string, p: string) => {
    const res = await adminLogin(e, p);
    if (!res.ok) return res;
    setEmail(res.email);
    return { ok: true };
  };

  const logout = () => {
    setEmail(null);
    clearAdminSession();
  };

  return (
    <Ctx.Provider
      value={{
        isAuthed: ready && !!email && !!getAdminToken(),
        email: ready ? email : null,
        login,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return v;
}
