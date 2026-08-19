import mongoose from "mongoose";

const STATUSES = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 120 },
    dateApplied: { type: Date, default: Date.now },
    status: { type: String, enum: STATUSES, default: "Saved", index: true },
    nextStep: { type: String, trim: true, maxlength: 200 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, dateApplied: -1 });
export default mongoose.model("Application", applicationSchema);
