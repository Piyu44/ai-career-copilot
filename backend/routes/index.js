import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import analysisRoutes from "./analysisRoutes.js";
import resumeRoutes from "./resumeRoutes.js";
import coverLetterRoutes from "./coverLetterRoutes.js";
import interviewRoutes from "./interviewRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/job-analysis", analysisRoutes);
router.use("/resume", resumeRoutes);
router.use("/cover-letter", coverLetterRoutes);
router.use("/interview", interviewRoutes);
router.use("/applications", applicationRoutes);
router.use("/payment", paymentRoutes);
router.use("/", paymentRoutes);

export default router;
