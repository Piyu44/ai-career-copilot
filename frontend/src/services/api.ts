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
  /** Extracts text from PDF, DOCX, TXT, and MD files */
  async readText(file: File): Promise<string | null> {
    try {
      // 1. Plain text, markdown, csv, rtf
      if (/\.(txt|md|csv|rtf|json)$/i.test(file.name)) {
        return await file.text();
      }

      // 2. Word documents (.docx) — unzip word/document.xml and extract text
      if (/\.docx$/i.test(file.name)) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const view = new DataView(buffer);
        let offset = 0;

        while (offset + 30 <= bytes.length) {
          const sig = view.getUint32(offset, true);
          if (sig !== 0x04034b50) {
            offset++;
            continue;
          }

          const compression = view.getUint16(offset + 8, true);
          const compressedSize = view.getUint32(offset + 18, true);
          const fileNameLen = view.getUint16(offset + 26, true);
          const extraLen = view.getUint16(offset + 28, true);

          const fileNameBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLen);
          const fileName = new TextDecoder().decode(fileNameBytes);
          const dataOffset = offset + 30 + fileNameLen + extraLen;

          if (fileName === "word/document.xml") {
            const compressedData = bytes.subarray(dataOffset, dataOffset + compressedSize);
            let xmlText = "";

            if (compression === 8 && typeof DecompressionStream !== "undefined") {
              try {
                const ds = new DecompressionStream("deflate-raw");
                const stream = new Response(compressedData).body;
                if (stream) {
                  const decompressedStream = stream.pipeThrough(ds);
                  xmlText = await new Response(decompressedStream).text();
                }
              } catch (deflateErr) {
                console.warn("Deflate stream error:", deflateErr);
              }
            } else if (compression === 0) {
              xmlText = new TextDecoder().decode(compressedData);
            }

            if (xmlText) {
              const docxMatches = xmlText.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
              if (docxMatches && docxMatches.length > 0) {
                const text = docxMatches
                  .map((m) => m.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, ""))
                  .join(" ");
                if (text.trim().length > 15) {
                  return text.replace(/\s+/g, " ").trim();
                }
              }
            }
          }

          offset = dataOffset + (compressedSize > 0 ? compressedSize : 1);
        }

        // Fallback for DOCX: scan for text tags
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const raw = decoder.decode(buffer);
        const matches = raw.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
        if (matches && matches.length > 0) {
          const text = matches
            .map((m) => m.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, ""))
            .join(" ");
          if (text.trim().length > 20) {
            return text.replace(/\s+/g, " ").trim();
          }
        }
      }

      // 3. PDF documents (.pdf)
      if (/\.pdf$/i.test(file.name)) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const decoder = new TextDecoder("latin1");
        const raw = decoder.decode(bytes);

        const extracted: string[] = [];

        // Match PDF text strings: (Text chunk) Tj / ' / "
        const tjMatches = raw.match(/\(([^()]{2,})\)\s*(?:Tj|'|")/g);
        if (tjMatches) {
          tjMatches.forEach((m) => {
            const clean = m.replace(/\)\s*(?:Tj|'|")$/, "").replace(/^\(/, "");
            if (clean.length > 1 && !clean.includes("\\x")) {
              extracted.push(clean);
            }
          });
        }

        // Match PDF array text strings: [(chunk1) (chunk2)] TJ
        const arrayMatches = raw.match(/\[\s*(?:\([^()]+\)\s*[-0-9\s]*)+\s*\]\s*TJ/g);
        if (arrayMatches) {
          arrayMatches.forEach((m) => {
            const inner = m.match(/\(([^()]+)\)/g);
            if (inner) {
              const line = inner.map((s) => s.slice(1, -1)).join("");
              if (line.length > 1) extracted.push(line);
            }
          });
        }

        if (extracted.length > 3) {
          const cleanedText = extracted
            .join(" ")
            .replace(/\\([()\\])/g, "$1")
            .replace(/\s+/g, " ")
            .trim();
          if (cleanedText.length > 25) {
            return cleanedText;
          }
        }

        // Fallback: extract continuous readable words from PDF
        const words = raw.match(/[A-Za-z0-9,.:;@/+\-()]{3,}/g);
        if (words && words.length > 15) {
          const pdfKeywords = new Set(["obj", "endobj", "stream", "endstream", "xref", "trailer", "startxref", "Font", "Type", "Page", "Pages", "Catalog", "Length", "Filter", "FlateDecode", "MediaBox", "Contents", "Resources"]);
          const filtered = words.filter((w) => !pdfKeywords.has(w));
          if (filtered.length > 10) {
            return filtered.join(" ");
          }
        }
      }

      // 4. Universal fallback text extraction
      const rawText = await file.text();
      const cleanAscii = rawText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
      if (cleanAscii.length > 40) {
        return cleanAscii;
      }
    } catch (err) {
      console.warn("Client-side text extraction error:", err);
    }
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
