import { FirebaseUser } from "./firebaseUser.js";
import { FirebaseUsage } from "./firebaseModels.js";
import { costOf, PLANS } from "../config/plans.js";
import { AppError } from "../utils/AppError.js";

/**
 * Reusable credit system — every AI action flows through consumeCredits,
 * which updates user credits and writes an immutable Usage ledger row.
 */

export async function getUserCredits(userId) {
  const user = await FirebaseUser.findById(userId);
  if (!user) throw new AppError("User not found.", 404);
  return user.credits;
}

export async function hasEnoughCredits(userId, actionOrCost) {
  const cost = typeof actionOrCost === "number" ? actionOrCost : costOf(actionOrCost);
  return (await getUserCredits(userId)) >= cost;
}

/** Throws INSUFFICIENT_CREDITS (402) when the balance can't cover the action. */
export async function consumeCredits(userId, action, meta = {}) {
  const cost = costOf(action);
  if (!cost) throw new AppError(`Unknown credit action: ${action}`, 400);

  const user = await FirebaseUser.findById(userId);
  if (!user) throw new AppError("User not found.", 404);

  if (user.credits < cost) {
    throw new AppError("INSUFFICIENT_CREDITS", 402);
  }

  user.credits -= cost;
  await user.save();

  await FirebaseUsage.create({ userId, action, credits: -cost, balanceAfter: user.credits, meta });
  return user;
}

/** Grants credits (purchase, monthly refresh, promo) with a positive ledger row. */
export async function addCredits(userId, amount, action = "grant") {
  if (amount <= 0) throw new AppError("Amount must be positive.", 400);
  const user = await FirebaseUser.findById(userId);
  if (!user) throw new AppError("User not found.", 404);

  user.credits += amount;
  await user.save();

  await FirebaseUsage.create({ userId, action, credits: amount, balanceAfter: user.credits });
  return user;
}

/** Monthly refresh hook — call from a cron/webhook on each billing period. */
export async function refreshMonthlyCredits() {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (!plan.creditsMonthly) continue;
    const users = await FirebaseUser.find({ plan: planId });
    for (const u of users) await addCredits(u._id, plan.creditsMonthly, "grant");
  }
}

export default {
  getUserCredits,
  hasEnoughCredits,
  consumeCredits,
  addCredits,
  refreshMonthlyCredits,
};
