import { Router } from "express";
import { z } from "zod";
import { generate, list } from "../controllers/coverLetterController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(protect);

router.post(
  "/generate",
  validate(z.object({
    resumeText: z.string().min(80).max(40000),
    company: z.string().trim().min(1).max(120),
    position: z.string().trim().min(1).max(120),
    tone: z.enum(["Professional", "Confident", "Friendly", "Concise"]).default("Professional"),
    jobDescription: z.string().max(20000).optional(),
  })),
  generate
);

router.get("/", list);

export default router;
