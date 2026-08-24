import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = Router();

/**
 * Razorpay Payment Gateway Routes
 * POST /api/create-order
 * POST /api/verify-payment
 */
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

// Alias routes for /api/payment/* mounting
router.post("/order", createOrder);
router.post("/verify", verifyPayment);

export default router;
