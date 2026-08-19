import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound,
  Lock, Mail, Mic, ShieldCheck, Sparkles, Target, Zap,
} from "lucide-react";
import { Badge, Button, Card, Cube, Field, Input, Logo, Orb, SceneShapes, TiltCard } from "../components/ui";
import { FaqSection, PricingCards, SectionHead } from "../components/sections";
import { useAuth, useToast } from "../context";
import { usePageMeta } from "../hooks";
import { ACTION_LABELS, CREDIT_COSTS } from "../data";
import { DEMO_ACCOUNT } from "../services/api";
import { cn } from "../utils";

/* ================================ FEATURES ================================ */

const FEATURE_ROWS = [
  {
    icon: Target, eyebrow: "Job Match Analyzer",
    title: "Your resume vs the JD — scored honestly",
    desc: "A weighted internal assessment across skills, keywords, experience and education. You see matching skills, missing skills, missing keywords and a prioritized fix list. We never pretend it's an employer's ATS score.",
    points: ["Overall match score with category breakdown", "Missing skills & keyword gaps", "Experience and education fit", "One-click handoff to every other tool"],
    visual: (
      <div className="flex items-center gap-5">
        <div className="glass-deep rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Match</p>
          <p className="font-display text-4xl font-bold text-brand-300 text-glow">82%</p>
          <p className="mt-1 text-xs font-semibold text-ink-400">Frontend Dev · Microsoft</p>
        </div>
        <div className="space-y-2">
          {[["Skills", 72], ["Keywords", 64], ["Experience", 90]].map(([l, v]: any) => (
            <div key={l} className="w-44">
              <div className="mb-1 flex justify-between text-[11px] font-bold text-ink-500"><span>{l}</span><span>{v}%</span></div>
              <div className="h-1.5 rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 shadow-[0_0_8px_rgba(139,92,246,.6)]" style={{ width: `${v}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Sparkles, eyebrow: "Resume Tools",
    title: "Improvement that never lies",
    desc: "Original vs AI Improved with a full change log — every rewritten bullet explained. The engine strengthens verbs, reorders skills for the JD and quantifies impact. Where information is missing, it suggests what you could add instead of inventing it.",
    points: ["Original / AI Improved / Changes tabs", "Regenerate any section", "Copy, PDF and DOCX export", "Strict no-fabrication rule"],
    visual: (
      <div className="w-full max-w-sm space-y-2 font-mono text-[11.5px]">
        <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-rose-300 line-through decoration-rose-400/50">− Helped the team fix UI bugs</p>
        <p className="rounded-lg bg-emerald-400/10 px-3 py-2 text-emerald-300">+ Drove resolution of 25+ QA-reported UI bugs across release cycles</p>
        <p className="rounded-lg bg-brand-500/12 px-3 py-2 text-brand-200 ring-1 ring-brand-400/25">Suggested: add a metric for review turnaround</p>
      </div>
    ),
  },
  {
    icon: Mail, eyebrow: "Cover Letter Generator",
    title: "Four tones, one perfect letter",
    desc: "Professional, confident, friendly or concise — generated from your resume and the exact job description, personalized with the company's stack and your matching skills. Regenerate until it sounds like you.",
    points: ["Tone control per application", "Company & role personalization", "Copy / PDF / DOCX export", "Saved history"],
    visual: (
      <Card className="glass-deep w-full max-w-sm p-4">
        <p className="text-xs font-bold text-ink-400">Subject: Application for React Developer — Swiggy</p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">
          Dear Hiring Team, When I saw the React Developer opening at Swiggy, I knew my background was a direct match…
        </p>
        <div className="mt-3 flex gap-1.5"><Badge tone="brand">Confident ✓</Badge></div>
      </Card>
    ),
  },
  {
    icon: Mic, eyebrow: "Interview Simulator",
    title: "Pressure-test before the panel does",
    desc: "Technical, HR, behavioral or mixed — at beginner, intermediate or advanced level. Each answer is scored on technical accuracy, communication, clarity and confidence, with a model answer to study.",
    points: ["5-question simulated sessions", "Per-answer 4-axis scoring", "\"Better answer\" rewrites", "Session history & progress"],
    visual: (
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-gradient-to-br from-coal-700 to-coal-950 p-4 text-white ring-1 ring-brand-400/25 shadow-[0_18px_40px_-18px_rgba(109,40,217,.55)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Score</p>
          <p className="font-display text-3xl font-bold">8.5<span className="text-sm text-ink-400">/10</span></p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[["Technical", 9], ["Clarity", 8.6], ["Comm.", 8.2], ["Confidence", 8.4]].map(([l, v]: any) => (
            <span key={l} className="glass-chip rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-ink-600">{l} · {v}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: ShieldCheck, eyebrow: "ATS Checker",
    title: "Six checks between you and the parse",
    desc: "Contact info, section structure, formatting, keywords, impact and readability — each scored with plain-language fixes. The headline score is clearly labelled as our platform's assessment, not an employer's ATS result.",
    points: ["Weighted 100-point assessment", "Strengths & weaknesses breakdown", "Prioritized recommendations", "Honest disclaimer, always"],
    visual: (
      <div className="flex items-center gap-5">
        <div className="glass-deep rounded-full p-1.5"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/12 font-display text-2xl font-bold text-emerald-300 ring-1 ring-emerald-400/25">72</div></div>
        <div className="space-y-1.5">{["Contact info ✓", "Structure ✓", "Keywords ⚠", "Formatting ✓"].map((t) => <p key={t} className="text-xs font-bold text-ink-500">{t}</p>)}</div>
      </div>
    ),
  },
];

export function FeaturesPage() {
  usePageMeta("Features — AI Career Copilot", "Job match analysis, resume improvement, cover letters, interview simulator, ATS checker and application tracking.");
  return (
    <>
      <section className="relative overflow-hidden">
        <SceneShapes variant="a" />
        <div className="container-x relative py-20 text-center">
          <Badge tone="brand" className="glass-chip mb-4"><Sparkles className="h-3.5 w-3.5" /> The complete toolkit</Badge>
          <h1 className="text-3d mx-auto max-w-3xl font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl">
            Six tools, <span className="text-brand-300 text-glow">one brain</span> — your resume and the job description
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-400">
            Every tool shares the same context, so your cover letter knows your match score and your
            interview prep knows the JD's keywords.
          </p>
        </div>
      </section>
      <section className="container-x space-y-20 pb-24">
        {FEATURE_ROWS.map((f, i) => (
          <div key={f.title} className={cn("grid items-center gap-10 lg:grid-cols-2", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
            <TiltCard max={4} className={cn(i % 2 === 1 && "lg:order-1")}>
              <div className="glass-deep flex justify-center rounded-2xl p-8">
                {f.visual}
              </div>
            </TiltCard>
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-300">
                <f.icon className="h-4 w-4" /> {f.eyebrow}
              </p>
              <h2 className="font-display text-[28px] font-bold leading-tight text-white">{f.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-400">{f.desc}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm font-medium text-ink-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={3} /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>
      <section className="container-x pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 px-8 py-14 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_30px_70px_-26px_rgba(109,40,217,.8)]">
          <Cube size={46} className="absolute left-[8%] top-8 hidden opacity-60 sm:block" />
          <Orb size={60} className="absolute right-[7%] bottom-6 hidden opacity-70 sm:block" />
          <h2 className="text-3d font-display text-3xl font-bold">See it all working together</h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-100/90">One analysis feeds every tool. Start with a free job match.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/register"><Button size="lg" variant="dark" className="bg-white/14 hover:bg-white/20">Start Free</Button></Link>
            <Link to="/pricing"><Button size="lg" variant="dark" className="bg-ink-950/40 ring-1 ring-white/25 hover:bg-ink-950/60">View Pricing</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ================================ PRICING ================================ */

export function PricingPage() {
  usePageMeta("Pricing — AI Career Copilot", "Free, Starter ₹199 and Pro ₹499 plans with transparent credit costs for every AI action.");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  return (
    <>
      <section className="relative overflow-hidden">
        <SceneShapes variant="b" />
        <div className="container-x relative py-16 text-center">
          <Badge tone="brand" className="glass-chip mb-4"><Zap className="h-3.5 w-3.5" /> Simple, credit-based</Badge>
          <h1 className="text-3d font-display text-4xl font-bold text-white sm:text-5xl">Priced for a <span className="text-brand-300 text-glow">job hunt</span>, not an enterprise</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-400">Every AI action costs credits — you always know what you're spending.</p>
          <div className="glass-chip mt-8 inline-flex items-center gap-1 rounded-full p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)}
                className={cn("rounded-full px-5 py-2 text-sm font-bold capitalize transition-all", billing === b ? "bg-gradient-to-b from-brand-500/40 to-brand-700/30 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2)] ring-1 ring-brand-400/30" : "text-ink-400 hover:text-white")}>
                {b}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="container-x pb-8"><PricingCards billing={billing} /></section>
      <section className="container-x grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="glass-deep p-7">
          <h2 className="font-display text-xl font-bold text-white">Credit costs per action</h2>
          <p className="mt-1 text-sm text-ink-400">Configured centrally — the same table the billing service reads.</p>
          <div className="mt-5 divide-y divide-white/8">
            {Object.entries(CREDIT_COSTS).map(([action, cost]) => (
              <div key={action} className="flex items-center justify-between py-3.5">
                <span className="text-sm font-semibold text-ink-600">{ACTION_LABELS[action as keyof typeof ACTION_LABELS]}</span>
                <span className="flex items-center gap-1.5 rounded-full bg-brand-500/14 px-3 py-1 text-sm font-bold text-brand-300 ring-1 ring-brand-400/25">
                  <Zap className="h-3.5 w-3.5" /> {cost}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="glass-deep p-7">
            <h3 className="font-display text-lg font-bold text-white">How credits work</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-500">
              {["Free accounts start with 10 credits", "Paid plans refresh credits every month", "You're blocked politely before going negative", "Upgrades connect via UPI at launch — no fake checkout today"].map((t) => (
                <li key={t} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {t}</li>
              ))}
            </ul>
          </Card>
          <div className="glass-deep relative overflow-hidden rounded-2xl p-7 text-white">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-600/30 blur-3xl" />
            <Lock className="relative h-6 w-6 text-brand-300" />
            <h3 className="relative mt-3 font-display text-lg font-bold">Payment-ready architecture</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-ink-400">
              The subscription service is decoupled from the UI. Razorpay-style UPI intents, webhooks and
              plan entitlements plug in without touching a single screen.
            </p>
          </div>
        </div>
      </section>
      <FaqSection />
    </>
  );
}

/* ================================= AUTH =================================== */

function AuthShell({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden overflow-hidden border-r border-white/8 bg-coal-950/70 p-10 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grid-dark opacity-60" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-brand-600/25 blur-[100px]" />
        <Cube size={64} className="absolute right-16 top-24 opacity-60" />
        <Orb size={44} className="absolute bottom-28 right-24 opacity-70 animate-floaty" />
        <div className="relative"><Link to="/"><Logo /></Link></div>
        <div className="relative max-w-md">
          <h2 className="text-3d font-display text-3xl font-bold leading-tight text-white">
            "I fixed 3 resume gaps the analysis found — got my first interview call in 2 weeks."
          </h2>
          <p className="mt-4 text-sm font-semibold text-ink-400">Rohan K. · B.Tech 2025 · Placed at a Bengaluru startup</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[["10", "free credits"], ["6", "connected tools"], ["60s", "per analysis"]].map(([v, l]) => (
              <div key={l} className="glass-chip rounded-xl p-3 text-center">
                <p className="font-display text-xl font-bold text-brand-300">{v}</p>
                <p className="text-[11px] font-medium text-ink-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-ink-400">Scores are internal assessments — not employer ATS results.</p>
      </aside>
      <main className="relative flex items-center justify-center overflow-hidden px-4 py-12">
        <SceneShapes variant="b" />
        <div className="relative w-full max-w-[440px] animate-fade-up">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="glass-deep rounded-2xl p-7 sm:p-8">
            <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
            <p className="mt-1.5 text-sm text-ink-400">{sub}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder = "••••••••" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pr-10" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-white" aria-label="Toggle password">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;

const formError = "mb-4 rounded-lg bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-300 ring-1 ring-rose-400/25";

export function LoginPage() {
  usePageMeta("Log in — AI Career Copilot");
  const { login } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [errors, setErrors] = useState<{ email?: string; pw?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e?: React.FormEvent, em = email, p = pw) => {
    e?.preventDefault();
    const errs: typeof errors = {};
    if (!EMAIL_RE.test(em)) errs.email = "Enter a valid email address";
    if (p.length < 6) errs.pw = "Password must be at least 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      try {
        const u = login(em, p);
        toast({ title: `Welcome back, ${u.name.split(" ")[0]}!`, desc: "Your copilot is warmed up.", tone: "success" });
        nav("/dashboard");
      } catch (err: any) {
        setErrors({ form: err.message });
        setLoading(false);
      }
    }, 500);
  };

  return (
    <AuthShell title="Welcome back" sub="Log in to continue your job hunt.">
      {errors.form && <div className={formError}>{errors.form}</div>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" autoComplete="email" />
        </Field>
        <Field label="Password" error={errors.pw}>
          <PasswordInput value={pw} onChange={setPw} />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-semibold text-brand-300 hover:text-brand-200">Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Log in</Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-ink-300">
        <span className="h-px flex-1 bg-white/12" /> or <span className="h-px flex-1 bg-white/12" />
      </div>
      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        icon={<Sparkles className="h-4 w-4 text-brand-300" />}
        onClick={() => { setEmail(DEMO_ACCOUNT.email); setPw(DEMO_ACCOUNT.password); submit(undefined, DEMO_ACCOUNT.email, DEMO_ACCOUNT.password); }}
      >
        Try the live demo account
      </Button>
      <p className="mt-2 text-center text-xs text-ink-400">{DEMO_ACCOUNT.email} · pre-seeded with analyses & applications</p>
      <p className="mt-6 text-center text-sm text-ink-500">
        New here? <Link to="/register" className="font-bold text-brand-300 hover:text-brand-200">Create a free account</Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  usePageMeta("Create account — AI Career Copilot", "Sign up free with 10 credits. No card required.");
  const { register } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", pw: "", confirm: "", terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Enter your full name";
    if (!EMAIL_RE.test(form.email)) errs.email = "Enter a valid email address";
    if (form.pw.length < 6) errs.pw = "Minimum 6 characters";
    if (form.confirm !== form.pw) errs.confirm = "Passwords don't match";
    if (!form.terms) errs.terms = "Please accept the terms to continue";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      try {
        const u = register(form.name, form.email, form.pw);
        toast({ title: `Account created — welcome, ${u.name.split(" ")[0]}!`, desc: "10 free credits added. Start with a job match.", tone: "success" });
        nav("/dashboard");
      } catch (err: any) {
        setErrors({ form: err.message });
        setLoading(false);
      }
    }, 600);
  };

  return (
    <AuthShell title="Create your free account" sub="10 credits on us. No card, no commitment.">
      {errors.form && <div className={formError}>{errors.form}</div>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" autoComplete="email" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.pw}><PasswordInput value={form.pw} onChange={(v) => setForm({ ...form, pw: v })} /></Field>
          <Field label="Confirm" error={errors.confirm}><PasswordInput value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} /></Field>
        </div>
        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-500">
            <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-brand-600" />
            <span>I agree to the Terms of Service and understand scores are internal assessments, not employer ATS results.</span>
          </label>
          {errors.terms && <p className="mt-1 text-xs font-medium text-rose-400">{errors.terms}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading} icon={<Zap className="h-4 w-4" />}>
          Create account — get 10 credits
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already registered? <Link to="/login" className="font-bold text-brand-300 hover:text-brand-200">Log in</Link>
      </p>
    </AuthShell>
  );
}

const successPanel = "rounded-xl bg-emerald-400/10 p-5 text-center ring-1 ring-emerald-400/25 animate-pop-in";

export function ForgotPasswordPage() {
  usePageMeta("Reset password — AI Career Copilot");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell title="Forgot your password?" sub="We'll email you a secure reset link.">
      {sent ? (
        <div className={successPanel}>
          <Mail className="mx-auto h-8 w-8 text-emerald-300" />
          <p className="mt-3 font-display text-lg font-bold text-emerald-200">Check your inbox</p>
          <p className="mt-1 text-sm text-emerald-300/80">If {email} has an account, a reset link is on its way. (Demo mode: email service connects at launch.)</p>
          <Link to="/reset-password" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-300 hover:text-emerald-200">
            I have my reset token <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (!EMAIL_RE.test(email)) return setError("Enter a valid email"); setError(""); setLoading(true); setTimeout(() => { setLoading(false); setSent(true); }, 700); }} className="space-y-4" noValidate>
          <Field label="Email" error={error}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Send reset link</Button>
          <p className="text-center text-sm text-ink-500"><Link to="/login" className="font-bold text-brand-300">Back to login</Link></p>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  usePageMeta("Set new password — AI Career Copilot");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return (
    <AuthShell title="Set a new password" sub="Make it strong — your job hunt depends on it.">
      {done ? (
        <div className={successPanel}>
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
          <p className="mt-3 font-display text-lg font-bold text-emerald-200">Password updated</p>
          <p className="mt-1 text-sm text-emerald-300/80">You can now log in with your new password.</p>
          <Link to="/login" className="mt-4 inline-block"><Button>Go to login</Button></Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (pw.length < 6) return setError("Minimum 6 characters"); if (pw !== confirm) return setError("Passwords don't match"); setError(""); setDone(true); }} className="space-y-4" noValidate>
          {error && <div className={formError}>{error}</div>}
          <Field label="New password"><PasswordInput value={pw} onChange={setPw} /></Field>
          <Field label="Confirm new password"><PasswordInput value={confirm} onChange={setConfirm} /></Field>
          <Button type="submit" size="lg" className="w-full" icon={<KeyRound className="h-4 w-4" />}>Update password</Button>
        </form>
      )}
    </AuthShell>
  );
}

/* ================================== 404 =================================== */

export function NotFoundPage() {
  usePageMeta("Page not found — AI Career Copilot");
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden py-24">
      <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
      <Cube size={70} className="absolute left-[14%] top-[22%] opacity-60" />
      <Orb size={50} className="absolute right-[12%] bottom-[24%] opacity-70" />
      <div className="relative text-center">
        <p className="text-3d font-display text-[110px] font-bold leading-none text-brand-300">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">This page skipped the interview</h1>
        <p className="mt-2 text-ink-400">The link is broken or the page moved. Let's get you back on track.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/"><Button icon={<ArrowLeft className="h-4 w-4" />}>Back home</Button></Link>
          <Link to="/dashboard"><Button variant="secondary">Open dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}
