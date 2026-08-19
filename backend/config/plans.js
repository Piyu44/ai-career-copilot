/**
 * Single source of truth for plans, pricing and credit costs.
 * UI and billing both read from here — change a number once, it applies everywhere.
 */
export const CURRENCY = "INR";

export const PLANS = {
  free: {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    creditsOnSignup: 10,
    creditsMonthly: 0,
    features: ["3 job analyses", "Basic suggestions", "Limited exports", "Community support"],
  },
  starter: {
    name: "Starter",
    priceMonthly: 199,
    priceYearly: 1990,
    creditsOnSignup: 100,
    creditsMonthly: 100,
    features: ["20 job analyses", "Resume tailoring", "Cover letters", "Interview practice", "More credits"],
  },
  pro: {
    name: "Pro",
    priceMonthly: 499,
    priceYearly: 4990,
    creditsOnSignup: 500,
    creditsMonthly: 500,
    features: ["100+ job analyses", "AI Interview Simulator", "Application Tracker", "Priority support", "Advanced resume tools"],
  },
};

/** Credit cost per AI action */
export const CREDIT_COSTS = {
  analysis: 3,
  improve: 2,
  coverLetter: 2,
  ats: 2,
  interview: 3,
};

export const planExists = (id) => Boolean(PLANS[id]);
export const costOf = (action) => CREDIT_COSTS[action] ?? 0;
