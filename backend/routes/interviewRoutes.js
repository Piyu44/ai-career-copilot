import { Router } from "express";
import { z } from "zod";
import { startInterview, submitAnswer, listInterviews, evaluateStateless } from "../controllers/interviewController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(protect);

router.post(
  "/start",
  validate(z.object({
    role: z.string().trim().min(2).max(120),
    type: z.enum(["technical", "hr", "behavioral", "mixed"]).default("technical"),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  })),
  startInterview
);

router.post(
  "/evaluate",
  validate(z.object({ answer: z.string().trim().min(10, "Answer is too short").max(8000) })),
  evaluateStateless
);

router.post(
  "/:id/answer",
  validate(z.object({ answer: z.string().trim().min(10, "Answer is too short").max(8000) })),
  submitAnswer
);

router.get("/", listInterviews);

export default router;
