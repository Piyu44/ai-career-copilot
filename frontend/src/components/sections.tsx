import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react";
import { CURRENCY, FAQS, PLANS, type PlanId } from "../data";
import { Badge, Button, buttonCls, Cube, Modal, Orb, Ring3D } from "./ui";
import { cn } from "../utils";
import { useAuth } from "../context";
import { useReveal } from "../hooks";

export const SectionHead = ({
  eyebrow,
  title,
  desc,
  center,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  center?: boolean;
  light?: boolean;
}) => (
  <div className={cn("mb-12 max-w-2xl", center && "mx-auto text-center")}>
    <p className="glass-chip mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-300">
      <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
    </p>
    <h2 className="font-display text-3xl font-bold leading-[1.12] text-white sm:text-[40px]">
      {title}
    </h2>
    {desc && <p className="mt-4 text-[15px] leading-relaxed text-ink-400">{desc}</p>}
  </div>
);

import { RazorpayModal } from "./RazorpayModal";

/* --------------------------------- pricing -------------------------------- */

export function PricingCards({ billing = "monthly" }: { billing?: "monthly" | "yearly" }) {
  const { user } = useAuth();
  const [checkoutPlanId, setCheckoutPlanId] = useState<PlanId | null>(null);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.monthly : plan.yearly;
          const hot = !!plan.highlight;
          const isCurrent = user && user.plan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl p-7 transition-all duration-300",
                hot
                  ? "glass-deep ring-2 ring-brand-400/45 shadow-[0_36px_80px_-30px_rgba(109,40,217,.65),0_0_50px_-12px_rgba(139,92,246,.4)] md:-translate-y-3"
                  : "glass card-hover"
              )}
            >
              {hot && (
                <>
                  <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-600/35 blur-3xl" />
                  <Badge tone="brand" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-brand-500 to-brand-700 text-white ring-brand-400/50 shadow-pop">
                    Most popular
                  </Badge>
                </>
              )}
              <h3 className={cn("font-display text-lg font-bold", hot ? "text-white" : "text-ink-800")}>{plan.name}</h3>
              <p className="mt-1 text-[13px] text-ink-400">{plan.tagline}</p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className={cn("font-display text-[42px] font-bold leading-none", hot ? "text-white text-glow" : "text-white")}>
                  {CURRENCY}{price}
                </span>
                <span className="text-sm font-medium text-ink-400">/{billing === "monthly" ? "month" : "year"}</span>
              </p>
              <p className={cn("mt-1.5 text-xs font-semibold", hot ? "text-brand-300" : "text-brand-400")}>
                {plan.credits} credits {plan.id === "free" ? "one-time" : "every month"}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-500">
                    <span className={cn("mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full", hot ? "bg-brand-500/25 text-brand-300" : "bg-emerald-400/14 text-emerald-300")}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              
              {user ? (
                <button
                  onClick={() => {
                    if (plan.id !== "free" && !isCurrent) {
                      setCheckoutPlanId(plan.id);
                    }
                  }}
                  disabled={isCurrent || plan.id === "free"}
                  className={cn(
                    "mt-7 w-full",
                    buttonCls(hot ? "primary" : "secondary", "lg", "w-full"),
                    isCurrent && "opacity-60 cursor-default"
                  )}
                >
                  {isCurrent ? "Current Plan ✓" : plan.cta}
                </button>
              ) : (
                <Link to="/register" className="mt-7">
                  <span className={buttonCls(hot ? "primary" : "secondary", "lg", "w-full")}>
                    {plan.cta}
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {checkoutPlanId && (
        <RazorpayModal
          open={!!checkoutPlanId}
          onClose={() => setCheckoutPlanId(null)}
          selectedPlanId={checkoutPlanId}
          defaultBilling={billing}
        />
      )}
    </>
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
            title={<>Plans that pay for themselves in <span className="text-brand-300 text-glow">one interview</span></>}
            desc="Start free with 10 credits. Upgrade when your job hunt heats up — cancel anytime, no lock-in."
          />
        </div>
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="glass-chip inline-flex items-center gap-1 rounded-full p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-bold capitalize transition-all",
                  billing === b ? "bg-gradient-to-b from-brand-500/40 to-brand-700/30 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2)] ring-1 ring-brand-400/30" : "text-ink-400 hover:text-white"
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
            title={<>Questions, answered <span className="text-brand-300">honestly</span></>}
            desc="We'd rather set the right expectations than oversell. Here's what people ask before signing up."
          />
          <div className="glass relative overflow-hidden rounded-xl p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-600/25 blur-2xl" />
            <p className="relative text-sm font-semibold text-white">Still curious?</p>
            <p className="relative mt-1 text-sm text-ink-400">Try the full product free — 10 credits, no card required.</p>
            <Link to="/register" className="relative mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-300 hover:text-brand-200">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className={cn("glass overflow-hidden rounded-xl transition-all duration-300", open === i && "ring-brand-400/35 shadow-[0_20px_50px_-24px_rgba(109,40,217,.55)]")}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[15px] font-bold text-ink-700">{f.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300", open === i && "rotate-180 text-brand-300")} />
              </button>
              <div className={cn("grid transition-all duration-300", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-400">{f.a}</p>
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
      <p className="text-sm leading-relaxed text-ink-400">
        {need ? `This action needs ${need} credits. ` : ""}You currently have{" "}
        <strong className="text-white">{user?.credits ?? 0} credits</strong> on the{" "}
        <span className="capitalize font-semibold text-white">{user?.plan}</span> plan. Upgrade to keep the momentum going.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {PLANS.filter((p) => p.id !== "free").map((p) => (
          <div key={p.id} className={cn("rounded-xl p-4 ring-1", p.highlight ? "bg-gradient-to-br from-coal-700 to-coal-950 text-white ring-brand-400/40" : "glass-chip text-ink-600 ring-white/12")}>
            <p className="font-display text-sm font-bold text-white">{p.name}</p>
            <p className={cn("mt-1 font-display text-2xl font-bold", p.highlight ? "text-brand-300" : "text-brand-400")}>
              {CURRENCY}{p.monthly}<span className="text-xs font-semibold text-ink-400">/mo</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-ink-400">{p.credits} credits / month</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-amber-400/10 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-amber-300 ring-1 ring-amber-400/25">
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
      <div ref={ref} className="reveal glass-deep relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16 sm:py-20">
        <div className="absolute inset-0 bg-grid-dark opacity-60 [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-700/35 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-500/25 blur-[100px]" />
        <Cube size={56} className="absolute left-[8%] top-[22%] hidden opacity-70 sm:block" />
        <Orb size={40} className="absolute right-[10%] top-[18%] hidden opacity-80 sm:block" />
        <Ring3D size={150} className="absolute -right-10 bottom-[6%] hidden opacity-50 sm:block" />
        <div className="relative">
          <Badge tone="brand">
            <Sparkles className="h-3.5 w-3.5" /> Free 10 credits · No card required
          </Badge>
          <h2 className="text-3d mx-auto mt-5 max-w-2xl font-display text-3xl font-bold leading-[1.12] text-white sm:text-5xl">
            Your next interview is one <span className="text-brand-300">analysis</span> away
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-400">
            Upload your resume, paste a job description, and know exactly what to fix — before the recruiter does.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? "/job-match" : "/register"}>
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                {user ? "Analyze a Job Match" : "Start Free — Analyze My Resume"}
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="secondary">View Pricing</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
