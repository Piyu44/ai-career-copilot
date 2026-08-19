import JobAnalysis from "../models/JobAnalysis.js";
import Resume from "../models/Resume.js";
import * as aiService from "../services/aiService.js";
import * as creditService from "../services/creditService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** POST /api/job-analysis — consumes credits, runs AI, persists result */
export const createAnalysis = asyncHandler(async (req, res) => {
  const { resumeId, resumeText, jobTitle, company, location, jobDescription } = req.body;

  let text = resumeText;
  if (!text && resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) throw new AppError("Resume not found.", 404);
    text = resume.extractedText;
  }
  if (!text || text.length < 80) throw new AppError("Resume text is too short to analyze.", 422);

  await creditService.consumeCredits(req.user._id, "analysis", { jobTitle, company });
  const result = await aiService.analyzeJobMatch({ resumeText: text, jobTitle, company, location, jobDescription });

  const doc = await JobAnalysis.create({
    userId: req.user._id, resumeId, jobTitle, company, location, jobDescription,
    provider: process.env.USE_MOCK_AI === "false" ? process.env.AI_PROVIDER : "mock",
    ...result,
  });
  res.status(201).json(doc);
});

/** GET /api/job-analysis */
export const listAnalyses = asyncHandler(async (req, res) => {
  const docs = await JobAnalysis.find({ userId: req.user._id }).sort("-createdAt").limit(50).lean();
  res.json(docs);
});

/** GET /api/job-analysis/:id — ownership enforced */
export const getAnalysis = asyncHandler(async (req, res) => {
  const doc = await JobAnalysis.findOne({ _id: req.params.id, userId: req.user._id });
  if (!doc) throw new AppError("Analysis not found.", 404);
  res.json(doc);
});

/** DELETE /api/job-analysis/:id */
export const deleteAnalysis = asyncHandler(async (req, res) => {
  const doc = await JobAnalysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!doc) throw new AppError("Analysis not found.", 404);
  res.status(204).end();
});
