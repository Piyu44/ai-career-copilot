import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, required: true, trim: true },
    type: { type: String, enum: ["technical", "hr", "behavioral", "mixed"], default: "technical" },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    currentQuestionIndex: { type: Number, default: 0 },
    questions: [
      {
        questionId: String,
        text: String,
        type: String,
        difficulty: String,
      },
    ],
    answers: [
      {
        questionIndex: Number,
        answer: String,
        evaluation: {
          overall: Number,
          technical: Number,
          communication: Number,
          clarity: Number,
          confidence: Number,
          didWell: [String],
          missed: [String],
          betterAnswer: String,
        },
      },
    ],
    averageScore: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
