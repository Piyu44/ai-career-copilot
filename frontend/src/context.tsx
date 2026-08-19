import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  api,
  consumeCredits,
  fileStorage,
  getSessionUser,
  getUsage,
  getUserCredits,
  hasEnoughCredits,
  loginUser,
  logout as apiLogout,
  registerUser,
  updateUser as apiUpdateUser,
  type PublicUser,
  type StoredResume,
  type UsageRecord,
} from "./services/api";
import { CREDIT_COSTS, type CreditAction } from "./data";
import { uid } from "./utils";

/* --------------------------------- toasts --------------------------------- */

export type ToastTone = "success" | "error" | "info" | "warning";
interface ToastItem {
  id: string;
  title: string;
  desc?: string;
  tone: ToastTone;
}

const ToastCtx = createContext<{ toast: (t: { title: string; desc?: string; tone?: ToastTone }) => void }>({
  toast: () => {},
});
export const useToast = () => useContext(ToastCtx);

const toneStyle: Record<ToastTone, { icon: React.ReactNode; bar: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, bar: "bg-emerald-500" },
  error: { icon: <XCircle className="h-5 w-5 text-rose-600" />, bar: "bg-rose-500" },
  info: { icon: <Info className="h-5 w-5 text-brand-600" />, bar: "bg-brand-600" },
  warning: { icon: <AlertTriangle className="h-5 w-5 text-amber-600" />, bar: "bg-amber-500" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((t: { title: string; desc?: string; tone?: ToastTone }) => {
    const id = uid();
    setItems((prev) => [...prev.slice(-3), { id, tone: "info", ...t }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4400);
  }, []);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(92vw,380px)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="glass-deep pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl p-4 pr-9 animate-fade-up"
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${toneStyle[t.tone].bar}`} />
            <span className="mt-0.5 shrink-0">{toneStyle[t.tone].icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900">{t.title}</p>
              {t.desc && <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{t.desc}</p>}
            </div>
            <button
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== t.id))}
              className="absolute right-2.5 top-2.5 text-ink-300 hover:text-ink-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------------------------- auth ---------------------------------- */

interface AuthCtxType {
  user: PublicUser | null;
  initializing: boolean;
  login: (email: string, pw: string) => PublicUser;
  register: (name: string, email: string, pw: string) => PublicUser;
  logout: () => void;
  updateUser: (patch: Partial<PublicUser>) => void;
  /** Gate an AI action behind the credit system. Returns false when blocked. */
  spendCredits: (action: CreditAction) => boolean;
  usage: UsageRecord[];
  refreshUsage: () => void;
}

const AuthCtx = createContext<AuthCtxType>(null as unknown as AuthCtxType);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [usage, setUsage] = useState<UsageRecord[]>([]);

  useEffect(() => {
    setUser(getSessionUser());
    setInitializing(false);
  }, []);

  const login = (email: string, pw: string) => {
    const u = loginUser(email, pw);
    setUser(u);
    return u;
  };
  const register = (name: string, email: string, pw: string) => {
    const u = registerUser(name, email, pw);
    setUser(u);
    return u;
  };
  const logout = () => {
    apiLogout();
    setUser(null);
    toast({ title: "Logged out", desc: "See you at the next interview!", tone: "info" });
  };
  const updateUser = (patch: Partial<PublicUser>) => {
    const u = apiUpdateUser(patch);
    if (u) setUser(u);
  };
  const refreshUsage = useCallback(() => {
    setUsage(getUsage());
  }, []);

  useEffect(() => {
    if (user) refreshUsage();
  }, [user, refreshUsage]);

  const spendCredits = (action: CreditAction) => {
    const cost = CREDIT_COSTS[action];
    if (!hasEnoughCredits(cost)) {
      toast({
        title: "Not enough credits",
        desc: `This action needs ${cost} credits and you have ${getUserCredits()}. Upgrade your plan to continue.`,
        tone: "warning",
      });
      return false;
    }
    try {
      const updated = consumeCredits(cost, action);
      setUser(updated);
      refreshUsage();
      return true;
    } catch (e: any) {
      toast({ title: "Credit error", desc: e?.message ?? "Something went wrong.", tone: "error" });
      return false;
    }
  };

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, updateUser, spendCredits, usage, refreshUsage }),
    [user, initializing, usage]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ---------------------------------- data ---------------------------------- */

interface DataCtxType {
  loading: boolean;
  analyses: any[];
  applications: any[];
  resumes: StoredResume[];
  notifs: any[];
  reload: () => Promise<void>;
  addAnalysis: (a: any) => Promise<any>;
  upsertApplication: (a: any) => Promise<void>;
  removeApplication: (id: string) => Promise<void>;
  saveResume: (r: StoredResume) => void;
  markNotifsRead: () => void;
  resetAll: () => void;
}

const DataCtx = createContext<DataCtxType>(null as unknown as DataCtxType);
export const useData = () => useContext(DataCtx);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [resumes, setResumes] = useState<StoredResume[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);

  const reload = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [a, ap] = await Promise.all([api.analyses.list(), api.applications.list()]);
    setAnalyses(a);
    setApplications(ap);
    setResumes(fileStorage.listResumes());
    setNotifs(api.notifs.list());
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addAnalysis = async (a: any) => {
    const saved = await api.analyses.create(a);
    setAnalyses((prev) => [saved, ...prev]);
    return saved;
  };
  const upsertApplication = async (a: any) => {
    await api.applications.save(a);
    setApplications(await api.applications.list());
  };
  const removeApplication = async (id: string) => {
    await api.applications.remove(id);
    setApplications((prev) => prev.filter((x) => x.id !== id));
  };
  const saveResume = (r: StoredResume) => {
    fileStorage.saveResume(r);
    setResumes(fileStorage.listResumes());
  };
  const markNotifsRead = () => {
    api.notifs.markAll();
    setNotifs(api.notifs.list());
  };
  const resetAll = () => {
    api.resetAll();
    reload();
    toast({ title: "Demo data reset", desc: "Fresh seed data loaded.", tone: "success" });
  };

  const value = useMemo(
    () => ({
      loading, analyses, applications, resumes, notifs, reload,
      addAnalysis, upsertApplication, removeApplication, saveResume, markNotifsRead, resetAll,
    }),
    [loading, analyses, applications, resumes, notifs, user]
  );

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

/* -------------------------------- providers ------------------------------- */

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>{children}</DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
