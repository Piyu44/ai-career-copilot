import User from "../models/User.js";
import Usage from "../models/Usage.js";
import Subscription from "../models/Subscription.js";
import { PLANS } from "../config/plans.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/user/profile */
export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeJSON());
});

/** PUT /api/user/profile — name/email only; plan changes go through billing */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name && { name }), ...(email && { email: email.toLowerCase() }) },
    { new: true, runValidators: true }
  );
  res.json(user.toSafeJSON());
});

/** GET /api/user/usage — credit ledger */
export const getUsage = asyncHandler(async (req, res) => {
  res.json(await Usage.find({ userId: req.user._id }).sort("-createdAt").limit(60).lean());
});

/** GET /api/user/subscription — plan + catalogue (prices served, never hard-coded in UI) */
export const getSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id }).lean();
  res.json({
    plans: PLANS,
    current: {
      plan: req.user.plan,
      credits: req.user.credits,
      subscription: sub ?? null,
    },
  });
});
