/**
 * Google Gemini Provider (supports gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash).
 * Uses native fetch with responseMimeType: "application/json" for structured output.
 */

const NO_FABRICATION =
  "Never invent experience, employers, degrees, certifications or achievements. " +
  "Rewrite only what exists; where information is missing, suggest what the user could add. " +
  "Respond with valid JSON only.";

async function callGemini(systemPrompt, userPrompt, { json = true } = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or AI_API_KEY is required for Gemini AI provider.");
  }

  const model = process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  if (!json) return text;

  try {
    return JSON.parse(text);
  } catch (err) {
    // If markdown backticks are wrapped
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned);
  }
}

export const geminiProvider = {
  name: "gemini",

  analyzeJobMatch({ resumeText, jobTitle, company, location, jobDescription }) {
    return callGemini(
      `You are a resume-vs-JD analyzer for the job market. ${NO_FABRICATION}
Return valid JSON format:
{
  "matchScore": number (0-100),
  "matchingSkills": string[],
  "missingSkills": string[],
  "foundKeywords": string[],
  "missingKeywords": string[],
  "categoryScores": { "skills": number, "keywords": number, "experience": number, "education": number },
  "experienceMatch": { "required": string, "detected": string, "ok": boolean },
  "educationMatch": { "required": string, "detected": string, "ok": boolean },
  "recommendations": string[]
}`,
      `RESUME:\n${resumeText}\n\nJOB TITLE: ${jobTitle}\nCOMPANY: ${company || "Not specified"}\nLOCATION: ${location || "Not specified"}\n\nJOB DESCRIPTION:\n${jobDescription}`
    );
  },

  improveResume({ resumeText, jobDescription, jobTitle, variant = 0 }) {
    return callGemini(
      `You improve resumes for a target job. ${NO_FABRICATION}
Return valid JSON format:
{
  "summary": string,
  "skills": string,
  "improvedText": string,
  "changes": [
    { "section": string, "before": string, "after": string, "why": string }
  ],
  "suggestions": string[]
}`,
      `Target role: ${jobTitle || "Professional"}\nVariant: ${variant}\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription || "General improvement"}`
    );
  },

  generateCoverLetter({ resumeText, company, position, tone = "Professional", jobDescription }) {
    return callGemini(
      `Write a ${tone} cover letter. ${NO_FABRICATION}
Return valid JSON format:
{
  "subject": string,
  "letter": string
}`,
      `Company: ${company}\nPosition: ${position}\nTone: ${tone}\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription || "none"}`
    );
  },

  async generateInterviewQuestions({ role, type = "mixed", difficulty = "medium", count = 5 }) {
    const res = await callGemini(
      `Generate ${count} ${difficulty} ${type} interview questions for a ${role} role.
Return valid JSON format:
{
  "questions": [
    { "id": string, "type": string, "difficulty": string, "text": string, "keywords": string[] }
  ]
}`,
      `Role: ${role}\nType: ${type}\nDifficulty: ${difficulty}\nCount: ${count}`
    );
    return res.questions || [];
  },

  evaluateInterviewAnswer({ question, answer, role }) {
    return callGemini(
      `Score this ${role} interview answer 1-10 on technical accuracy, communication, clarity, confidence. ${NO_FABRICATION}
Return valid JSON format:
{
  "overall": number (1-10),
  "technical": number (1-10),
  "communication": number (1-10),
  "clarity": number (1-10),
  "confidence": number (1-10),
  "didWell": string[],
  "missed": string[],
  "betterAnswer": string
}`,
      `QUESTION: ${question.text}\nKEY CONCEPTS: ${(question.keywords || []).join(", ")}\n\nANSWER: ${answer}`
    );
  },

  atsCheck({ resumeText, jobDescription }) {
    return callGemini(
      `Assess ATS parse-ability, formatting quality and keyword strength.
Return valid JSON format:
{
  "score": number (0-100),
  "categories": [
    { "name": string, "score": number, "detail": string }
  ],
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[]
}`,
      `RESUME:\n${resumeText}\n\nJOB DESCRIPTION (optional):\n${jobDescription || "none"}`
    );
  },
};
