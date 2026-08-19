import CoverLetter from "../models/CoverLetter.js";
import * as aiService from "../services/aiService.js";
import * as creditService from "../services/creditService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** POST /api/cover-letter/generate */
export const generate = asyncHandler(async (req, res) => {
  const { resumeText, company, position, tone, jobDescription } = req.body;
  if (!resumeText || resumeText.length < 80) throw new AppError("Resume text is too short.", 422);

  await creditService.consumeCredits(req.user._id, "coverLetter", { company });
  const result = await aiService.generateCoverLetter({ resumeText, company, position, tone, jobDescription });
  const doc = await CoverLetter.create({ userId: req.user._id, company, position, tone, jobDescription, ...result });
  res.status(201).json(doc);
});

/** GET /api/cover-letter */
export const list = asyncHandler(async (req, res) => {
  res.json(await CoverLetter.find({ userId: req.user._id }).sort("-createdAt").limit(30).lean());
});
