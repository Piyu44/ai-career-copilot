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
  syncUserSession,
  updateUser as apiUpdateUser,
  DEMO_ACCOUNT,
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

import { onAuthStateChanged } from "firebase/auth";
import { ref, set, update, get } from "firebase/database";
import { auth, database } from "./services/firebase";
import {
  firebaseLogin,
  firebaseRegister,
  firebaseLogout,
  firebaseForgotPassword,
  firebaseSendEmailVerification,
  firebaseReloadUser,
} from "./services/firebaseAuth";
import { PLANS, type PlanId } from "./data";

/* ---------------------------------- auth ---------------------------------- */

export function formatFirebaseError(msg: string): string {
  if (!msg) return "An unexpected error occurred.";
  if (msg.includes("auth/email-already-in-use")) {
    return "An account with this email already exists.";
  }
  if (msg.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("auth/weak-password")) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (
    msg.includes("auth/user-not-found") ||
    msg.includes("auth/wrong-password") ||
    msg.includes("auth/invalid-credential")
  ) {
    return "Invalid email or password.";
  }
  if (
    msg.includes("auth/operation-not-allowed") ||
    msg.includes("CONFIGURATION_NOT_FOUND")
  ) {
    return "Email/Password sign-in is not enabled in your Firebase Console. Please go to Authentication → Sign-in method and enable Email/Password.";
  }
  if (msg.includes("auth/too-many-requests")) {
    return "Too many failed attempts. Please try again in a few minutes.";
  }
  return msg.replace("Firebase: ", "").replace(/\s*\(auth\/[^)]+\)\.?/g, "");
}

interface AuthCtxType {
  user: PublicUser | null;
  initializing: boolean;
  login: (email: string, pw: string) => Promise<PublicUser>;
  register: (name: string, email: string, pw: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<PublicUser>) => void;
  sendVerificationEmail: () => Promise<{ error: string | null }>;
  checkEmailVerified: () => Promise<boolean>;
  upgradePlan: (planId: PlanId, billing: "monthly" | "yearly", paymentId: string) => Promise<PublicUser>;
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
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let dbCredits = 10;
        let dbPlan: PlanId = "free";
        let dbName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";

