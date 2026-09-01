import jwt from "jsonwebtoken";
import crypto from "crypto";
import { FirebaseUser } from "../services/firebaseUser.js";
import { FirebaseSubscription } from "../services/firebaseModels.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sign = (user) =>
  jwt.sign({ sub: (user._id || user.id).toString(), plan: user.plan }, process.env.JWT_SECRET || "default_jwt_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await FirebaseUser.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError("An account with this email already exists.", 409);

  const user = await FirebaseUser.create({ name, email, passwordHash: password });
  await FirebaseSubscription.create({ userId: user._id, plan: "free" });

  res.status(201).json({ token: sign(user), user: user.toSafeJSON() });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await FirebaseUser.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password)))
    throw new AppError("Invalid email or password.", 401);

  res.json({ token: sign(user), user: user.toSafeJSON() });
});

/** POST /api/auth/forgot-password — issues a one-time reset token */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await FirebaseUser.findOne({ email: req.body.email.toLowerCase() });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetToken = hashedToken;
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
  }
  // Do not reveal whether the email exists
  res.json({ message: "If that email is registered, a reset link has been sent." });
});

/** POST /api/auth/reset-password */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await FirebaseUser.findOne({ resetToken: hashedToken });
  if (!user || (user.resetExpires && new Date(user.resetExpires) < new Date())) {
    throw new AppError("Reset link is invalid or expired.", 400);
  }

  user.passwordHash = password;
  user.resetToken = null;
  user.resetExpires = null;
  await user.save();
  res.json({ message: "Password updated. Log in with your new password." });
});

/** GET /api/auth/me */
export const getMe = asyncHandler(async (req, res) => {
  const user = await FirebaseUser.findById(req.user._id || req.user.id || req.user.sub);
  if (!user) throw new AppError("User not found.", 404);
  res.json({ user: user.toSafeJSON() });
});

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
