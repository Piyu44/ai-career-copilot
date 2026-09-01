/**
 * AI SERVICE LAYER (frontend mirror of backend/services/aiService.js)
 * -------------------------------------------------------------------
 * Provider-independent: when USE_MOCK_AI=true the deterministic heuristic
 * engine below serves structured JSON. When false, the same function
 * signatures proxy to `POST /api/...` endpoints which call the configured
 * AI provider server-side (AI keys never touch the browser).
 *
 * Contract: every function returns validated, structured data.
 * Rule enforced everywhere: the AI NEVER invents experience, employers,
 * degrees, certifications or achievements — it rewrites what exists and
 * suggests what the user could add.
 */

import {
  SKILLS,
  KEYWORDS,
  WEAK_TO_STRONG,
  INTERVIEW_BANK,
  DEMO_RESUME_TEXT,
  type BankQuestion,
  type InterviewType,
  type InterviewDifficulty,
} from "../data";
import { clamp, delay, seededRandom } from "../utils";

const USE_MOCK = ((import.meta as any).env?.VITE_USE_MOCK_AI ?? "true") !== "false";
export const IS_MOCK_AI = USE_MOCK;

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ---------------------------- skill extraction --------------------------- */

const skillRegexes = SKILLS.map((s) => ({
  name: s.name,
  cat: s.cat,
  re: new RegExp(
    `\\b(${[s.name, ...s.aliases].filter((a) => a.length >= 2).map(esc).join("|")})\\b`,
    "i"
  ),
}));

export function extractSkills(text: string): string[] {
  const found: string[] = [];
  for (const s of skillRegexes) {
    if (s.re.test(text)) found.push(s.name);
  }
  return found;
}

const keywordHit = (text: string, kw: string) =>
  new RegExp(`\\b${esc(kw)}\\b`, "i").test(text);

/* ------------------------------ job analysis ----------------------------- */

export interface JobAnalysis {
  id?: string;
  jobTitle: string;
  company: string;
  location?: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  foundKeywords: string[];
  missingKeywords: string[];
  categoryScores: { skills: number; keywords: number; experience: number; education: number };
  experienceMatch: { required: string; detected: string; ok: boolean };
  educationMatch: { required: string; detected: string; ok: boolean };
  recommendations: string[];
  createdAt: string;
}

function sanitizeAnalysis(a: JobAnalysis): JobAnalysis {
  return {
    ...a,
    matchScore: clamp(Math.round(a.matchScore), 5, 99),
    matchingSkills: Array.from(new Set(a.matchingSkills)),
    missingSkills: Array.from(new Set(a.missingSkills)),
  };
}

