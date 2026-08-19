import { Router } from "express";
import { z } from "zod";
import { getProfile, updateProfile, getUsage, getSubscription } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(protect); // every /api/user route requires auth

router.get("/profile", getProfile);
router.put(
  "/profile",
  validate(z.object({ name: z.string().trim().min(2).max(80).optional(), email: z.string().trim().email().optional() })),
  updateProfile
);
router.get("/usage", getUsage);
router.get("/subscription", getSubscription);

export default router;