        try {
          const snapshot = await get(ref(database, `users/${firebaseUser.uid}`));
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (typeof data.credits === "number") dbCredits = data.credits;
            if (data.plan) dbPlan = data.plan;
            if (data.name) dbName = data.name;
          } else {
            // First time user: save initial 10 credits to Realtime DB
            await set(ref(database, `users/${firebaseUser.uid}`), {
              id: firebaseUser.uid,
              name: dbName,
              email: firebaseUser.email || "",
              plan: "free",
              credits: 10,
              createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            });
          }
        } catch (dbErr) {
          console.warn("Could not read user profile from Realtime DB:", dbErr);
          const sessionUser = getSessionUser();
          if (sessionUser && sessionUser.id === firebaseUser.uid) {
            dbCredits = sessionUser.credits;
            dbPlan = sessionUser.plan;
          }
        }

        const u: PublicUser = {
          id: firebaseUser.uid,
          name: dbName,
          email: firebaseUser.email || "",
          plan: dbPlan,
          credits: dbCredits,
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(u);
        syncUserSession(u);
      } else {
        // Fallback to local session if present (for demo accounts)
        const sessionUser = getSessionUser();
        setUser(sessionUser);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pw: string): Promise<PublicUser> => {
    // Handle demo live account button
    if (email.toLowerCase() === DEMO_ACCOUNT.email.toLowerCase() && pw === DEMO_ACCOUNT.password) {
      try {
        const res = await firebaseLogin(email, pw);
        if (res.user) {
          const u: PublicUser = {
            id: res.user.uid,
            name: res.user.displayName || "Demo User",
            email: res.user.email || email,
            plan: "free",
            credits: 10,
            createdAt: res.user.metadata.creationTime || new Date().toISOString(),
            emailVerified: res.user.emailVerified,
          };
          setUser(u);
          return u;
        }
      } catch {
        // Fallback for pre-seeded offline demo account
      }
      const u = loginUser(email, pw);
      setUser(u);
      return u;
    }

    const res = await firebaseLogin(email, pw);
    if (res.error || !res.user) {
      throw new Error(formatFirebaseError(res.error || "Login failed"));
    }

    let dbCredits = 10;
    let dbPlan: PlanId = "free";
    let dbName = res.user.displayName || res.user.email?.split("@")[0] || "User";

    try {
      const snapshot = await get(ref(database, `users/${res.user.uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (typeof data.credits === "number") dbCredits = data.credits;
        if (data.plan) dbPlan = data.plan;
        if (data.name) dbName = data.name;
      }
    } catch (dbErr) {
      console.warn("Could not read user profile from Realtime DB on login:", dbErr);
    }

    const u: PublicUser = {
      id: res.user.uid,
      name: dbName,
      email: res.user.email || email,
      plan: dbPlan,
      credits: dbCredits,
      createdAt: res.user.metadata.creationTime || new Date().toISOString(),
      emailVerified: res.user.emailVerified,
    };
    setUser(u);
    syncUserSession(u);
    return u;
  };

  const register = async (name: string, email: string, pw: string): Promise<PublicUser> => {
    const res = await firebaseRegister(name, email, pw);
    if (res.error || !res.user) {
      throw new Error(formatFirebaseError(res.error || "Registration failed"));
    }

    const u: PublicUser = {
      id: res.user.uid,
      name: name.trim() || res.user.displayName || "User",
      email: res.user.email || email,
      plan: "free",
      credits: 10,
      createdAt: res.user.metadata.creationTime || new Date().toISOString(),
      emailVerified: res.user.emailVerified,
    };
    setUser(u);
    syncUserSession(u);
    return u;
  };

  const logout = async () => {
    await firebaseLogout();
    apiLogout();
    setUser(null);
    toast({ title: "Logged out", desc: "See you at the next interview!", tone: "info" });
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) return { error: "No user signed in" };
    const res = await firebaseSendEmailVerification(auth.currentUser);
    if (res.error) {
      toast({ title: "Failed to send", desc: formatFirebaseError(res.error), tone: "error" });
    } else {
      toast({
        title: "Verification email sent",
        desc: `Check your inbox at ${auth.currentUser.email} for the verification link.`,
        tone: "success",
      });
    }
    return res;
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    const refreshedUser = await firebaseReloadUser();
    if (!refreshedUser) return false;
    const isVerified = refreshedUser.emailVerified;
    if (user) {
      setUser({ ...user, emailVerified: isVerified });
    }
    if (isVerified) {
      toast({ title: "Email verified!", desc: "Your email has been confirmed successfully.", tone: "success" });
    } else {
      toast({ title: "Not verified yet", desc: "Please click the link sent to your email.", tone: "warning" });
    }
    return isVerified;
  };

  const upgradePlan = async (planId: PlanId, billing: "monthly" | "yearly", paymentId: string): Promise<PublicUser> => {
    const selectedPlan = PLANS.find((p) => p.id === planId) || PLANS[0];
    const newCredits = (user?.credits || 0) + selectedPlan.credits;

    const baseUser = user || {
      id: auth.currentUser?.uid || "guest",
      name: "User",
      email: "user@example.com",
      createdAt: new Date().toISOString(),
      emailVerified: false,
    };

    const updatedUser: PublicUser = {
      ...baseUser,
      plan: planId,
      credits: newCredits,
    };
    setUser(updatedUser);

    // Save to Firebase Realtime Database
    try {
      if (auth.currentUser) {
        await update(ref(database, `users/${auth.currentUser.uid}`), {
          plan: planId,
          credits: newCredits,
          updatedAt: new Date().toISOString(),
        });

        // Save transaction record
        await set(ref(database, `users/${auth.currentUser.uid}/transactions/${paymentId}`), {
          id: paymentId,
          planId,
          planName: selectedPlan.name,
          amount: billing === "monthly" ? selectedPlan.monthly : selectedPlan.yearly,
          billing,
          currency: "INR",
          createdAt: new Date().toISOString(),
          status: "success",
        });
      }
    } catch (dbErr) {
      console.warn("Could not save plan upgrade to Realtime Database:", dbErr);
    }

    try {
      apiUpdateUser({ plan: planId, credits: newCredits });
    } catch {
      // Local backup
    }

    toast({
      title: `Upgraded to ${selectedPlan.name} Plan! 🎉`,
      desc: `${selectedPlan.credits} credits added to your balance. Payment ID: ${paymentId}`,
      tone: "success",
    });

    return updatedUser;
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

  const spendCredits = (action: CreditAction): boolean => {
    const cost = CREDIT_COSTS[action] ?? 1;
    const currentCredits = user?.credits ?? 0;

    if (currentCredits < cost) {
      toast({
        title: "Not enough credits",
        desc: `This action needs ${cost} credits. You currently have ${currentCredits} credits. Upgrade your plan to continue.`,
        tone: "warning",
      });
      return false;
    }

    try {
      const newCredits = Math.max(0, currentCredits - cost);
      const updatedUser: PublicUser = {
        ...(user || {
          id: auth.currentUser?.uid || "user",
          name: "User",
          email: auth.currentUser?.email || "user@example.com",
          plan: "free",
          createdAt: new Date().toISOString(),
          emailVerified: false,
        }),
        credits: newCredits,
      };

      setUser(updatedUser);
      syncUserSession(updatedUser);

      try {
        consumeCredits(cost, action);
      } catch {
        // non-blocking
      }
      refreshUsage();

      // Cloud sync to Firebase Realtime Database
      if (auth.currentUser) {
        update(ref(database, `users/${auth.currentUser.uid}`), {
          credits: newCredits,
          updatedAt: new Date().toISOString(),
        }).catch((err) => console.warn("Failed to sync credit consumption to DB:", err));
      }

      return true;
    } catch (e: any) {
      toast({ title: "Credit error", desc: e?.message ?? "Something went wrong.", tone: "error" });
      return false;
    }
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      register,
      logout,
      updateUser,
      sendVerificationEmail,
      checkEmailVerified,
      upgradePlan,
      spendCredits,
      usage,
      refreshUsage,
    }),
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