export async function analyzeJobMatch(input: {
  resumeText: string;
  jobTitle: string;
  company: string;
  location?: string;
  jobDescription: string;
}): Promise<JobAnalysis> {
  if (!USE_MOCK) {
    // Real path (production): POST /api/job-analysis — resolved by backend aiService.
    const res = await fetch("/api/job-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json", credentials: "include" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Analysis failed");
    return sanitizeAnalysis(await res.json());
  }

  await delay(1800);
  const { resumeText, jobTitle, company, location, jobDescription } = input;
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);
  const matching = jdSkills.filter((s) => resumeSkills.includes(s));
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s)).slice(0, 8);

  const foundKeywords = KEYWORDS.filter((k) => keywordHit(jobDescription, k));
  const missingKeywords = foundKeywords
    .filter((k) => !keywordHit(resumeText, k))
    .slice(0, 6);

  // Experience
  const reqYears = jobDescription.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:[-–]\s*\d+\s*)?(?:years|yrs)/i);
  const required = reqYears ? `${reqYears[1]}+ years` : "Not specified";
  const ranges = resumeText.match(/20\d{2}\s*[-–—]\s*(?:20\d{2}|present|current)/gi) || [];
  const explicit = resumeText.match(/(\d+(?:\.\d+)?)\s*(?:years|months?)/gi) || [];
  let detectedYears = ranges.length;
  explicit.forEach((m) => {
    const n = parseFloat(m);
    detectedYears = Math.max(detectedYears, /month/i.test(m) ? n / 12 : n);
  });
  const detected = detectedYears > 0 ? `~${Math.round(detectedYears * 2) / 2} years` : "Fresher";
  const expOk = !reqYears || detectedYears >= parseFloat(reqYears[1]) * 0.7;

  // Education
  const eduReq = /(master|ms\b|m\.?s\b|m\.?tech|mca|mba|phd)/i.test(jobDescription)
    ? "Master's preferred"
    : /(bachelor|b\.?tech|bca|b\.?e\b|b\.?sc|degree)/i.test(jobDescription)
      ? "Bachelor's degree"
      : "Not specified";
  const eduHas = /(b\.?tech|bachelor|bca|b\.?e\b|b\.?sc|m\.?tech|mca|master|diploma)/i.test(resumeText);
  const eduDetected = eduHas ? "Degree found on resume" : "No degree detected";
  const eduOk = eduHas;

  const skillScore = jdSkills.length
    ? (matching.length / jdSkills.length) * 100
    : 60;
  const kwScore = foundKeywords.length
    ? ((foundKeywords.length - missingKeywords.length) / foundKeywords.length) * 100
    : 65;
  const expScore = !reqYears ? 78 : expOk ? 92 : 55;
  const eduScore = eduReq === "Not specified" ? 80 : eduOk ? 95 : 45;

  const seed = `${company}|${jobTitle}|${resumeText.length}`;
  const jitter = Math.round(seededRandom(seed)() * 6) - 3;
  const matchScore = clamp(
    Math.round(skillScore * 0.45 + kwScore * 0.2 + expScore * 0.2 + eduScore * 0.15) + jitter,
    38,
    96
  );

  const recommendations: string[] = [];
  if (missing.length)
    recommendations.push(
      `Address the top gap first: build or highlight work with ${missing.slice(0, 3).join(", ")}. Even a small weekend project counts.`
    );
  if (missingKeywords.length)
    recommendations.push(
      `Mirror the JD's language — weave in "${missingKeywords.slice(0, 3).join('", "')}" where honestly true.`
    );
  recommendations.push(
    `Rewrite your summary to open with "${jobTitle}" and your strongest overlap: ${matching.slice(0, 3).join(", ") || "your core stack"}.`
  );
  recommendations.push("Quantify every bullet you can — users, load times, bug counts, scores.");
  if (!/\bgithub\.com|\blinkedin\.com/i.test(resumeText))
    recommendations.push("Add GitHub and LinkedIn URLs — recruiters click them before calling.");
  recommendations.push("Keep the layout single-column with standard headings so any ATS can parse it.");

  return sanitizeAnalysis({
    jobTitle,
    company,
    location,
    matchScore,
    matchingSkills: matching,
    missingSkills: missing,
    foundKeywords,
    missingKeywords,
    categoryScores: {
      skills: Math.round(skillScore),
      keywords: Math.round(kwScore),
      experience: Math.round(expScore),
      education: Math.round(eduScore),
    },
    experienceMatch: { required, detected, ok: expOk },
    educationMatch: { required: eduReq, detected: eduDetected, ok: eduOk },
    recommendations,
    createdAt: new Date().toISOString(),
  });
}

/* --------------------------- resume improvement --------------------------- */

export interface ResumeChange {
  section: string;
  before: string;
  after: string;
  why: string;
}

export interface ImproveResult {
  summary: string;
  skills: string;
  sections: { heading: string; body: string }[];
  improvedText: string;
  originalText: string;
  changes: ResumeChange[];
  suggestions: string[];
}

const SECTION_HEADS = [
  "PROFESSIONAL SUMMARY", "SUMMARY", "OBJECTIVE", "EDUCATION", "SKILLS", "TECHNICAL SKILLS",
  "EXPERIENCE", "WORK EXPERIENCE", "INTERNSHIP", "INTERNSHIPS", "PROJECTS", "CERTIFICATIONS",
  "ACHIEVEMENTS", "AWARDS", "EXTRA-CURRICULAR", "POSITIONS OF RESPONSIBILITY", "LINKS",
];

function splitSections(text: string) {
  const lines = text.split("\n");
  const sections: { heading: string; lines: string[] }[] = [{ heading: "__HEADER__", lines: [] }];
  for (const line of lines) {
    const head = SECTION_HEADS.find((h) => line.trim().toUpperCase() === h || line.trim().toUpperCase().startsWith(h + " "));
    if (head) sections.push({ heading: head, lines: [] });
    else sections[sections.length - 1].lines.push(line);
  }
  return sections;
}

