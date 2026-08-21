import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { initializeFirebase } from "./config/firebase.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

/* ------------------------------- security ------------------------------- */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

/* Rate limiting — stricter on auth to blunt credential stuffing */
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false })
);
app.use(
  "/api",
  rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false })
);

/* -------------------------------- routes -------------------------------- */
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "ai-career-copilot-api", mockAi: process.env.USE_MOCK_AI !== "false" })
);
app.use("/api", routes);

/* --------------------------- error handling ------------------------------ */
app.use(notFound);
app.use(errorHandler);

/* -------------------------------- start ---------------------------------- */
const PORT = process.env.PORT || 5000;
initializeFirebase().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ AI Career Copilot API listening on :${PORT} (Firebase Realtime DB, mock AI: ${process.env.USE_MOCK_AI !== "false"})`)
  );
});
