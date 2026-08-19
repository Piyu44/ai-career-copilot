/**
 * AI SERVICE — provider-independent facade.
 * -----------------------------------------
 * Controllers call these functions; the provider is chosen by env config:
 *   USE_MOCK_AI=true  → services/providers/mockProvider.js (deterministic demo)
 *   USE_MOCK_AI=false → AI_PROVIDER adapter (openai today; add anthropic/gemini)
 *
 * Every provider must return the SAME structured JSON shapes, and every
 * response is validated here before reaching the client.
 *
 * Hard product rule enforced in all providers: the AI may rewrite and suggest,
 * but must NEVER invent experience, employers, degrees or achievements.
 */
import { mockProvider } from "./providers/mockProvider.js";
import { openaiProvider } from "./providers/openaiProvider.js";
import { AppError } from "../utils/AppError.js";

function getProvider() {
  if (process.env.USE_MOCK_AI === "false") {
    switch (process.env.AI_PROVIDER) {
      case "openai":
        if (!process.env.AI_API_KEY)
          throw new AppError("AI_API_KEY missing — set it or run with USE_MOCK_AI=true.", 503);
        return openaiProvider;
      default:
        throw new AppError(`Unknown AI_PROVIDER: ${process.env.AI_PROVIDER}`, 500);
    }
  }
  return mockProvider;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Math.round(n)));

/** Validates & normalizes an analysis payload regardless of provider. */
function validateAnalysis(a) {
  if (!a || typeof a.matchScore !== "number") throw new AppError("AI returned an invalid analysis.", 502);
  return {
    ...a,
    matchScore: clamp(a.matchScore, 1, 99),
    matchingSkills: [...new Set(a.matchingSkills || [])],
    missingSkills: [...new Set(a.missingSkills || [])],
    recommendations: (a.recommendations || []).slice(0, 10),
  };
}

export async function analyzeJobMatch({ resumeText, jobTitle, company, location, jobDescription }) {
  const result = await getProvider().analyzeJobMatch({ resumeText, jobTitle, company, location, jobDescription });
  return validateAnalysis(result);
}

export async function improveResume({ resumeText, jobDescription, jobTitle, variant = 0 }) {
  const result = await getProvider().improveResume({ resumeText, jobDescription, jobTitle, variant });
  if (!result?.improvedText) throw new AppError("AI returned an invalid resume rewrite.", 502);
  return result;
}

export async function generateCoverLetter({ resumeText, company, position, tone, jobDescription }) {
  const result = await getProvider().generateCoverLetter({ resumeText, company, position, tone, jobDescription });
  if (!result?.letter) throw new AppError("AI returned an invalid cover letter.", 502);
  return result;
}

export async function generateInterviewQuestions({ role, type, difficulty, count = 5 }) {
  const result = await getProvider().generateInterviewQuestions({ role, type, difficulty, count });
  if (!Array.isArray(result) || !result.length) throw new AppError("AI returned no interview questions.", 502);
  return result.slice(0, count);
}

export async function evaluateInterviewAnswer({ question, answer, role }) {
  const result = await getProvider().evaluateInterviewAnswer({ question, answer, role });
  if (typeof result?.overall !== "number") throw new AppError("AI returned an invalid evaluation.", 502);
  return {
    ...result,
    overall: Math.min(10, Math.max(1, result.overall)),
  };
}

export async function atsCheck({ resumeText, jobDescription }) {
  const result = await getProvider().atsCheck({ resumeText, jobDescription });
  if (typeof result?.score !== "number") throw new AppError("AI returned an invalid ATS report.", 502);
  return { ...result, score: clamp(result.score, 1, 100) };
}
