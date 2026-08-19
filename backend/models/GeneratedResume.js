import mongoose from "mongoose";

/** AI-improved resume tied to a target job analysis. */
const generatedResumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    analysisId: { type: mongoose.Types.ObjectId, ref: "JobAnalysis" },
    originalText: { type: String, required: true },
    improvedText: { type: String, required: true },
    summary: String,
    skills: String,
    changes: [
      {
        section: String,
        before: String,
        after: String,
        why: String,
      },
    ],
    suggestions: [String], // "could add" items — never invented facts
    variant: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("GeneratedResume", generatedResumeSchema);
