import mongoose from "mongoose";

const coverLetterSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    position: { type: String, required: true, trim: true, maxlength: 120 },
    tone: { type: String, enum: ["Professional", "Confident", "Friendly", "Concise"], default: "Professional" },
    subject: String,
    letter: { type: String, required: true },
    jobDescription: { type: String, maxlength: 20000 },
  },
  { timestamps: true }
);

coverLetterSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("CoverLetter", coverLetterSchema);
