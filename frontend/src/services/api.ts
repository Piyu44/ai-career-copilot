/**
 * API / DATA LAYER — demo adapter
 * -------------------------------
 * Mirrors the REST contract served by /backend (see backend/routes).
 * In this demo build it persists to localStorage with simulated latency,
 * so the entire product journey works with zero infrastructure.
 *
 * Swapping to production = point these functions at fetch() calls;
 * the UI layer never changes. Auth here issues an opaque demo token —
 * real JWT signing/hashing lives exclusively in the backend (bcrypt + jwt).
 */

import {
  SEED_ANALYSES,
  SEED_APPLICATIONS,
  SEED_NOTIFS,
  DEMO_RESUME_TEXT,
  CREDIT_COSTS,
  ACTION_LABELS,
  PLANS,
  type CreditAction,
  type PlanId,
} from "../data";
import { delay, uid } from "../utils";

export const USE_MOCK = ((import.meta as any).env?.VITE_USE_MOCK_AI ?? "true") !== "false";

export const DEMO_ACCOUNT = { email: "demo@aicareer.dev", password: "demo1234" };

/* ------------------------------ tiny storage ------------------------------ */

const ls = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota — demo mode ignores */
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

const K = {
  users: "acc:users",
  session: "acc:session",
  col: (u: string, c: string) => `acc:${u}:${c}`,
};

/* --------------------------------- users ---------------------------------- */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plan: PlanId;
  credits: number;
  createdAt: string;
  emailVerified?: boolean;
}

/** Demo-grade hash so plaintext never persists. Production: bcrypt in backend. */
const hash = (pw: string) => btoa(unescape(encodeURIComponent(`acc-salt::${pw}`)));

export const sanitizeUser = (u: StoredUser) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  plan: u.plan,
  credits: u.credits,
  createdAt: u.createdAt,
  emailVerified: u.emailVerified ?? false,
});
export type PublicUser = ReturnType<typeof sanitizeUser>;

const getUsers = () => ls.get<StoredUser[]>(K.users, []);

