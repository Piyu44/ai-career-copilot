import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { PLANS } from "../config/plans.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    plan: { type: String, enum: Object.keys(PLANS), default: "free" },
    credits: { type: Number, default: PLANS.free.creditsOnSignup, min: 0 },
    resetToken: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

/** Never leak hashes/tokens, even on accidental serialization */
userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    plan: this.plan,
    credits: this.credits,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
