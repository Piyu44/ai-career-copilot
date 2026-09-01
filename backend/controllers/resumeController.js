import { FirebaseResume } from "../services/firebaseResume.js";
import { FirebaseGeneratedResume } from "../services/firebaseModels.js";
import * as aiService from "../services/aiService.js";
import * as creditService from "../services/creditService.js";
import { storageService } from "../services/storageService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** POST /api/resume/upload — validated file → storage adapter → Resume doc */
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded.", 422);
  const key = `resumes/${req.user._id}/${req.file.filename}`;
  const { url } = await storageService.save(req.file, key);

  const doc = await FirebaseResume.create({
    userId: req.user._id,
    name: req.body.name || req.file.originalname,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    storageKey: key,
    extractedText: req.body.extractedText || "",
  });
  res.status(201).json({ resume: doc, url });
});

/** GET /api/resume */
export const listResumes = asyncHandler(async (req, res) => {
  const list = await FirebaseResume.find({ userId: req.user._id });
  res.json(list);
});

/** POST /api/resume/improve */
export const improveResume = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription, jobTitle, variant = 0 } = req.body;
  if (!resumeText || resumeText.length < 80) throw new AppError("Resume text is too short.", 422);

  await creditService.consumeCredits(req.user._id, "improve");
  const result = await aiService.improveResume({ resumeText, jobDescription, jobTitle, variant });
  const doc = await FirebaseGeneratedResume.create({ userId: req.user._id, ...result, variant });
  res.status(201).json(doc);
});

/** POST /api/resume/ats-check */
export const atsCheck = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || resumeText.length < 80) throw new AppError("Resume text is too short.", 422);
  await creditService.consumeCredits(req.user._id, "ats");
  res.json(await aiService.atsCheck({ resumeText, jobDescription }));
});

export default {
  uploadResume,
  listResumes,
  improveResume,
  atsCheck,
};
