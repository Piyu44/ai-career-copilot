import mongoose from "mongoose";

/** Immutable ledger of credit consumption — powers billing audits & the usage UI. */
const usageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, enum: ["analysis", "improve", "coverLetter", "ats", "interview", "grant", "purchase"], required: true },
    credits: { type: Number, required: true }, // negative = spend, positive = grant
    balanceAfter: { type: Number, required: true },
    meta: { type: Map, of: String },
  },
  { timestamps: true }
);

usageSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("Usage", usageSchema);
