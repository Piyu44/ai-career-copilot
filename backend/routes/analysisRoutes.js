import { Router } from "express";
import { z } from "zod";
import { createAnalysis, listAnalyses, getAnalysis, deleteAnalysis } from "../controllers/jobAnalysisController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(protect);

const analysisSchema = z.object({
  resumeId: z.string().optional(),
  resumeText: z.string().min(80, "Resume text is too short").max(40000).optional(),
  jobTitle: z.string().trim().min(2).max(120),
  company: z.string().trim().max(120).optional().default(""),
  location: z.string().trim().max(120).optional().default(""),
  jobDescription: z.string().min(80, "Paste the full job description").max(20000),
}).refine((d) => d.resumeId || d.resumeText, { message: "Provide resumeId or resumeText" });

router.post("/", validate(analysisSchema), createAnalysis);
router.get("/", listAnalyses);
router.get("/:id", getAnalysis);
router.delete("/:id", deleteAnalysis);

export default router;
