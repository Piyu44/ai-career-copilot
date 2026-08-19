import mongoose from "mongoose";

/** Uploaded resume — file lives in the storage service; parsed text is indexed here. */
const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    fileName: { type: String },
    mimeType: { type: String, enum: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"] },
    sizeBytes: { type: Number, max: 5 * 1024 * 1024 },
    storageKey: { type: String },          // key inside the storage adapter (local/S3)
    extractedText: { type: String },       // populated by the parsing pipeline
    isMaster: { type: Boolean, default: false },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("Resume", resumeSchema);
