import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react";
import { CURRENCY, FAQS, PLANS } from "../data";
import { Badge, Button, buttonCls, Modal } from "./ui";
import { cn } from "../utils";
import { useAuth } from "../context";
import { useReveal } from "../hooks";

export const SectionHead = ({
  eyebrow,
  title,
  desc,
  center,
  light,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  center?: boolean;
  light?: boolean;
}) => (
  <div className={cn("mb-12 max-w-2xl", center && "mx-auto text-center")}>
    <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-700 ring-1 ring-brand-100">
      <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
    </p>
    <h2 className={cn("font-display text-3xl font-bold leading-[1.12] sm:text-[40px]", light ? "text-white" : "text-ink-900")}>
      {title}
    </h2>
    {desc && <p className={cn("mt-4 text-[15px] leading-relaxed", light ? "text-ink-300" : "text-ink-500")}>{desc}</p>}
  </div>
);

/* --------------------------------- pricing -------------------------------- */

export function PricingCards({ billing = "monthly" }: { billing?: "monthly" | "yearly" }) {
  const { user } = useAuth();
  const ctaTo = user ? "/settings" : "/register";
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLANS.map((plan) => {
        const price = billing === "monthly" ? plan.monthly : plan.yearly;
        const dark = !!plan.highlight;
        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl p-7 transition-all duration-300",
              dark
                ? "bg-ink-900 text-white shadow-[0_30px_60px_-24px_rgba(11,12,31,.55)] ring-1 ring-brand-500/40 md:-translate-y-3"
                : "card-hover bg-white ring-1 ring-ink-100"
            )}
          >
            {dark && (
              <Badge tone="brand" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white ring-brand-500 shadow-pop">
                Most popular
              </Badge>
            )}
            <h3 className={cn("font-display text-lg font-bold", dark ? "text-white" : "text-ink-900")}>{plan.name}</h3>
            <p className={cn("mt-1 text-[13px]", dark ? "text-ink-300" : "text-ink-400")}>{plan.tagline}</p>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className={cn("font-display text-[42px] font-bold leading-none", dark ? "text-white" : "text-ink-900")}>
                {CURRENCY}{price}
              </span>
              <span className={cn("text-sm font-medium", dark ? "text-ink-400" : "text-ink-400")}>
                /{billing === "monthly" ? "month" : "year"}
              </span>
            </p>
            <p className={cn("mt-1.5 text-xs font-semibold", dark ? "text-brand-300" : "text-brand-600")}>
              {plan.credits} credits {plan.id === "free" ? "one-time" : "every month"}
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className={cn("flex items-start gap-2.5 text-sm", dark ? "text-ink-200" : "text-ink-600")}>
                  <span className={cn("mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full", dark ? "bg-brand-500/25 text-brand-300" : "bg-emerald-50 text-emerald-600")}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link to={ctaTo} className="mt-7">
              <span className={buttonCls(dark ? "primary" : "secondary", "lg", "w-full")}>
                {user && user.plan === plan.id ? "Current plan" : plan.cta}
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const ref = useReveal();
  return (
    <section id="pricing" className="relative py-24">
      <div className="container-x">
        <div ref={ref} className="reveal">
          <SectionHead
            center
            eyebrow="Pricing"
            title={<>Plans that pay for themselves in <span className="text-brand-600">one interview</span></>}
            desc="Start free with 10 credits. Upgrade when your job hunt heats up — cancel anytime, no lock-in."
          />
        </div>
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-full bg-ink-100 p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-bold capitalize transition-all",
                  billing === b ? "bg-white text-brand-700 shadow-sm" : "text-ink-500 hover:text-ink-800"
                )}
              >
                {b}
              </button>
            ))}
          </div>
          <Badge tone="emerald">{billing === "yearly" ? "2 months free applied" : "Save 2 months on yearly"}</Badge>
        </div>
        <PricingCards billing={billing} />
        <p className="mt-8 text-center text-xs text-ink-400">
          Prices in INR, configurable from the subscription service. UPI · Cards · Netbanking at launch. No fake checkout — payment gateway connects at go-live.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ----------------------------------- */

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useReveal();
  return (
    <section id="faq" className="py-24">
      <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div ref={ref} className="reveal">
          <SectionHead
            eyebrow="FAQ"
            title={<>Questions, answered <span className="text-brand-600">honestly</span></>}
            desc="We'd rather set the right expectations than oversell. Here's what people ask before signing up."
          />
          <div className="rounded-xl bg-brand-50 p-5 ring-1 ring-brand-100">
            <p className="text-sm font-semibold text-brand-900">Still curious?</p>
            <p className="mt-1 text-sm text-brand-800/80">Try the full product free — 10 credits, no card required.</p>
            <Link to="/register" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-900">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className={cn("overflow-hidden rounded-xl bg-white ring-1 transition-all duration-300", open === i ? "ring-brand-200 shadow-card" : "ring-ink-100")}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[15px] font-bold text-ink-800">{f.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300", open === i && "rotate-180 text-brand-600")} />
              </button>
              <div className={cn("grid transition-all duration-300", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- upgrade / credit gate --------------------------- */

export function UpgradeModal({ open, onClose, need }: { open: boolean; onClose: () => void; need?: number }) {
  const { user } = useAuth();
  return (
    <Modal open={open} onClose={onClose} title="Not enough credits">
      <p className="text-sm leading-relaxed text-ink-500">
        {need ? `This action needs ${need} credits. ` : ""}You currently have{" "}
        <strong className="text-ink-800">{user?.credits ?? 0} credits</strong> on the{" "}
        <span className="capitalize font-semibold text-ink-800">{user?.plan}</span> plan. Upgrade to keep the momentum going.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {PLANS.filter((p) => p.id !== "free").map((p) => (
          <div key={p.id} className={cn("rounded-xl p-4 ring-1", p.highlight ? "bg-ink-900 text-white ring-brand-500/40" : "bg-white ring-ink-200")}>
            <p className={cn("font-display text-sm font-bold", p.highlight ? "text-white" : "text-ink-900")}>{p.name}</p>
            <p className={cn("mt-1 font-display text-2xl font-bold", p.highlight ? "text-brand-300" : "text-brand-700")}>
              {CURRENCY}{p.monthly}<span className={cn("text-xs font-semibold", p.highlight ? "text-ink-400" : "text-ink-400")}>/mo</span>
            </p>
            <p className={cn("mt-1 text-xs font-semibold", p.highlight ? "text-ink-300" : "text-ink-500")}>{p.credits} credits / month</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-amber-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-amber-800 ring-1 ring-amber-200">
        Payments (UPI / cards / netbanking) connect at launch — no charge is made in demo mode and there is no fake checkout.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Not now</Button>
        <Link to="/pricing" onClick={onClose}><Button>View pricing</Button></Link>
      </div>
    </Modal>
  );
}

/* -------------------------------- final CTA -------------------------------- */

export function FinalCta() {
  const { user } = useAuth();
  const ref = useReveal();
  return (
    <section className="container-x pb-24">
      <div ref={ref} className="reveal relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-16 text-center sm:px-16 sm:py-20">
        <div className="absolute inset-0 bg-grid-dark opacity-70" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-700/30 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-500/20 blur-[100px]" />
        <div className="relative">
          <Badge tone="brand" className="bg-brand-500/15 text-brand-200 ring-brand-400/30">
            <Sparkles className="h-3.5 w-3.5" /> Free 10 credits · No card required
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold leading-[1.12] text-white sm:text-5xl">
            Your next interview is one <span className="text-brand-300">analysis</span> away
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-300">
            Upload your resume, paste a job description, and know exactly what to fix — before the recruiter does.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? "/job-match" : "/register"}>
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                {user ? "Analyze a Job Match" : "Start Free — Analyze My Resume"}
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="dark" className="bg-white/10 ring-1 ring-white/20 hover:bg-white/15">View Pricing</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
