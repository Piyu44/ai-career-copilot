import mongoose from "mongoose";

const jobAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    resumeId: { type: mongoose.Types.ObjectId, ref: "Resume" },
    jobTitle: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 120 },
    jobDescription: { type: String, required: true, maxlength: 20000 },
    matchScore: { type: Number, min: 0, max: 100 },
    matchingSkills: [String],
    missingSkills: [String],
    foundKeywords: [String],
    missingKeywords: [String],
    categoryScores: {
      skills: Number,
      keywords: Number,
      experience: Number,
      education: Number,
    },
    experienceMatch: { required: String, detected: String, ok: Boolean },
    educationMatch: { required: String, detected: String, ok: Boolean },
    recommendations: [String],
    provider: { type: String, default: "mock" }, // which AI provider produced this
  },
  { timestamps: true }
);

jobAnalysisSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("JobAnalysis", jobAnalysisSchema);
