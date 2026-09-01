import React, { useState } from "react";
import {
  AlertTriangle, BellRing, CreditCard, LogOut, Mail, RefreshCw, Save,
  Server, User as UserIcon, Zap,
} from "lucide-react";
import { Badge, Button, Card, Confirm, Field, Input, Modal, PageHeader, Toggle } from "../components/ui";
import { RazorpayModal } from "../components/RazorpayModal";
import { useAuth, useData, useToast } from "../context";
import { usePageMeta } from "../hooks";
import { CURRENCY, PLANS, CREDIT_COSTS, ACTION_LABELS } from "../data";
import { IS_MOCK_AI } from "../services/ai";
import { DEMO_ACCOUNT } from "../services/api";
import { cn, formatDate, timeAgo } from "../utils";

export default function SettingsPage() {
  usePageMeta("Settings — JOB ASAP");
  const { user, updateUser, usage, logout, sendVerificationEmail, checkEmailVerified } = useAuth();
  const { resetAll } = useData();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingVerif, setSendingVerif] = useState(false);
  const [checkingVerif, setCheckingVerif] = useState(false);
  const [planModal, setPlanModal] = useState(false);
  const [waitlist, setWaitlist] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("acc:prefs") || "null") || { digest: true, reminders: true, updates: false }; }
    catch { return { digest: true, reminders: true, updates: false }; }
  });

  const plan = PLANS.find((p) => p.id === user?.plan) ?? PLANS[0];
  const planCredits = plan.credits;
  const pct = Math.min(100, ((user?.credits ?? 0) / planCredits) * 100);

  const saveProfile = () => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Enter your name";
    if (!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(email)) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingProfile(true);
    setTimeout(() => {
      updateUser({ name: name.trim(), email: email.trim().toLowerCase() });
      setSavingProfile(false);
      toast({ title: "Profile updated", tone: "success" });
    }, 500);
  };

  const setPref = (k: string, v: boolean) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    localStorage.setItem("acc:prefs", JSON.stringify(next));
    toast({ title: "Preference saved", tone: "info" });
  };

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="Settings" title="Account & Preferences" desc="Your profile, plan, credits and demo controls." />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {/* profile */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900"><UserIcon className="h-5 w-5 text-brand-600" /> Profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            </div>
            
            {/* email verification status */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-brand-300" />
                <span className="text-xs sm:text-sm font-semibold text-ink-700">Email Status:</span>
                {user?.emailVerified ? (
                  <Badge tone="success">Verified ✓</Badge>
                ) : (
                  <Badge tone="warning">Unverified</Badge>
                )}
              </div>
              {!user?.emailVerified && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={sendingVerif}
                    onClick={async () => {
                      setSendingVerif(true);
                      await sendVerificationEmail();
                      setSendingVerif(false);
                    }}
                  >
                    Send Link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={checkingVerif}
                    onClick={async () => {
                      setCheckingVerif(true);
                      await checkEmailVerified();
                      setCheckingVerif(false);
                    }}
                  >
                    Check Status
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-ink-400">Member since {user ? formatDate(user.createdAt) : "—"}</p>
              <Button onClick={saveProfile} loading={savingProfile} icon={<Save className="h-4 w-4" />}>Save changes</Button>
            </div>
          </Card>

          {/* usage */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900"><Zap className="h-5 w-5 text-brand-600" /> Credit usage</h2>
            {usage.length === 0 ? (
              <p className="text-sm text-ink-400">No credit spend yet — actions you run will appear here.</p>
            ) : (
              <div className="divide-y divide-ink-50">
                {usage.slice(0, 8).map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-[13px] font-bold text-ink-700">{u.label}</p>
                      <p className="text-[11px] font-medium text-ink-400">{timeAgo(u.createdAt)} · via {ACTION_LABELS[u.action] ? "AI service" : "system"}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-100">−{u.cost}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* preferences */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900"><BellRing className="h-5 w-5 text-brand-600" /> Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-bold text-ink-800">Weekly progress digest</p><p className="text-xs text-ink-400">Match trend + open next steps, every Monday</p></div>
                <Toggle on={prefs.digest} onChange={(v) => setPref("digest", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-bold text-ink-800">Interview reminders</p><p className="text-xs text-ink-400">24h before any tracked interview stage</p></div>
                <Toggle on={prefs.reminders} onChange={(v) => setPref("reminders", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-bold text-ink-800">Product updates</p><p className="text-xs text-ink-400">New tools and AI improvements</p></div>
                <Toggle on={prefs.updates} onChange={(v) => setPref("updates", v)} />
              </div>
            </div>
            <p className="mt-4 rounded-lg bg-ink-50 px-3.5 py-2.5 text-xs font-medium text-ink-500 ring-1 ring-ink-100">
              <Mail className="mb-0.5 mr-1 inline h-3.5 w-3.5" /> Email delivery connects when the email service goes live — preferences are stored now.
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          {/* plan */}
          <Card className="overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-coal-700 to-coal-950 p-6 text-white">
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-600/30 blur-2xl" />
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-300">Current plan</p>
                <Badge tone="brand" className="bg-brand-500/20 text-brand-200 ring-brand-400/30 capitalize">{plan.name}</Badge>
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{CURRENCY}{plan.monthly}<span className="text-sm font-semibold text-ink-400">/month</span></p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-ink-300">Credits</span>
                  <span className="text-white">{user?.credits ?? 0} / {planCredits}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={cn("h-full rounded-full transition-all duration-700", pct < 25 ? "bg-amber-400" : "bg-brand-400")} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] font-medium text-ink-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" onClick={() => setPlanModal(true)} icon={<CreditCard className="h-4 w-4" />}>
                {plan.id === "pro" ? "Manage subscription" : "Upgrade plan"}
              </Button>
            </div>
          </Card>

          {/* system status */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900"><Server className="h-5 w-5 text-brand-600" /> System status</h2>
            <div className="space-y-2.5 text-[13px] font-medium">
              <div className="flex items-center justify-between rounded-lg bg-ink-50/70 px-3.5 py-2.5">
                <span className="text-ink-600">AI provider</span>
                <Badge tone={IS_MOCK_AI ? "amber" : "emerald"}>{IS_MOCK_AI ? "Mock engine (demo)" : "Live provider"}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-ink-50/70 px-3.5 py-2.5">
                <span className="text-ink-600">Database & Auth</span>
                <Badge tone="emerald">Firebase RTDB & Auth · Active</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-ink-50/70 px-3.5 py-2.5">
                <span className="text-ink-600">Payments</span>
                <Badge tone="emerald">Razorpay Gateway · Active</Badge>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              Payments are processed via Razorpay (UPI, Debit/Credit cards, NetBanking). Live and Test transactions update plan entitlements in real-time.
            </p>
          </Card>

          {/* danger zone */}
          <Card className="border-rose-200 p-6 ring-1 ring-rose-100">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-rose-700"><AlertTriangle className="h-5 w-5" /> Danger zone</h2>
            <div className="space-y-2.5">
              <Button variant="secondary" className="w-full" icon={<RefreshCw className="h-4 w-4" />} onClick={() => setConfirmReset(true)}>
                Reset demo data
              </Button>
              <Button variant="danger" className="w-full" icon={<LogOut className="h-4 w-4" />} onClick={logout}>
                Log out
              </Button>
            </div>
            {user?.email === DEMO_ACCOUNT.email && (
              <p className="mt-3 text-xs font-medium text-ink-400">You're on the shared demo account — resets restore the seed data.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Razorpay plan checkout modal */}
      <RazorpayModal
        open={planModal}
        onClose={() => setPlanModal(false)}
        selectedPlanId={user?.plan === "starter" ? "pro" : "starter"}
      />

      <Confirm
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => { resetAll(); setConfirmReset(false); }}
        confirmLabel="Reset data"
        title="Reset demo data?"
        body="Analyses, applications, resumes, letters and sessions will be restored to fresh seed data. Your profile and credits stay."
      />
    </div>
  );
}
