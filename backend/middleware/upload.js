import multer from "multer";
import path from "path";
import { AppError } from "../utils/AppError.js";

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || "uploads",
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname)}`),
});

export const uploadResume = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype))
      return cb(new AppError("Unsupported file type. Upload PDF, DOCX or TXT.", 415));
    cb(null, true);
  },
});
