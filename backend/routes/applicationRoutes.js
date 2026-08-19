import { Router } from "express";
import { z } from "zod";
import { list, create, update, remove } from "../controllers/applicationController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(protect);

const applicationSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional().default(""),
  dateApplied: z.coerce.date().optional(),
  status: z.enum(["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"]).default("Saved"),
  nextStep: z.string().trim().max(200).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
});

router.get("/", list);
router.post("/", validate(applicationSchema), create);
router.put("/:id", validate(applicationSchema.partial()), update);
router.delete("/:id", remove);

export default router;
