/**
 * Razorpay Payment Gateway Integration Service
 * Supports official Razorpay Checkout SDK (UPI, Cards, Netbanking)
 * and interactive simulation for local testing.
 */

import { Plan } from "../data";
import { PublicUser } from "./api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  planId: string;
  amount: number;
  currency: string;
  billing: "monthly" | "yearly";
}

/**
 * Dynamically injects Razorpay Checkout JS SDK into the DOM
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Launch Razorpay checkout popup
 */
export async function launchRazorpayCheckout({
  plan,
  billing,
  user,
  onSuccess,
  onError,
  onDismiss,
}: {
  plan: Plan;
  billing: "monthly" | "yearly";
  user: PublicUser;
  onSuccess: (res: RazorpayPaymentSuccess) => void;
  onError: (error: any) => void;
  onDismiss?: () => void;
}) {
  const isLoaded = await loadRazorpayScript();
  const rawKey =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_RAZORPAY_KEY_ID) ||
    "rzp_test_1DP5mmOlF5G5ag";

  const amount = (billing === "monthly" ? plan.monthly : plan.yearly) * 100; // in paise

  if (!isLoaded || !window.Razorpay) {
    onError(new Error("Unable to load Razorpay Checkout SDK. Please check your internet connection."));
    return;
  }

  try {
    const options = {
      key: rawKey,
      amount: amount,
      currency: "INR",
      name: "AI Career Copilot",
      description: `${plan.name} Plan (${billing === "monthly" ? "Monthly" : "Yearly"}) — ${plan.credits} Credits`,
      image: "https://cdn-icons-png.flaticon.com/512/8644/8644421.png",
      prefill: {
        name: user.name || "Career Seeker",
        email: user.email || "user@example.com",
        contact: "9999999999",
      },
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
        user_id: user.id,
        billing_cycle: billing,
      },
      theme: {
        color: "#7c3aed",
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
      },
      handler: function (response: any) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          planId: plan.id,
          amount: amount / 100,
          currency: "INR",
          billing,
        });
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      onError(response.error || new Error("Payment failed. Please try another method."));
    });
    rzp.open();
  } catch (err) {
    onError(err);
  }
}