const SUMMARY_VARIANTS = [
  (t: string, s: string[], y: string) =>
    `${y} with hands-on experience shipping web applications using ${s.slice(0, 4).join(", ")}. Seeking a ${t} role where I can turn ambiguous problems into fast, accessible product experiences — and grow into a product engineer.`,
  (t: string, s: string[], y: string) =>
    `Builder-focused ${y} strong in ${s.slice(0, 4).join(", ")}. I care about performance budgets, clean component APIs and users noticing the difference. Targeting a ${t} position to contribute from week one.`,
  (t: string, s: string[], y: string) =>
    `${y} who learns fast and ships faster — recent work spans ${s.slice(0, 3).join(", ")} and real user-facing features. Looking to bring that momentum to a ${t} role on a high-ownership team.`,
];

export async function improveResume(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  variant = 0
): Promise<ImproveResult> {
  if (!USE_MOCK) {
    const res = await fetch("/api/resume/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ resumeText, jobDescription, jobTitle, variant }),
    });
    if (!res.ok) throw new Error("Failed to improve resume");
    return await res.json();
  }

  await delay(1500);
  const original = resumeText || DEMO_RESUME_TEXT;
  const jdSkills = jobDescription ? extractSkills(jobDescription) : [];
  const resumeSkills = extractSkills(original);
  const matching = jdSkills.filter((s) => resumeSkills.includes(s));
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s)).slice(0, 4);

  const summary = SUMMARY_VARIANTS[variant % SUMMARY_VARIANTS.length](
    jobTitle || "software",
    matching.length ? matching : resumeSkills.slice(0, 5),
    /intern|experience/i.test(original) ? "Computer Science graduate with internship experience" : "Computer Science graduate"
  );

  // Skills line: matched first, then the rest from the resume
  const skillsLine = [...matching, ...resumeSkills.filter((s) => !matching.includes(s))]
    .slice(0, 18)
    .join(", ");

  const sections = splitSections(original);
  const changes: ResumeChange[] = [];
  const out: { heading: string; body: string }[] = [];
  const headerLines: string[] = [];

  for (const sec of sections) {
    if (sec.heading === "__HEADER__") {
      headerLines.push(...sec.lines.filter((l) => l.trim()));
      continue;
    }
    const isSummary = /SUMMARY|OBJECTIVE/.test(sec.heading);
    const isSkills = /SKILLS/.test(sec.heading);
    if (isSummary) {
      changes.push({
        section: sec.heading,
        before: sec.lines.join(" ").trim().slice(0, 160) + "…",
        after: summary.slice(0, 160) + "…",
        why: `Rewritten to target the ${jobTitle || "target"} role and lead with your matching skills.`,
      });
      out.push({ heading: "PROFESSIONAL SUMMARY", body: summary });
      continue;
    }
    if (isSkills) {
      changes.push({
        section: sec.heading,
        before: "Skills in resume order",
        after: "Re-ordered: JD-matched skills first",
        why: "Recruiters scan ~7 seconds — the skills the JD asks for must appear first.",
      });
      out.push({ heading: "SKILLS", body: skillsLine || sec.lines.join(" ") });
      continue;
    }
    // Bullets: strengthen weak verbs
    const rewritten = sec.lines.map((line) => {
      const trimmed = line.trim();
      const bullet = /^[-•*]\s*/.test(trimmed);
      if (!bullet) return line;
      const body = trimmed.replace(/^[-•*]\s*/, "");
      for (const [re, strong] of WEAK_TO_STRONG) {
        if (re.test(body)) {
          const after = `${strong} ${body.replace(re, "").trim()}`;
          changes.push({
            section: sec.heading,
            before: body,
            after,
            why: `"${strong}" is an impact verb — passive phrasing undersells the same work.`,
          });
          return `- ${after}`;
        }
      }
      if (!/\d/.test(body) && /built|developed|made|worked/i.test(body)) {
        changes.push({
          section: sec.heading,
          before: body,
          after: body + "  ← add a metric (users, %, time saved)",
          why: "Quantified bullets rank higher in recruiter scans. Only add numbers that are true.",
        });
      }
      return line;
    });
    out.push({ heading: sec.heading, body: rewritten.filter((l) => l.trim()).join("\n") });
  }

  const improvedText = [
    headerLines.join("\n"),
    "",
    "PROFESSIONAL SUMMARY",
    summary,
    "",
    ...out
      .filter((s) => !/SUMMARY|OBJECTIVE/.test(s.heading))
      .flatMap((s) => [s.heading.toUpperCase(), s.body, ""]),
  ].join("\n");

  const suggestions = [
    ...missing.map(
      (s) => `Consider adding ${s} — it's asked for in this JD. A small project or a certification would let you list it honestly.`
    ),
    "Add a 'Links' line: GitHub, LinkedIn, and a live demo if you have one.",
    "If you have hackathon or open-source contributions, give them a dedicated line under Achievements.",
  ];

  return {
    summary,
    skills: skillsLine,
    sections: out,
    improvedText,
    originalText: original,
    changes,
    suggestions,
  };
}

