import { Router } from "express";
import { z } from "zod";
import { register, login, forgotPassword, resetPassword } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters").max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(z.object({ email: z.string().trim().email() })), forgotPassword);
router.post("/reset-password", validate(z.object({ token: z.string().min(10), password: z.string().min(6).max(128) })), resetPassword);

export default router;
