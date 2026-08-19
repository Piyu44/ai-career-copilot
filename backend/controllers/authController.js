import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import { PLANS } from "../config/plans.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sign = (user) =>
  jwt.sign({ sub: user._id.toString(), plan: user.plan }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError("An account with this email already exists.", 409);

  const user = await User.create({ name, email, passwordHash: password });
  await Subscription.create({ userId: user._id, plan: "free" });

  res.status(201).json({ token: sign(user), user: user.toSafeJSON() });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user || !(await user.comparePassword(password)))
    throw new AppError("Invalid email or password.", 401);

  res.json({ token: sign(user), user: user.toSafeJSON() });
});

/** POST /api/auth/forgot-password — issues a one-time token (email dispatch wired at launch) */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetExpires = Date.now() + 30 * 60 * 1000;
    await user.save();
    // TODO(email-service): send reset link containing `token`
  }
  // Do not reveal whether the email exists
  res.json({ message: "If that email is registered, a reset link has been sent." });
});

/** POST /api/auth/reset-password */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ resetToken: hashed, resetExpires: { $gt: Date.now() } }).select("+resetToken +resetExpires");
  if (!user) throw new AppError("Reset link is invalid or expired.", 400);

  user.passwordHash = password;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();
  res.json({ message: "Password updated. Log in with your new password." });
});
