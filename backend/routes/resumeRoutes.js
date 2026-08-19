import { Router } from "express";
import { z } from "zod";
import { uploadResume, listResumes, improveResume, atsCheck } from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadResume as uploadMiddleware } from "../middleware/upload.js";

const router = Router();
router.use(protect);

router.post("/upload", uploadMiddleware.single("file"), uploadResume);
router.get("/", listResumes);

router.post(
  "/improve",
  validate(z.object({
    resumeText: z.string().min(80).max(40000),
    jobDescription: z.string().max(20000).optional().default(""),
    jobTitle: z.string().max(120).optional().default(""),
    variant: z.number().int().min(0).max(10).optional().default(0),
  })),
  improveResume
);

router.post(
  "/ats-check",
  validate(z.object({
    resumeText: z.string().min(80).max(40000),
    jobDescription: z.string().max(20000).optional(),
  })),
  atsCheck
);

export default router;
