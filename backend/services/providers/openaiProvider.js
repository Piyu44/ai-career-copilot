/**
 * OpenAI-compatible provider (works with OpenAI, Azure OpenAI, or any
 * OpenAI-compatible endpoint via AI_BASE_URL). Requests are made with the
 * native fetch API — the key never leaves this process.
 *
 * Each call requests strict JSON and is validated by the aiService facade.
 */

const BASE = () => process.env.AI_BASE_URL || "https://api.openai.com/v1";

async function chat(system, user, { json = true } = {}) {
  const res = await fetch(`${BASE()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      response_format: json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI provider error: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  return json ? JSON.parse(content) : content;
}

const NO_FABRICATION =
  "Never invent experience, employers, degrees, certifications or achievements. " +
  "Rewrite only what exists; where information is missing, suggest what the user could add. " +
  "Respond with valid JSON only.";

export const openaiProvider = {
  name: "openai",

  analyzeJobMatch({ resumeText, jobTitle, company, location, jobDescription }) {
    return chat(
      `You are a resume-vs-JD analyzer for the Indian job market. ${NO_FABRICATION}
Return JSON: { matchScore:number 0-100, matchingSkills:string[], missingSkills:string[],
foundKeywords:string[], missingKeywords:string[],
categoryScores:{skills,keywords,experience,education} each 0-100,
experienceMatch:{required,detected,ok:boolean}, educationMatch:{required,detected,ok:boolean},
recommendations:string[5-7] }`,
      `RESUME:\n${resumeText}\n\nJOB TITLE: ${jobTitle}\nCOMPANY: ${company}\nLOCATION: ${location}\n\nJOB DESCRIPTION:\n${jobDescription}`
    );
  },

  improveResume({ resumeText, jobDescription, jobTitle, variant }) {
    return chat(
      `You improve resumes for a target job. ${NO_FABRICATION}
Return JSON: { summary:string, skills:string, improvedText:string,
changes:[{section,before,after,why}], suggestions:string[] }`,
      `Target role: ${jobTitle}\nVariant: ${variant}\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription || "none — improve generally"}`
    );
  },

  generateCoverLetter({ resumeText, company, position, tone, jobDescription }) {
    return chat(
      `Write a ${tone} cover letter. ${NO_FABRICATION}
Return JSON: { subject:string, letter:string } (letter uses \\n for paragraphs).`,
      `Company: ${company}\nPosition: ${position}\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription || "none"}`
    );
  },

  generateInterviewQuestions({ role, type, difficulty, count }) {
    return chat(
      `Generate ${count} ${difficulty} ${type} interview questions for a ${role} role in India.
Return JSON: { questions:[{id,type,difficulty,text,keywords:string[]}] }`,
      `Role: ${role}. Type: ${type === "mixed" ? "mix of technical, HR and behavioral" : type}.`
    ).then((r) => r.questions || []);
  },

  evaluateInterviewAnswer({ question, answer, role }) {
    return chat(
      `Score this ${role} interview answer 1-10 on technical, communication, clarity, confidence. ${NO_FABRICATION}
Return JSON: { overall, technical, communication, clarity, confidence,
didWell:string[], missed:string[], betterAnswer:string }`,
      `QUESTION: ${question.text}\nKEY CONCEPTS: ${(question.keywords || []).join(", ")}\n\nANSWER: ${answer}`
    );
  },

  atsCheck({ resumeText, jobDescription }) {
    return chat(
      `Assess ATS parse-ability and quality. This is an internal assessment, NOT an employer ATS score — say so where relevant.
Return JSON: { score:0-100, categories:[{name,score,detail}], strengths:string[], weaknesses:string[], recommendations:string[] }`,
      `RESUME:\n${resumeText}\n\nJOB DESCRIPTION (optional):\n${jobDescription || "none"}`
    );
  },
};