export function registerUser(name: string, email: string, password: string): PublicUser {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
    throw new Error("An account with this email already exists.");
  const user: StoredUser = {
    id: uid(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hash(password),
    plan: "free",
    credits: PLANS.find((p) => p.id === "free")!.credits,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  ls.set(K.users, users);
  ls.set(K.session, user.id);
  seedDemoData(user.id);
  return sanitizeUser(user);
}

export function loginUser(email: string, password: string): PublicUser {
  ensureDemoUser();
  const user = getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.passwordHash !== hash(password))
    throw new Error("Invalid email or password.");
  ls.set(K.session, user.id);
  seedDemoData(user.id);
  return sanitizeUser(user);
}

/** Auto-provisions the shared demo account so the one-click demo login always works. */
export function ensureDemoUser() {
  const users = getUsers();
  if (users.some((u) => u.email === DEMO_ACCOUNT.email)) return;
  users.push({
    id: "demo-user",
    name: "Aarav Mehta",
    email: DEMO_ACCOUNT.email,
    passwordHash: hash(DEMO_ACCOUNT.password),
    plan: "free",
    credits: PLANS.find((p) => p.id === "free")!.credits,
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
  });
  ls.set(K.users, users);
  seedDemoData("demo-user");
}

export function getSessionUser(): PublicUser | null {
  ensureDemoUser();
  const id = ls.get<string | null>(K.session, null);
  if (!id) return null;
  const user = getUsers().find((u) => u.id === id);
  return user ? sanitizeUser(user) : null;
}

export function logout() {
  ls.del(K.session);
}

export function updateUser(patch: Partial<Pick<StoredUser, "name" | "email" | "plan" | "credits">>): PublicUser | null {
  const id = ls.get<string | null>(K.session, null);
  if (!id) return null;
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  ls.set(K.users, users);
  const me = users.find((u) => u.id === id)!;
  return sanitizeUser(me);
}

/* -------------------------------- credits --------------------------------- */
/*  getUserCredits · consumeCredits · addCredits · hasEnoughCredits
    — the reusable credit system. Costs are configured in data.ts.        */

export function getUserCredits(): number {
  return getSessionUser()?.credits ?? 0;
}

export function hasEnoughCredits(cost: number): boolean {
  return getUserCredits() >= cost;
}

export interface UsageRecord {
  id: string;
  action: CreditAction;
  label: string;
  cost: number;
  createdAt: string;
}

export function consumeCredits(cost: number, action: CreditAction): PublicUser {
  const id = ls.get<string | null>(K.session, null);
  const users = getUsers();
  const me = users.find((u) => u.id === id);
  if (!me) throw new Error("Not authenticated.");
  if (me.credits < cost) throw new Error("INSUFFICIENT_CREDITS");
  me.credits -= cost;
  ls.set(K.users, users);
  const usage = ls.get<UsageRecord[]>(K.col(me.id, "usage"), []);
  usage.unshift({ id: uid(), action, label: ACTION_LABELS[action], cost, createdAt: new Date().toISOString() });
  ls.set(K.col(me.id, "usage"), usage.slice(0, 60));
  return sanitizeUser(me);
}

export function addCredits(n: number): PublicUser | null {
  const id = ls.get<string | null>(K.session, null);
  const users = getUsers();
  const me = users.find((u) => u.id === id);
  if (!me) return null;
  me.credits += n;
  ls.set(K.users, users);
  return sanitizeUser(me);
}

export function getUsage(): UsageRecord[] {
  const id = ls.get<string | null>(K.session, null);
  return id ? ls.get<UsageRecord[]>(K.col(id, "usage"), []) : [];
}

/* --------------------------- per-user collections -------------------------- */

function col<T>(name: string, fallback: T): T {
  const id = ls.get<string | null>(K.session, null);
  return id ? ls.get<T>(K.col(id, name), fallback) : fallback;
}
function setCol<T>(name: string, value: T) {
  const id = ls.get<string | null>(K.session, null);
  if (id) ls.set(K.col(id, name), value);
}

export interface StoredResume {
  id: string;
  name: string;
  text: string;
  fileName?: string;
  updatedAt: string;
}

/* ------------------------------ file storage ------------------------------ */
/**
 * Upload abstraction — local demo implementation.
 * Production: replace `local` with an S3/Cloudinary adapter behind the same
 * interface; validation (type/size) is enforced in backend middleware too.
 */
export const fileStorage = {
  ACCEPTED: [".pdf", ".docx", ".doc", ".txt", ".md"],
  MAX_MB: 5,
  validate(name: string, size: number) {
    const okType = this.ACCEPTED.some((e) => name.toLowerCase().endsWith(e));
    if (!okType) throw new Error(`Unsupported file type. Accepted: ${this.ACCEPTED.join(", ")}`);
    if (size > this.MAX_MB * 1024 * 1024) throw new Error(`File exceeds ${this.MAX_MB}MB limit.`);
  },
  /** Reads plain text; for PDF/DOCX the demo flags the file for paste fallback
      (real parsing runs server-side via the storage service). */
  async readText(file: File): Promise<string | null> {
    if (/\.(txt|md)$/i.test(file.name)) return await file.text();
    return null;
  },
  saveResume(resume: StoredResume): StoredResume {
    const all = col<StoredResume[]>("resumes", []);
    const idx = all.findIndex((r) => r.id === resume.id);
    if (idx >= 0) all[idx] = resume;
    else all.unshift(resume);
    setCol("resumes", all);
    return resume;
  },
  listResumes(): StoredResume[] {
    return col<StoredResume[]>("resumes", []);
  },
};

/* ------------------------------- demo seed -------------------------------- */

export function seedDemoData(userId: string) {
  const key = (c: string) => K.col(userId, c);
  if (!localStorage.getItem(key("analyses"))) ls.set(key("analyses"), SEED_ANALYSES);
  if (!localStorage.getItem(key("applications"))) ls.set(key("applications"), SEED_APPLICATIONS);
  if (!localStorage.getItem(key("notifs"))) ls.set(key("notifs"), SEED_NOTIFS);
  if (!localStorage.getItem(key("resumes")))
    ls.set(key("resumes"), [
      {
        id: "resume-master",
        name: "Master Resume",
        text: DEMO_RESUME_TEXT,
        updatedAt: new Date().toISOString(),
      },
    ]);
  if (!localStorage.getItem(key("covers"))) ls.set(key("covers"), []);
  if (!localStorage.getItem(key("sessions"))) ls.set(key("sessions"), []);
}

/* ------------------------------ data getters ------------------------------ */

const apiDelay = (ms = 420) => delay(ms);

export const api = {
  analyses: {
    async list() {
      await apiDelay();
      return col<any[]>("analyses", []);
    },
    async create(a: any) {
      await apiDelay(200);
      const all = col<any[]>("analyses", []);
      const record = { ...a, id: a.id || uid() };
      all.unshift(record);
      setCol("analyses", all.slice(0, 50));
      return record;
    },
    async remove(id: string) {
      setCol("analyses", col<any[]>("analyses", []).filter((a) => a.id !== id));
    },
  },
  applications: {
    async list() {
      await apiDelay();
      return col<any[]>("applications", []);
    },
    async save(app: any) {
      await apiDelay(260);
      const all = col<any[]>("applications", []);
      const idx = all.findIndex((a) => a.id === app.id);
      if (idx >= 0) all[idx] = app;
      else all.unshift({ ...app, id: app.id || uid() });
      setCol("applications", all);
      return app;
    },
    async remove(id: string) {
      await apiDelay(200);
      setCol("applications", col<any[]>("applications", []).filter((a) => a.id !== id));
    },
  },
  covers: {
    list: () => col<any[]>("covers", []),
    add(c: any) {
      const all = col<any[]>("covers", []);
      all.unshift({ ...c, id: c.id || uid() });
      setCol("covers", all.slice(0, 30));
      return c;
    },
  },
  sessions: {
    list: () => col<any[]>("sessions", []),
    add(s: any) {
      const all = col<any[]>("sessions", []);
      all.unshift({ ...s, id: s.id || uid() });
      setCol("sessions", all.slice(0, 20));
      return s;
    },
  },
  notifs: {
    list: () => col<any[]>("notifs", []),
    markAll() {
      setCol("notifs", col<any[]>("notifs", []).map((n) => ({ ...n, read: true })));
    },
  },
  resetAll() {
    const id = ls.get<string | null>(K.session, null);
    if (!id) return;
    ["analyses", "applications", "notifs", "resumes", "covers", "sessions", "usage"].forEach((c) =>
      ls.del(K.col(id, c))
    );
    seedDemoData(id);
  },
};

export const CREDIT_COST = CREDIT_COSTS;