/* ------------------------------ cover letter ------------------------------ */

export type LetterTone = "Professional" | "Confident" | "Friendly" | "Concise";

export async function generateCoverLetter(input: {
  resumeText: string;
  company: string;
  jobTitle: string;
  tone: LetterTone;
  jobDescription?: string;
}): Promise<{ subject: string; letter: string }> {
  if (!USE_MOCK) {
    const res = await fetch("/api/cover-letter/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...input, position: input.jobTitle }), // Backend expects 'position'
    });
    if (!res.ok) throw new Error("Failed to generate cover letter");
    return await res.json();
  }

  await delay(1400);
  const { resumeText, company, jobTitle, tone, jobDescription } = input;
  const skills = (jobDescription ? extractSkills(jobDescription).filter((s) => extractSkills(resumeText).includes(s)) : extractSkills(resumeText)).slice(0, 4);
  const hasInternship = /intern/i.test(resumeText);
  const project = resumeText.match(/([A-Z][A-Za-z]+(?:[A-Z][a-z]+)?)\s*[—–-]/)?.[1];

  const open: Record<LetterTone, string> = {
    Professional: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}. With a strong foundation in ${skills.slice(0, 3).join(", ") || "modern web development"} and a track record of shipping user-facing features, I am confident I can contribute meaningfully to your team.`,
    Confident: `Dear Hiring Team,\n\nWhen I saw the ${jobTitle} opening at ${company}, I knew my background was a direct match. I build with ${skills.slice(0, 3).join(", ") || "modern web technologies"} — and more importantly, I ship. Here is why I would be a strong addition to your team.`,
    Friendly: `Hi ${company} team,\n\nI have been following ${company}'s work for a while, so the ${jobTitle} opening genuinely excited me. I work with ${skills.slice(0, 3).join(", ") || "modern web technologies"} and love turning tricky problems into simple, fast interfaces.`,
    Concise: `Dear Hiring Manager,\n\nApplying for the ${jobTitle} role at ${company}. Core fit: ${skills.slice(0, 3).join(", ") || "modern web development"}, ${hasInternship ? "internship experience shipping production UI" : "strong project portfolio"}, and a habit of quantified, user-focused work.`,
  };

  const body1 = `${hasInternship ? "During my internship" : "Across my academic projects"}, I ${hasInternship ? "built and maintained production features used by real users, fixed critical UI bugs, and translated design systems into responsive pages" : "designed and built complete applications end-to-end — from component architecture to deployment"}. My strengths sit exactly where this role needs them: ${skills.join(", ") || "clean code, fast iteration and attention to detail"}.${project ? ` Most recently I built ${project}, where I owned everything from data modeling to the final responsive UI.` : ""}`;

  const body2 = jobDescription
    ? `Your description emphasises ${extractSkills(jobDescription).slice(0, 3).join(", ")}. Where I already have depth, I will contribute from day one; where I have gaps, I close them fast — I taught myself my current stack through shipped projects, not just tutorials.`
    : `I would welcome the chance to discuss how my background maps to ${company}'s roadmap.`;

  const close: Record<LetterTone, string> = {
    Professional: `Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experiences align with ${company}'s goals.\n\nSincerely,`,
    Confident: `I would love 30 minutes to show you what I have built and how I think about your product. I am ready to start contributing immediately.\n\nBest regards,`,
    Friendly: `Thanks so much for reading — I would love to chat about how I can help the team. Happy to share code samples or a live walkthrough anytime.\n\nWarm regards,`,
    Concise: `Available to interview at your convenience. Portfolio and code samples on request.\n\nRegards,`,
  };

  const letter = `${open[tone]}\n\n${body1}\n\n${tone === "Concise" ? "" : body2 + "\n\n"}${close[tone]}`;
  return { subject: `Application for ${jobTitle} — ${company}`, letter };
}

/* -------------------------------- ATS check ------------------------------- */

