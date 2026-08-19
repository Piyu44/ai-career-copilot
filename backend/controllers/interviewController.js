import Interview from "../models/Interview.js";
import * as aiService from "../services/aiService.js";
import * as creditService from "../services/creditService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/** POST /api/interview/start — builds a 5-question session */
export const startInterview = asyncHandler(async (req, res) => {
  const { role, type, difficulty } = req.body;
  await creditService.consumeCredits(req.user._id, "interview", { role });

  const questions = await aiService.generateInterviewQuestions({ role, type, difficulty, count: 5 });
  const doc = await Interview.create({
    userId: req.user._id, role, type, difficulty,
    questions: questions.map((q) => ({ questionId: q.id, text: q.text, type: q.type, difficulty: q.difficulty })),
  });
  res.status(201).json(doc);
});

/** POST /api/interview/:id/answer — evaluates one answer, advances the session */
export const submitAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const session = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) throw new AppError("Interview session not found.", 404);
  if (session.status === "completed") throw new AppError("Session already completed.", 409);

  const current = session.questions[session.currentQuestionIndex];
  const evaluation = await aiService.evaluateInterviewAnswer({ question: current, answer, role: session.role });

  session.answers.push({ questionIndex: session.currentQuestionIndex, answer, evaluation });
  session.currentQuestionIndex += 1;

  if (session.currentQuestionIndex >= session.questions.length) {
    session.status = "completed";
    session.averageScore =
      Math.round((session.answers.reduce((s, a) => s + a.evaluation.overall, 0) / session.answers.length) * 10) / 10;
  }
  await session.save();

  res.json({
    evaluation,
    questionIndex: session.currentQuestionIndex,
    completed: session.status === "completed",
    nextQuestion: session.questions[session.currentQuestionIndex] ?? null,
    averageScore: session.averageScore,
  });
});

/** GET /api/interview — history */
export const listInterviews = asyncHandler(async (req, res) => {
  res.json(await Interview.find({ userId: req.user._id }).sort("-createdAt").limit(20).lean());
});
