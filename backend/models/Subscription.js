import mongoose from "mongoose";

/**
 * Subscription lifecycle — designed for an Indian payment gateway (Razorpay).
 * No fake success: a subscription only becomes `active` via the gateway webhook
 * after payment capture.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["free", "starter", "pro"], default: "free" },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    status: { type: String, enum: ["active", "past_due", "canceled", "pending_payment"], default: "active" },
    gateway: { type: String, default: "razorpay" },
    gatewaySubscriptionId: String,
    gatewayOrderId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    creditsGrantedThisPeriod: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