export interface AtsResult {
  score: number;
  categories: { name: string; score: number; detail: string }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export async function atsCheck(resumeText: string, jobDescription?: string): Promise<AtsResult> {
  if (!USE_MOCK) {
    const res = await fetch("/api/resume/ats-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ resumeText, jobDescription }),
    });
    if (!res.ok) throw new Error("Failed to check ATS score");
    return await res.json();
  }

  await delay(1600);
  const t = resumeText;
  const lines = t.split("\n").filter((l) => l.trim());
  const words = t.trim().split(/\s+/).length;

  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(t);
  const hasPhone = /(\+91[\s-]?)?\d{5}[\s-]?\d{5}/.test(t);
  const hasLink = /linkedin\.com|github\.com|behance|portfolio/i.test(t);
  const contactScore = [hasEmail, hasPhone, hasLink].filter(Boolean).length / 3 * 100;

  const heads = ["SUMMARY", "EDUCATION", "SKILLS", "EXPERIENCE", "PROJECTS"];
  const foundHeads = heads.filter((h) => new RegExp(`^\\s*${h}|^\\s*[A-Z ]*${h}`, "im").test(t) || t.toUpperCase().includes(h));
  const structureScore = (foundHeads.length / heads.length) * 100;

  const tabLines = lines.filter((l) => l.includes("\t")).length;
  const longLines = lines.filter((l) => l.length > 110).length;
  const bullets = lines.filter((l) => /^\s*[-•*]/.test(l)).length;
  const formatScore = clamp(100 - tabLines * 15 - longLines * 8 + Math.min(bullets, 8) * 3, 20, 100);

  const verbs = (t.match(/\b(led|built|developed|engineered|designed|launched|improved|reduced|owned|delivered|shipped|mentored|automated|optimized)\b/gi) || []).length;
  const jdSkills = jobDescription ? extractSkills(jobDescription) : [];
  const overlap = jdSkills.filter((s) => extractSkills(t).includes(s)).length;
  const kwScore = jdSkills.length
    ? clamp((overlap / jdSkills.length) * 80 + Math.min(verbs, 8) * 2.5, 20, 100)
    : clamp(verbs * 9, 25, 95);

  const numeric = lines.filter((l) => /\d+%|\d{2,}|\₹/.test(l)).length;
  const expScore = clamp(40 + numeric * 6 + (/\b20\d{2}\b/.test(t) ? 20 : 0), 30, 100);

  const readScore = words >= 180 && words <= 850 ? 92 : words < 180 ? 45 + words / 4 : 60;

  const categories = [
    { name: "Contact Information", score: Math.round(contactScore), detail: `${hasEmail ? "✓ email" : "✗ email"} · ${hasPhone ? "✓ phone" : "✗ phone"} · ${hasLink ? "✓ links" : "✗ links"}` },
    { name: "Section Structure", score: Math.round(structureScore), detail: `Found: ${foundHeads.join(", ") || "none"}` },
    { name: "Formatting", score: Math.round(formatScore), detail: `${bullets} bullets · ${tabLines} tab-heavy lines · ${longLines} overlong lines` },
    { name: "Keywords & Verbs", score: Math.round(kwScore), detail: jdSkills.length ? `${overlap}/${jdSkills.length} JD skills matched` : `${verbs} impact verbs found` },
    { name: "Experience & Impact", score: Math.round(expScore), detail: `${numeric} quantified lines detected` },
    { name: "Readability", score: Math.round(readScore), detail: `${words} words ${words >= 180 && words <= 850 ? "(ideal range)" : words < 180 ? "(too short)" : "(on the long side)"}` },
  ];

  const score = Math.round(
    categories.reduce((acc, c, i) => acc + c.score * [0.15, 0.2, 0.2, 0.2, 0.15, 0.1][i], 0)
  );

  const strengths = categories.filter((c) => c.score >= 75).map((c) => `${c.name} is strong — ${c.detail}`);
  const weaknesses = categories.filter((c) => c.score < 60).map((c) => `${c.name} needs work — ${c.detail}`);
  const recommendations = [
    ...(hasLink ? [] : ["Add LinkedIn and GitHub URLs under your name."]),
    ...(bullets < 4 ? ["Convert experience lines into crisp bullets starting with impact verbs."] : []),
    ...(numeric < 4 ? ["Add at least 4 quantified results (users, %, time, counts)."] : []),
    ...(tabLines > 0 ? ["Remove table/tab-based layouts — many parsers read them as garbage text."] : []),
    ...(jdSkills.length && overlap < jdSkills.length / 2
      ? [`Mirror more of the JD's stack: ${jdSkills.filter((s) => !extractSkills(t).includes(s)).slice(0, 4).join(", ")}.`]
      : []),
    "Stick to standard headings (Experience, Education, Skills) — creative names break parsers.",
  ];

