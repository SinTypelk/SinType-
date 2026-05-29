import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const VALID_EMAIL = "udaperuweaththadassi@gamail.com";
const VALID_PASSWORD = "Aththa@2007";
const STORAGE_KEY = "sintype_admin_auth_v1";

interface AdminAuthCtx {
  isAuthed: boolean;
  email: string | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const Ctx = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEmail(JSON.parse(raw).email);
    } catch {
      // ignore
    }
  }, []);

  const login = (e: string, p: string) => {
    if (e.trim() !== VALID_EMAIL || p !== VALID_PASSWORD) {
      return { ok: false, error: "Invalid email or password." };
    }
    setEmail(e.trim());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: e.trim() }));
    return { ok: true };
  };

  const logout = () => {
    setEmail(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Ctx.Provider value={{ isAuthed: !!email, email, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return v;
}
