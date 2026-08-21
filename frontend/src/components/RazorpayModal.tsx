import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Check, CreditCard, ShieldCheck, Sparkles, Zap, X, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { Badge, Button, Card, Modal } from "./ui";
import { CURRENCY, Plan, PLANS, PlanId } from "../data";
import { useAuth, useToast } from "../context";
import { launchRazorpayCheckout, RazorpayPaymentSuccess } from "../services/razorpay";
import { cn } from "../utils";

interface RazorpayModalProps {
  open: boolean;
  onClose: () => void;
  selectedPlanId?: PlanId;
  defaultBilling?: "monthly" | "yearly";
}

export function RazorpayModal({
  open,
  onClose,
  selectedPlanId = "pro",
  defaultBilling = "monthly",
}: RazorpayModalProps) {
  const { user, upgradePlan } = useAuth();
  const { toast } = useToast();
  const [activePlanId, setActivePlanId] = useState<PlanId>(selectedPlanId);
  const [billing, setBilling] = useState<"monthly" | "yearly">(defaultBilling);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLANS.find((p) => p.id === activePlanId) || PLANS[2];
  const price = billing === "monthly" ? plan.monthly : plan.yearly;

  const handlePaymentSuccess = async (res: RazorpayPaymentSuccess | { razorpay_payment_id: string }) => {
    setProcessing(true);
    setError(null);
    try {
      await upgradePlan(plan.id, billing, res.razorpay_payment_id);
      
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#ec4899", "#10b981", "#3b82f6"],
        });
      } catch {
        // Confetti optional
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update subscription");
    } finally {
      setProcessing(false);
    }
  };

  const handleLiveCheckout = async () => {
    if (!user) {
      toast({ title: "Please log in first", tone: "warning" });
      return;
    }
    setProcessing(true);
    setError(null);

    await launchRazorpayCheckout({
      plan,
      billing,
      user,
      onSuccess: (res) => {
        handlePaymentSuccess(res);
      },
      onError: (err) => {
        setProcessing(false);
        const msg = err?.message || err?.description || "Payment was cancelled or failed.";
        setError(msg);
        toast({ title: "Payment Issue", desc: msg, tone: "error" });
      },
      onDismiss: () => {
        setProcessing(false);
      },
    });
  };

  const handleSimulationTest = () => {
    const fakePaymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    handlePaymentSuccess({ razorpay_payment_id: fakePaymentId });
  };

  return (
    <Modal open={open} onClose={onClose} title="Upgrade Your Career Plan">
      <div className="space-y-5">
        {/* Plan Switcher */}
        <div className="grid grid-cols-2 gap-2">
          {PLANS.filter((p) => p.id !== "free").map((p) => {
            const isSelected = p.id === activePlanId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePlanId(p.id);
                  setError(null);
                }}
                className={cn(
                  "flex flex-col items-start rounded-xl p-3.5 text-left transition-all",
                  isSelected
                    ? "bg-gradient-to-br from-brand-600/30 to-brand-900/40 ring-2 ring-brand-400 text-white shadow-lg"
                    : "glass-chip text-ink-600 hover:bg-white/10 ring-1 ring-white/10"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-sm font-bold">{p.name}</span>
                  {p.highlight && <Badge tone="brand" className="text-[10px]">Popular</Badge>}
                </div>
                <p className="mt-1 font-display text-lg font-bold text-brand-300">
                  {CURRENCY}{billing === "monthly" ? p.monthly : p.yearly}
                  <span className="text-xs font-normal text-ink-400">/{billing === "monthly" ? "mo" : "yr"}</span>
                </p>
                <span className="text-[11px] font-medium text-ink-300">+{p.credits} Credits</span>
              </button>
            );
          })}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
          <div className="flex gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                billing === "monthly"
                  ? "bg-brand-500 text-white shadow"
                  : "text-ink-400 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                billing === "yearly"
                  ? "bg-brand-500 text-white shadow"
                  : "text-ink-400 hover:text-white"
              )}
            >
              Yearly
            </button>
          </div>
          <span className="text-xs font-semibold text-emerald-400">
            {billing === "yearly" ? "🎉 2 Months Free Applied" : "Save 16% on Yearly"}
          </span>
        </div>

        {/* Order Summary Card */}
        <div className="rounded-2xl bg-gradient-to-br from-coal-800 to-coal-950 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between text-sm text-ink-300">
            <span>Selected Tier</span>
            <span className="font-bold text-white">{plan.name} Plan ({billing})</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-ink-300">
            <span>Credits Allocated</span>
            <span className="font-bold text-brand-300">+{plan.credits} AI Credits</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="font-display font-bold text-white">Total Amount</span>
            <span className="font-display text-2xl font-bold text-emerald-400">
              {CURRENCY}{price}
            </span>
          </div>
        </div>

        {/* Payment Methods Supported */}
        <div className="rounded-xl bg-white/5 p-3 text-center ring-1 ring-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            Supported Payment Methods via Razorpay
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-300">
            <span className="rounded-md bg-white/10 px-2 py-1 font-semibold">⚡ UPI (GPay / PhonePe / Paytm)</span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-semibold">💳 Credit / Debit Cards</span>
            <span className="rounded-md bg-white/10 px-2 py-1 font-semibold">🏦 NetBanking</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/25">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <Button
            size="lg"
            className="w-full"
            loading={processing}
            onClick={handleLiveCheckout}
            icon={<CreditCard className="h-4 w-4" />}
          >
            Pay {CURRENCY}{price} with Razorpay
          </Button>

          <Button
            variant="secondary"
            size="md"
            className="w-full"
            loading={processing}
            onClick={handleSimulationTest}
            icon={<Sparkles className="h-4 w-4 text-brand-300" />}
          >
            ⚡ 1-Click Instant Test Mode (Simulate Success)
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-center text-xs text-ink-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>256-bit SSL Encrypted • Instant Plan Activation</span>
        </div>
      </div>
    </Modal>
  );
}
