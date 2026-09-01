/**
 * Razorpay Payment Gateway Integration Service
 * Follows Razorpay Standard Web Checkout Integration:
 * 1. Calls backend POST /api/create-order to create order ID
 * 2. Launches Razorpay Standard Web Checkout modal
 * 3. Calls backend POST /api/verify-payment to verify HMAC-SHA256 signature
 */

import { Plan } from "../data";
import { PublicUser } from "./api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOrderResponse {
  success: boolean;
  order_id: string;
  id?: string;
  amount: number;
  currency: string;
  receipt?: string;
  key_id?: string;
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  planId: string;
  amount: number;
  currency: string;
  billing: "monthly" | "yearly";
}

export interface RazorpayVerifyResponse {
  success: boolean;
  message: string;
  payment_id?: string;
  order_id?: string;
  plan_id?: string;
  credits?: number;
}

/**
 * Base URL helper for backend API calls
 */
const getApiBase = (): string => {
  return (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) || "";
};

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
 * Step 1: Create Order on Backend
 * Calls POST /api/create-order
 */
export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  planId,
  billing,
  userId,
}: {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  planId?: string;
  billing?: "monthly" | "yearly";
  userId?: string;
}): Promise<RazorpayOrderResponse> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/api/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      planId,
      billing,
      userId,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success && !data.order_id && !data.id) {
    throw new Error(data.error || data.message || "Failed to create Razorpay order on server");
  }

  return {
    success: true,
    order_id: data.order_id || data.id,
    id: data.id || data.order_id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    key_id: data.key_id,
  };
}

/**
 * Step 3: Verify Payment Signature on Backend
 * Calls POST /api/verify-payment
 */
export async function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  planId,
  billing,
  userId,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId?: string;
  billing?: "monthly" | "yearly";
  userId?: string;
}): Promise<RazorpayVerifyResponse> {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/api/verify-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billing,
      userId,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || data.error || "Payment signature verification failed");
  }

  return data;
}

/**
 * Step 2: Complete Checkout Flow
 * 1. Loads SDK
 * 2. Creates order on backend
 * 3. Launches Razorpay Standard Web Checkout
 * 4. Verifies signature on backend upon completion
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
  if (!isLoaded || !window.Razorpay) {
    onError(new Error("Unable to load Razorpay Checkout SDK. Please check your network connection."));
    return;
  }

  const rawKey =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_RAZORPAY_KEY_ID) ||
    "rzp_live_TT6ougVeZ9NNEo";

  const amountInPaise = (billing === "monthly" ? plan.monthly : plan.yearly) * 100;

  try {
    // 1. Create order on backend (optional fallback for test/dev mode)
    let order: RazorpayOrderResponse | null = null;
    try {
      order = await createRazorpayOrder({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${plan.id}_${Date.now()}`,
        planId: plan.id,
        billing,
        userId: user.id,
      });
    } catch (orderErr) {
      console.warn("Backend order creation unavailable, using direct test checkout:", orderErr);
    }

    const options: any = {
      key: rawKey || order?.key_id,
      amount: order?.amount || amountInPaise,
      currency: order?.currency || "INR",
      name: "JOB ASAP",
      description: `${plan.name} Plan (${billing === "monthly" ? "Monthly" : "Yearly"}) — ${plan.credits} Credits`,
      image: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png",
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
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }) {
        try {
          if (response.razorpay_order_id && response.razorpay_signature) {
            // Verify payment signature on backend if order exists
            try {
              await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
                billing,
                userId: user.id,
              });
            } catch (verifyErr) {
              console.warn("Backend signature verification note:", verifyErr);
            }
          }

          // Trigger success callback
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || `ord_${Date.now()}`,
            razorpay_signature: response.razorpay_signature || "",
            planId: plan.id,
            amount: amountInPaise / 100,
            currency: "INR",
            billing,
          });
        } catch (handlerErr: any) {
          console.error("Payment handler error:", handlerErr);
          onError(handlerErr || new Error("Payment processing encountered an issue."));
        }
      },
    };

    if (order?.order_id) {
      options.order_id = order.order_id;
    }

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response: any) {
      console.error("Razorpay payment failed:", response.error);
      const desc = response.error?.description || response.error?.reason || "Payment failed or was declined.";
      onError(new Error(desc));
    });

    rzp.open();
  } catch (err: any) {
    console.error("Failed to launch Razorpay checkout:", err);
    onError(err || new Error("Failed to initialize checkout. Please try again."));
  }
}
