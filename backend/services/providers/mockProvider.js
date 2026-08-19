/**
 * MOCK AI PROVIDER — deterministic heuristic engine used when USE_MOCK_AI=true.
 * Mirrors the frontend demo engine so both layers behave identically.
 * Swap in a real provider without touching controllers or the facade.
 */

const SKILLS = [
  ["React", ["react.js", "reactjs"]], ["JavaScript", ["js", "es6"]], ["TypeScript", ["ts"]],
  ["Next.js", ["nextjs"]], ["Redux", ["redux toolkit"]], ["HTML", ["html5"]], ["CSS", ["css3"]],
  ["Tailwind CSS", ["tailwind"]], ["Node.js", ["node", "nodejs"]], ["Express", ["express.js"]],
  ["REST APIs", ["rest api", "restful"]], ["GraphQL", []], ["Python", []], ["Java", []],
  ["Spring Boot", ["spring"]], ["C++", ["cpp"]], ["MongoDB", ["mongo"]], ["MySQL", []],
  ["PostgreSQL", ["postgres"]], ["SQL", []], ["Firebase", []], ["Git", ["github"]],
  ["Docker", []], ["Kubernetes", ["k8s"]], ["AWS", []], ["Azure", []], ["Linux", []],
  ["CI/CD", ["cicd"]], ["Jest", []], ["Figma", []], ["Data Structures", ["dsa"]],
  ["Algorithms", []], ["OOP", ["oops", "object oriented"]], ["Communication", []],
  ["Agile", ["scrum"]], ["Problem Solving", ["problem-solving"]],
].map(([name, aliases]) => ({
  name,
  re: new RegExp(`\\b(${[name, ...aliases].filter((a) => a.length >= 2).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i"),
}));

const KEYWORDS = [
  "Frontend Development", "API Integration", "Responsive Design", "State Management",
  "Performance Optimization", "Unit Testing", "Code Review", "Agile", "SDLC",
  "Microservices", "Cloud", "Deployment", "Scalability", "Accessibility", "CI/CD",
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const extractSkills = (text) => SKILLS.filter((s) => s.re.test(text)).map((s) => s.name);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const WEAK = [
  [/^worked on\b/i, "Engineered"], [/^did\b/i, "Delivered"], [/^made\b/i, "Built"],
  [/^helped( to)?\b/i, "Drove"], [/^used\b/i, "Leveraged"],
  [/^was responsible for\b/i, "Owned"], [/^handled\b/i, "Managed"],
];

const QUESTION_BANK = [
  { id: "t1", type: "technical", difficulty: "beginner", text: "Explain the difference between let, const and var in JavaScript.", keywords: ["scope", "block", "hoist", "reassign"] },
  { id: "t2", type: "technical", difficulty: "beginner", text: "What is the Virtual DOM in React and why does it matter?", keywords: ["diffing", "reconcil", "performance", "update"] },
  { id: "t3", type: "technical", difficulty: "intermediate", text: "How does the event loop work in JavaScript?", keywords: ["call stack", "queue", "microtask", "promise"] },
  { id: "t4", type: "technical", difficulty: "advanced", text: "How would you optimize a large React application?", keywords: ["code splitting", "lazy", "memo", "bundle"] },
  { id: "h1", type: "hr", difficulty: "beginner", text: "Tell me about yourself.", keywords: ["background", "project", "skill", "goal"] },
  { id: "h2", type: "hr", difficulty: "intermediate", text: "What are your salary expectations?", keywords: ["range", "market", "flexible", "research"] },
  { id: "b1", type: "behavioral", difficulty: "intermediate", text: "Tell me about a time you faced a conflict in a team.", keywords: ["listened", "perspective", "resolution", "result"] },
  { id: "b2", type: "behavioral", difficulty: "beginner", text: "Describe a project you're most proud of.", keywords: ["challenge", "built", "impact", "learned"] },
];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Math.round(n)));

export const mockProvider = {
  name: "mock",

  async analyzeJobMatch({ resumeText, jobTitle, company, location, jobDescription }) {
    await wait(600);
    const resumeSkills = extractSkills(resumeText);
    const jdSkills = extractSkills(jobDescription);
    const matching = jdSkills.filter((s) => resumeSkills.includes(s));
    const missing = jdSkills.filter((s) => !resumeSkills.includes(s)).slice(0, 8);
    const foundKeywords = KEYWORDS.filter((k) => new RegExp(`\\b${esc(k)}\\b`, "i").test(jobDescription));
    const missingKeywords = foundKeywords.filter((k) => !new RegExp(`\\b${esc(k)}\\b`, "i").test(resumeText)).slice(0, 6);

    const req = jobDescription.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years|yrs)/i);
    const ranges = resumeText.match(/20\d{2}\s*[-–]\s*(?:20\d{2}|present)/gi) || [];
    const skillScore = jdSkills.length ? (matching.length / jdSkills.length) * 100 : 60;
    const kwScore = foundKeywords.length ? ((foundKeywords.length - missingKeywords.length) / foundKeywords.length) * 100 : 65;
    const expScore = req ? (ranges.length >= parseFloat(req[1]) ? 92 : 55) : 78;
    const eduOk = /(b\.?tech|bachelor|bca|m\.?tech|mca)/i.test(resumeText);

    return {
      jobTitle, company, location,
      matchScore: clamp(skillScore * 0.45 + kwScore * 0.2 + expScore * 0.2 + (eduOk ? 90 : 45) * 0.15, 38, 96),
      matchingSkills: matching,
      missingSkills: missing,
      foundKeywords,
      missingKeywords,
      categoryScores: {
        skills: clamp(skillScore, 0, 100), keywords: clamp(kwScore, 0, 100),
        experience: expScore, education: eduOk ? 92 : 45,
      },
      experienceMatch: { required: req ? `${req[1]}+ years` : "Not specified", detected: ranges.length ? `~${ranges.length} roles` : "Fresher", ok: !req || ranges.length >= parseFloat(req[1]) * 0.7 },
      educationMatch: { required: "Bachelor's degree", detected: eduOk ? "Degree found" : "Not detected", ok: eduOk },
      recommendations: [
        missing.length && `Close the top gap first: ${missing.slice(0, 3).join(", ")} — even a weekend project counts.`,
        missingKeywords.length && `Mirror the JD language: "${missingKeywords.slice(0, 3).join('", "')}" where honestly true.`,
        `Open your summary with "${jobTitle}" and your strongest overlap: ${matching.slice(0, 3).join(", ") || "your core stack"}.`,
        "Quantify every bullet — users, percentages, time saved.",
        "Keep a single-column layout with standard headings for ATS parsing.",
      ].filter(Boolean),
    };
  },

  async improveResume({ resumeText, jobTitle }) {
    await wait(500);
    const changes = [];
    const improved = resumeText
      .split("\n")
      .map((line) => {
        const bullet = line.trim().match(/^[-•*]\s*(.*)$/);
        if (!bullet) return line;
        for (const [re, strong] of WEAK) {
          if (re.test(bullet[1])) {
            const after = `${strong} ${bullet[1].replace(re, "").trim()}`;
            changes.push({ section: "Experience", before: bullet[1], after, why: "Impact verb replaces passive phrasing." });
            return `- ${after}`;
          }
        }
        return line;
      })
      .join("\n");
    return {
      originalText: resumeText,
      improvedText: improved,
      summary: `Builder-focused graduate targeting a ${jobTitle || "software"} role — strong project portfolio, internship experience, and a habit of shipping measurable improvements.`,
      skills: extractSkills(resumeText).slice(0, 16).join(", "),
      changes,
      suggestions: [
        "Add GitHub/LinkedIn links under your name.",
        "Consider a certification in the JD's top missing skill — list it only once earned.",
      ],
    };
  },

  async generateCoverLetter({ resumeText, company, position, tone }) {
    await wait(400);
    const skills = extractSkills(resumeText).slice(0, 3).join(", ") || "modern web development";
    const letter = `Dear Hiring Manager,\n\nI am writing to apply for the ${position} role at ${company}. My background in ${skills} aligns closely with what your team is building.\n\nAcross my internship and projects I have shipped user-facing features end to end — from component architecture to deployment — and I measure my work in outcomes, not output.\n\nI would welcome the chance to discuss how I can contribute to ${company} from week one.\n\nSincerely`;
    return { subject: `Application for ${position} — ${company}`, letter, tone };
  },

  async generateInterviewQuestions({ type, difficulty, count }) {
    await wait(200);
    const pool = QUESTION_BANK.filter(
      (q) => (type === "mixed" || q.type === type) && (q.difficulty === difficulty || type === "mixed")
    );
    const out = [...pool];
    while (out.length < count) out.push(QUESTION_BANK[out.length % QUESTION_BANK.length]);
    return out.slice(0, count);
  },

  async evaluateInterviewAnswer({ question, answer }) {
    await wait(350);
    const a = answer.toLowerCase();
    const hits = (question.keywords || []).filter((k) => a.includes(k.toLowerCase()));
    const words = answer.trim().split(/\s+/).length;
    const fillers = (a.match(/\b(basically|actually|kind of|sort of)\b/g) || []).length;
    const hedging = (a.match(/\b(maybe|i think|probably|not sure)\b/g) || []).length;
    const technical = clamp((2 + (hits.length / Math.max(1, question.keywords?.length || 4)) * 8) * 10, 10, 100) / 10;
    const communication = clamp((Math.min(words, 140) / 140) * 60 + 25, 10, 100) / 10;
    const clarity = clamp(90 - fillers * 14, 10, 100) / 10;
    const confidence = clamp(86 - hedging * 15 + (words > 50 ? 6 : 0), 10, 100) / 10;
    const overall = Math.round((technical * 0.4 + communication * 0.25 + clarity * 0.2 + confidence * 0.15) * 10) / 10;
    return {
      overall,
      technical, communication, clarity, confidence,
      didWell: hits.length >= 2 ? [`Hit key concepts: ${hits.join(", ")}`] : ["You made a start"],
      missed: question.keywords?.filter((k) => !hits.includes(k)).slice(0, 3).map((k) => `Didn't mention "${k}"`) || [],
      betterAnswer: "Structure with STAR or a clear definition → example → trade-off arc, and name the exact terms interviewers listen for.",
    };
  },

  async atsCheck({ resumeText, jobDescription }) {
    await wait(450);
    const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(resumeText);
    const hasPhone = /(\+91[\s-]?)?\d{5}[\s-]?\d{5}/.test(resumeText);
    const heads = ["SUMMARY", "EDUCATION", "SKILLS", "EXPERIENCE", "PROJECTS"].filter((h) => resumeText.toUpperCase().includes(h));
    const jdSkills = jobDescription ? extractSkills(jobDescription) : [];
    const overlap = jdSkills.filter((s) => extractSkills(resumeText).includes(s)).length;
    const score = clamp(
      ((hasEmail + hasPhone) / 2) * 15 + (heads.length / 5) * 25 + Math.min(8, (resumeText.match(/^\s*[-•]/gm) || []).length) * 2 + (jdSkills.length ? (overlap / jdSkills.length) * 30 : 20) + 15,
      20, 96
    );
    return {
      score,
      categories: [
        { name: "Contact Information", score: clamp(((hasEmail + hasPhone) / 2) * 100, 0, 100), detail: `${hasEmail ? "✓" : "✗"} email · ${hasPhone ? "✓" : "✗"} phone` },
        { name: "Section Structure", score: (heads.length / 5) * 100, detail: `Found: ${heads.join(", ")}` },
        { name: "Keywords & Verbs", score: jdSkills.length ? (overlap / jdSkills.length) * 100 : 70, detail: jdSkills.length ? `${overlap}/${jdSkills.length} JD skills` : "generic check" },
      ],
      strengths: ["Single-column layout detected", ...(heads.length >= 4 ? ["Standard section headings present"] : [])],
      weaknesses: [...(!hasPhone ? ["No phone number found"] : []), ...(overlap < jdSkills.length / 2 && jdSkills.length ? ["Low JD keyword coverage"] : [])],
      recommendations: ["Quantify at least 4 bullets", "Add LinkedIn & GitHub URLs", "Keep standard heading names"],
    };
  },
};
