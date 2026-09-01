import crypto from "crypto";
import { getRazorpayClient } from "../config/razorpay.js";
import { PLANS } from "../config/plans.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FirebaseUser } from "../services/firebaseUser.js";
import { FirebaseSubscription } from "../services/firebaseModels.js";

/**
 * POST /api/create-order
 * Creates a standard Razorpay order with amount in paise.
 * Minimum amount is 100 paise (₹1.00).
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt, planId, billing, notes } = req.body;

  // 1. Validate amount >= 100 paise
  const numericAmount = Number(amount);
  if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
    throw new AppError("Invalid amount. Minimum order amount is 100 paise (₹1.00).", 400);
  }

  try {
    const razorpay = getRazorpayClient();

    const orderOptions = {
      amount: Math.round(numericAmount), // Amount in paise
      currency: (currency || "INR").toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      notes: {
        plan_id: planId || "pro",
        billing_cycle: billing || "monthly",
        user_id: req.user?._id?.toString() || req.body.userId || "guest",
        ...(notes || {}),
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    if (error.statusCode === 401 || (error?.error?.code === "BAD_REQUEST_ERROR" && error?.error?.description?.includes("key"))) {
      return res.status(401).json({
        success: false,
        error: "Razorpay authentication failed. Verify API Key and Secret.",
      });
    }

    const statusCode = error.statusCode || 500;
    const errorMessage = error?.error?.description || error.message || "Failed to create Razorpay order";

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * POST /api/verify-payment
 * Verifies Razorpay payment signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET).
 * Updates user account plan and credits upon valid verification.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    order_id,
    razorpay_payment_id,
    payment_id,
    razorpay_signature,
    signature,
    planId,
    billing,
    userId,
  } = req.body;

  const resolvedOrderId = razorpay_order_id || order_id;
  const resolvedPaymentId = razorpay_payment_id || payment_id;
  const resolvedSignature = razorpay_signature || signature;

  // 1. Missing fields check
  if (!resolvedOrderId || !resolvedPaymentId || !resolvedSignature) {
    return res.status(400).json({
      success: false,
      message: "Missing required payment verification fields: order_id, payment_id, and signature are required.",
    });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new AppError("RAZORPAY_KEY_SECRET is not configured on the backend.", 500);
  }

  // 2. HMAC-SHA256 algorithm: order_id + "|" + payment_id
  const payload = `${resolvedOrderId}|${resolvedPaymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  // Constant-time signature comparison to prevent timing attacks
  const genBuf = Buffer.from(generatedSignature, "utf8");
  const recBuf = Buffer.from(resolvedSignature, "utf8");
  const isMatch = genBuf.length === recBuf.length && crypto.timingSafeEqual(genBuf, recBuf);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment signature. Verification failed.",
    });
  }

  // 3. Update database entitlements if a user ID is present
  const targetUserId = req.user?._id || req.user?.id || userId;
  let userUpdated = false;
  let updatedCredits = 0;

  if (targetUserId) {
    try {
      const selectedPlan = PLANS[planId] || PLANS.pro;
      const creditsToAdd = selectedPlan.creditsMonthly || selectedPlan.creditsOnSignup || 100;

      const user = await FirebaseUser.findById(targetUserId);
      if (user) {
        user.plan = planId || "pro";
        user.credits = (user.credits || 0) + creditsToAdd;
        await user.save();
        updatedCredits = user.credits;
        userUpdated = true;

        await FirebaseSubscription.findOneAndUpdate(
          { userId: user._id },
          {
            plan: user.plan,
            billingCycle: billing || "monthly",
            status: "active",
            gateway: "razorpay",
            gatewayOrderId: resolvedOrderId,
            gatewaySubscriptionId: resolvedPaymentId,
            currentPeriodStart: new Date(),
            creditsGrantedThisPeriod: creditsToAdd,
          },
          { upsert: true, new: true }
        );
      }
    } catch (dbErr) {
      console.warn("Database user update step note:", dbErr.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    payment_id: resolvedPaymentId,
    order_id: resolvedOrderId,
    plan_id: planId,
    billing,
    userUpdated,
    credits: updatedCredits,
  });
});

export default {
  createOrder,
  verifyPayment,
};
