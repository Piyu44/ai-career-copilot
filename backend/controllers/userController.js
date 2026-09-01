import { FirebaseUser } from "../services/firebaseUser.js";
import { FirebaseUsage, FirebaseSubscription } from "../services/firebaseModels.js";
import { PLANS } from "../config/plans.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** GET /api/user/profile */
export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeJSON());
});

/** PUT /api/user/profile — name/email only; plan changes go through billing */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await FirebaseUser.findByIdAndUpdate(
    req.user._id || req.user.id,
    { ...(name && { name }), ...(email && { email: email.toLowerCase() }) }
  );
  res.json(user.toSafeJSON());
});

/** GET /api/user/usage — credit ledger */
export const getUsage = asyncHandler(async (req, res) => {
  const list = await FirebaseUsage.find({ userId: req.user._id || req.user.id });
  res.json(list.slice(0, 60));
});

/** GET /api/user/subscription — plan + catalogue */
export const getSubscription = asyncHandler(async (req, res) => {
  const sub = await FirebaseSubscription.findOne({ userId: req.user._id || req.user.id });
  res.json({
    plans: PLANS,
    current: {
      plan: req.user.plan,
      credits: req.user.credits,
      subscription: sub ?? null,
    },
  });
});

export default {
  getProfile,
  updateProfile,
  getUsage,
  getSubscription,
};