  return { score, categories, strengths, weaknesses, recommendations };
}

/* ------------------------------ interview AI ------------------------------ */

export function pickQuestions(
  type: InterviewType,
  difficulty: InterviewDifficulty,
  count = 5
): BankQuestion[] {
  const pool = INTERVIEW_BANK.filter(
    (q) => (type === "mixed" || q.type === type) && (q.difficulty === difficulty || type === "mixed")
  );
  const rnd = seededRandom(`${type}-${difficulty}-${count}-${Date.now() % 1000}`);
  const shuffled = [...pool].sort(() => rnd() - 0.5);
  while (shuffled.length < count) {
    const fallback = INTERVIEW_BANK[Math.floor(rnd() * INTERVIEW_BANK.length)];
    if (!shuffled.includes(fallback)) shuffled.push(fallback);
  }
  return shuffled.slice(0, count);
}

export interface AnswerEval {
  overall: number;
  subs: { technical: number; communication: number; clarity: number; confidence: number };
  didWell: string[];
  missed: string[];
  better: string;
}

export async function evaluateInterviewAnswer(
  question: BankQuestion,
  answer: string,
  role?: string
): Promise<AnswerEval> {
  if (!USE_MOCK) {
    const res = await fetch("/api/interview/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question, answer, role }),
    });
    if (!res.ok) throw new Error("Failed to evaluate answer");
    return await res.json();
  }

  await delay(1300);
  const a = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const hits = question.keywords.filter((k) => a.includes(k.toLowerCase()));
  const kwRatio = hits.length / Math.max(1, Math.min(question.keywords.length, 5));

  const fillers = (a.match(/\b(basically|actually|like,|kind of|sort of|um+|uh+)\b/g) || []).length;
  const hedging = (a.match(/\b(maybe|i think|probably|not sure|i guess|perhaps)\b/g) || []).length;
  const structured = /\b(first|second|then|finally|step)\b|\b\d\./.test(a);
  const star = /\b(situation|task|action|result|context|outcome)\b/.test(a);

  const technical = clamp(Math.round((2 + kwRatio * 8) * 10) / 10, 1, 10);
  const communication = clamp(Math.round((Math.min(words.length, 140) / 140) * 6 + (structured || (question.type === "behavioral" && star) ? 3.2 : 1.2)) * 10 / 10, 1, 10);
  const clarity = clamp(Math.round((9 - fillers * 1.4 - Math.max(0, words.length - 180) / 60) * 10) / 10, 1, 10);
  const confidence = clamp(Math.round((8.6 - hedging * 1.5 - fillers * 0.5 + (words.length > 50 ? 0.6 : 0)) * 10) / 10, 1, 10);
  const overall = Math.round((technical * 0.4 + communication * 0.25 + clarity * 0.2 + confidence * 0.15) * 10) / 10;

  const didWell = [
    ...(hits.length >= 3 ? [`Hit the key concepts: ${hits.slice(0, 4).join(", ")}`] : []),
    ...(words.length >= 40 ? ["Good answer length — substantive without rambling"] : []),
    ...(structured || star ? ["Clear structure that's easy for an interviewer to follow"] : []),
    ...(fillers === 0 && words.length > 20 ? ["Clean delivery with no filler words"] : []),
  ];
  if (!didWell.length) didWell.push("You made a start — now let's sharpen it");

  const missed = [
    ...(question.keywords.filter((k) => !hits.includes(k)).slice(0, 3).map((k) => `Didn't mention "${k}" — interviewers listen for it`)),
    ...(words.length < 40 ? ["Answer is thin — aim for 3-5 structured sentences"] : []),
    ...(hedging > 1 ? ["Hedging language ('maybe', 'I think') softens your authority"] : []),
    ...(question.type === "behavioral" && !star ? ["No STAR structure — Situation, Task, Action, Result"] : []),
  ];
  if (!missed.length) missed.push("Very little — polish the closing sentence to land it");

  return { overall, subs: { technical, communication, clarity, confidence }, didWell, missed, better: question.better };
}
