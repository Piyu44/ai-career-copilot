/**
 * Groq AI Provider (Ultra-fast LLM inference using LLaMA-3.3-70B / LLaMA-3.1-8B).
 * Uses Groq's OpenAI-compatible endpoint with JSON mode.
 */

const NO_FABRICATION =
  "Never invent experience, employers, degrees, certifications or achievements. " +
  "Rewrite only what exists; where information is missing, suggest what the user could add. " +
  "Respond with valid JSON only.";

async function callGroq(systemPrompt, userPrompt, { json = true } = {}) {
  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY or AI_API_KEY is required for Groq AI provider.");
  }

  const model = process.env.GROQ_MODEL || process.env.AI_MODEL || "llama-3.3-70b-versatile";
  const url = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  if (!json) return content;

  try {
    return JSON.parse(content);
  } catch (err) {
    const cleaned = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned);
  }
}

export const groqProvider = {
  name: "groq",

  analyzeJobMatch({ resumeText, jobTitle, company, location, jobDescription }) {
    return callGroq(
      `You are an expert AI resume-vs-JD analyzer. ${NO_FABRICATION}
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
    return callGroq(
      `You are an expert resume writer. Improve this resume for the target role while strictly adhering to real credentials. ${NO_FABRICATION}
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
      `Target Role: ${jobTitle || "Professional"}\nVariant: ${variant}\n\nRESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jobDescription || "General improvement"}`
    );
  },

  generateCoverLetter({ resumeText, company, position, tone = "Professional", jobDescription }) {
    return callGroq(
      `Write a highly personalized, compelling ${tone} cover letter based on the provided resume and target job. ${NO_FABRICATION}
Return valid JSON format:
{
  "subject": string,
  "letter": string
}`,
      `Company: ${company}\nPosition: ${position}\nTone: ${tone}\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription || "none"}`
    );
  },

  async generateInterviewQuestions({ role, type = "mixed", difficulty = "medium", count = 5 }) {
    const res = await callGroq(
      `Generate ${count} ${difficulty} ${type} interview questions for a ${role} position.
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
    return callGroq(
      `Evaluate this interview response for a ${role} position on a scale of 1-10 across technical depth, communication, clarity, and confidence. ${NO_FABRICATION}
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
      `QUESTION: ${question.text}\nKEY CONCEPTS: ${(question.keywords || []).join(", ")}\n\nCANDIDATE ANSWER:\n${answer}`
    );
  },

  atsCheck({ resumeText, jobDescription }) {
    return callGroq(
      `Analyze this resume for Applicant Tracking System (ATS) readability, formatting strength, and keyword density.
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
      `RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION (optional):\n${jobDescription || "none"}`
    );
  },
};

export default groqProvider;
