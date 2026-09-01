/**
 * Central configuration — plans, pricing, credit costs and demo content.
 * Every price/credit value in the UI reads from here, so nothing is hard-coded
 * inside components. In production these are served by GET /api/subscription.
 */

export type PlanId = "free" | "starter" | "pro";

export const CURRENCY = "₹";

export interface Plan {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  credits: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    credits: 10,
    tagline: "Try JOB ASAP free",
    features: ["3 job analyses", "Basic suggestions", "Limited exports", "Community support"],
    cta: "Start Free",
  },
  {
    id: "starter",
    name: "Starter",
    monthly: 199,
    yearly: 1990,
    credits: 100,
    tagline: "For active applicants",
    features: [
      "20 job analyses",
      "Resume tailoring",
      "Cover letters",
      "Interview practice",
      "More credits",
    ],
    cta: "Start Starter",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 499,
    yearly: 4990,
    credits: 500,
    tagline: "For serious job hunts",
    features: [
      "100+ job analyses",
      "AI Interview Simulator",
      "Application Tracker",
      "Priority support",
      "Advanced resume tools",
    ],
    highlight: true,
    cta: "Go Pro",
  },
];

export const CREDIT_COSTS = {
  analysis: 3,
  improve: 2,
  coverLetter: 2,
  ats: 2,
  interview: 3,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export const ACTION_LABELS: Record<CreditAction, string> = {
  analysis: "Job match analysis",
  improve: "Resume improvement",
  coverLetter: "Cover letter",
  ats: "ATS check",
  interview: "Interview session",
};

/* ------------------------------ skill graph ------------------------------ */

export interface SkillDef {
  name: string;
  aliases: string[];
  cat: string;
}

export const SKILLS: SkillDef[] = [
  { name: "React", aliases: ["react.js", "reactjs"], cat: "Frontend" },
  { name: "JavaScript", aliases: ["js", "es6", "vanilla js"], cat: "Languages" },
  { name: "TypeScript", aliases: ["ts"], cat: "Languages" },
  { name: "Next.js", aliases: ["nextjs", "next js"], cat: "Frontend" },
  { name: "Redux", aliases: ["redux toolkit", "react-redux"], cat: "Frontend" },
  { name: "HTML", aliases: ["html5"], cat: "Frontend" },
  { name: "CSS", aliases: ["css3"], cat: "Frontend" },
  { name: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"], cat: "Frontend" },
  { name: "Vue.js", aliases: ["vue", "vuejs"], cat: "Frontend" },
  { name: "Angular", aliases: ["angularjs"], cat: "Frontend" },
  { name: "Sass", aliases: ["scss", "sass"], cat: "Frontend" },
  { name: "jQuery", aliases: [], cat: "Frontend" },
  { name: "Node.js", aliases: ["node", "nodejs"], cat: "Backend" },
  { name: "Express", aliases: ["express.js", "expressjs"], cat: "Backend" },
  { name: "REST APIs", aliases: ["rest api", "restful", "rest"], cat: "Backend" },
  { name: "GraphQL", aliases: ["apollo"], cat: "Backend" },
  { name: "Python", aliases: ["python3"], cat: "Languages" },
  { name: "Django", aliases: [], cat: "Backend" },
  { name: "Flask", aliases: [], cat: "Backend" },
  { name: "Java", aliases: ["core java", "j2ee"], cat: "Languages" },
  { name: "Spring Boot", aliases: ["spring", "springboot"], cat: "Backend" },
  { name: "C++", aliases: ["cpp"], cat: "Languages" },
  { name: "C", aliases: ["c language"], cat: "Languages" },
  { name: "PHP", aliases: [], cat: "Backend" },
  { name: "Laravel", aliases: [], cat: "Backend" },
  { name: "MongoDB", aliases: ["mongo"], cat: "Data" },
  { name: "MySQL", aliases: ["mysql"], cat: "Data" },
  { name: "PostgreSQL", aliases: ["postgres", "psql"], cat: "Data" },
  { name: "Redis", aliases: [], cat: "Data" },
  { name: "Firebase", aliases: ["firestore"], cat: "Data" },
  { name: "SQL", aliases: ["sql queries", "sql server"], cat: "Data" },
  { name: "Git", aliases: ["git & github", "github"], cat: "DevOps" },
  { name: "GitHub Actions", aliases: ["github actions"], cat: "DevOps" },
  { name: "Docker", aliases: ["containers"], cat: "DevOps" },
  { name: "Kubernetes", aliases: ["k8s"], cat: "DevOps" },
  { name: "AWS", aliases: ["amazon web services"], cat: "DevOps" },
  { name: "Azure", aliases: ["microsoft azure"], cat: "DevOps" },
  { name: "Linux", aliases: ["unix"], cat: "DevOps" },
  { name: "CI/CD", aliases: ["cicd", "continuous integration"], cat: "DevOps" },
  { name: "Jest", aliases: ["jest testing"], cat: "Testing" },
  { name: "Cypress", aliases: [], cat: "Testing" },
  { name: "React Testing Library", aliases: ["testing library"], cat: "Testing" },
  { name: "Figma", aliases: [], cat: "Design" },
  { name: "UI/UX", aliases: ["ux", "user interface", "user experience design"], cat: "Design" },
  { name: "React Native", aliases: [], cat: "Mobile" },
  { name: "Flutter", aliases: ["dart"], cat: "Mobile" },
  { name: "Android", aliases: ["android sdk"], cat: "Mobile" },
  { name: "Machine Learning", aliases: ["ml"], cat: "Data" },
  { name: "Pandas", aliases: [], cat: "Data" },
  { name: "NumPy", aliases: ["numpy"], cat: "Data" },
  { name: "Data Structures", aliases: ["dsa", "data structures and algorithms"], cat: "CS Fundamentals" },
  { name: "Algorithms", aliases: ["algorithm design"], cat: "CS Fundamentals" },
  { name: "OOP", aliases: ["object oriented programming", "oops", "object-oriented"], cat: "CS Fundamentals" },
  { name: "Operating Systems", aliases: ["os concepts"], cat: "CS Fundamentals" },
  { name: "DBMS", aliases: ["database management"], cat: "CS Fundamentals" },
  { name: "Communication", aliases: ["communication skills"], cat: "Soft Skills" },
  { name: "Teamwork", aliases: ["team collaboration", "collaboration"], cat: "Soft Skills" },
  { name: "Problem Solving", aliases: ["problem-solving", "analytical skills"], cat: "Soft Skills" },
  { name: "Agile", aliases: ["scrum", "kanban", "sprint"], cat: "Soft Skills" },
  { name: "Leadership", aliases: ["team lead", "led a team"], cat: "Soft Skills" },
];

/** Phrases recruiters/ATS look for beyond concrete technologies */
export const KEYWORDS = [
  "Frontend Development",
  "API Integration",
  "Responsive Design",
  "State Management",
  "Performance Optimization",
  "Web Applications",
  "Unit Testing",
  "Code Review",
  "Cross-browser Compatibility",
  "Version Control",
  "Agile",
  "SDLC",
  "Microservices",
  "Cloud",
  "Deployment",
  "Debugging",
  "Scalability",
  "Accessibility",
  "Data Structures",
  "Problem Solving",
  "Object Oriented",
  "Cross-functional",
  "CI/CD",
  "User Experience",
  "Mentoring",
  "Documentation",
];

/* --------------------------- resume rewriting ---------------------------- */

export const WEAK_TO_STRONG: Array<[RegExp, string]> = [
  [/^(worked on|worked in)\b/i, "Engineered"],
  [/^did\b/i, "Delivered"],
  [/^made\b/i, "Built"],
  [/^helped( to)?\b/i, "Drove"],
  [/^used\b/i, "Leveraged"],
  [/^was responsible for\b/i, "Owned"],
  [/^handled\b/i, "Managed"],
  [/^assisted( in| with)?\b/i, "Supported"],
  [/^participated in\b/i, "Contributed to"],
  [/^created\b/i, "Developed"],
];

/* ------------------------------- demo data ------------------------------- */

export const COMPANY_CHIPS = [
  "TCS", "Infosys", "Wipro", "Swiggy", "Zomato", "Razorpay", "Flipkart",
  "Amazon", "Microsoft", "Zoho", "Paytm", "CRED", "PhonePe", "Freshworks",
];

export const DEMO_RESUME_TEXT = `AARAV MEHTA
Bengaluru, India | aarav.mehta@gmail.com | +91 98765 43210
linkedin.com/in/aaravmehta | github.com/aarav-codes

PROFESSIONAL SUMMARY
Computer Science graduate (B.Tech, 2024) with hands-on experience building responsive web applications using React, JavaScript, HTML and CSS. Completed a 6-month frontend internship and shipped 3 full projects. Looking for a frontend developer role to grow into a product engineer.

EDUCATION
B.Tech, Computer Science & Engineering — Visvesvaraya Technological University
2020 - 2024 | CGPA: 8.2/10
Class XII (PCMC) — Karnataka State Board | 2020 | 91.4%

SKILLS
React, JavaScript, HTML, CSS, Tailwind CSS, Git, GitHub, REST APIs, Firebase, Figma, Data Structures, C++, SQL, Problem Solving, Communication

EXPERIENCE
Frontend Developer Intern — PixelKart Technologies, Bengaluru
June 2023 - December 2023
- Worked on the product listing pages used by 40,000 monthly users
- Used React and REST APIs to build reusable UI components
- Helped the team fix 25+ UI bugs reported by QA
- Was responsible for converting Figma designs into responsive pages

PROJECTS
CampusConnect — Student Community Platform
- Made a social platform for 2,000+ students with React, Firebase and Tailwind CSS
- Used state management with React Context for real-time updates
QuizWhiz — Timed Quiz Application
- Built a quiz app with JavaScript with score tracking and leaderboards
- Worked on mobile-first responsive design scoring 92 on Lighthouse

CERTIFICATIONS
- Meta Front-End Developer (Coursera), 2023
- FreeCodeCamp Responsive Web Design, 2022

ACHIEVEMENTS
- Solved 300+ DSA problems on LeetCode (Knight badge)
- Winner, Smart India Hackathon internal round 2023`;

export interface SampleJD {
  title: string;
  company: string;
  location: string;
  description: string;
}

export const SAMPLE_JDS: SampleJD[] = [
  {
    title: "Frontend Developer",
    company: "Microsoft",
    location: "Bengaluru, India",
    description: `We are looking for a Frontend Developer to build the next generation of our cloud console experiences.

Responsibilities:
- Build responsive, accessible web applications using React and TypeScript
- Work on state management, performance optimization and API integration with REST APIs
- Collaborate with cross-functional teams in an Agile environment
- Participate in code review, unit testing and CI/CD pipelines
- Contribute to frontend development best practices and documentation

Requirements:
- 1-3 years of experience in frontend development
- Strong JavaScript, HTML, CSS and React skills
- Experience with Next.js, TypeScript and modern build tools
- Familiarity with Azure or any cloud platform is a plus
- Bachelor's degree in computer science or equivalent
- Excellent problem solving and communication skills`,
  },
  {
    title: "React Developer",
    company: "Swiggy",
    location: "Bengaluru, India",
    description: `Join the Swiggy web team to craft lightning-fast ordering experiences for millions of users.

Responsibilities:
- Develop and maintain high-traffic React web applications
- Own features end to end: design review, development, testing, deployment
- Improve performance optimization and web vitals for mobile-first users
- Integrate GraphQL and REST APIs with robust error handling
- Write unit tests and take part in code review

Requirements:
- 2+ years of JavaScript and React experience
- Experience with Redux, Next.js or similar state management tools
- Good understanding of data structures, algorithms and SDLC
- Experience with CI/CD, Docker and cloud deployment
- Strong collaboration skills in an Agile, fast-paced team`,
  },
  {
    title: "Software Engineer",
    company: "Amazon",
    location: "Hyderabad, India",
    description: `Amazon Hyderabad is hiring Software Engineers for its retail systems team.

Responsibilities:
- Design and build scalable backend services and web tooling
- Work with Java, Spring Boot, AWS, DynamoDB and microservices
- Drive operational excellence: monitoring, debugging, incident response
- Mentor junior engineers and contribute to technical documentation

Requirements:
- 1+ years of professional software development experience
- Strong fundamentals in data structures, algorithms and object oriented design
- Proficiency in Java, Python or C++
- Experience with SQL/NoSQL databases and distributed systems
- Bachelor's or Master's degree in CS or related field`,
  },
];

/* --------------------------- interview content --------------------------- */

export type InterviewType = "technical" | "hr" | "behavioral" | "mixed";
export type InterviewDifficulty = "beginner" | "intermediate" | "advanced";

export interface BankQuestion {
  id: string;
  type: Exclude<InterviewType, "mixed">;
  difficulty: InterviewDifficulty;
  q: string;
  keywords: string[];
  better: string;
}

export const INTERVIEW_BANK: BankQuestion[] = [
  {
    id: "t1", type: "technical", difficulty: "beginner",
    q: "Explain the difference between let, const and var in JavaScript.",
    keywords: ["scope", "block", "hoist", "reassign", "function scope", "tdz", "temporal"],
    better: "var is function-scoped and hoisted with an undefined initial value. let and const are block-scoped and live in the temporal dead zone until declaration. const cannot be reassigned (though objects it points to can still be mutated). In modern code, default to const and use let only when reassignment is needed.",
  },
  {
    id: "t2", type: "technical", difficulty: "beginner",
    q: "What is the Virtual DOM in React and why does it matter?",
    keywords: ["diffing", "reconcil", "re-render", "performance", "in-memory", "update"],
    better: "The Virtual DOM is an in-memory representation of the UI. On state changes React builds a new tree, diffs it against the previous one (reconciliation), and applies only the minimal set of real DOM mutations. This batching and diffing is what makes frequent UI updates cheap.",
  },
  {
    id: "t3", type: "technical", difficulty: "beginner",
    q: "Explain the difference between useMemo and useCallback in React.",
    keywords: ["memoiz", "cache", "callback", "value", "dependencies", "re-render", "reference"],
    better: "Both memoize based on a dependency array, but useMemo caches the result of calling a function (an expensive computed value) while useCallback caches the function reference itself. useCallback is useful when passing callbacks to memoized children so their props stay referentially stable.",
  },
  {
    id: "t4", type: "technical", difficulty: "intermediate",
    q: "How does the event loop work in JavaScript? Explain with microtasks and macrotasks.",
    keywords: ["call stack", "queue", "microtask", "macrotask", "promise", "settimeout", "event loop"],
    better: "JavaScript runs on a single thread with a call stack. Async callbacks wait in queues: microtasks (Promise.then, queueMicrotask) and macrotasks (setTimeout, I/O). After each stack frame, the loop drains the entire microtask queue before picking the next macrotask — which is why Promise callbacks run before timeouts.",
  },
  {
    id: "t5", type: "technical", difficulty: "intermediate",
    q: "What are React keys and why are they important in lists?",
    keywords: ["identity", "reconcil", "stable", "index", "reorder", "diff"],
    better: "Keys give list elements a stable identity between renders so reconciliation can match old and new items instead of re-rendering everything. Using array indexes breaks this when items reorder or get inserted, causing wrong state and wasted renders. Use unique, stable IDs.",
  },
  {
    id: "t6", type: "technical", difficulty: "intermediate",
    q: "Explain REST API design basics. What makes an endpoint RESTful?",
    keywords: ["resource", "http method", "get", "post", "stateless", "status code", "nouns", "crud"],
    better: "REST models the API around resources (nouns like /orders) manipulated with HTTP verbs — GET reads, POST creates, PUT/PATCH updates, DELETE removes. It's stateless: every request carries its context. Good APIs use proper status codes (200, 201, 400, 404, 500), consistent naming and pagination.",
  },
  {
    id: "t7", type: "technical", difficulty: "advanced",
    q: "How would you optimize the performance of a large React application?",
    keywords: ["code splitting", "lazy", "memo", "virtuali", "bundle", "profiler", "re-render", "cache"],
    better: "Start by measuring with React DevTools Profiler. Then: code-split routes with React.lazy, memoize expensive components and selectors, virtualize long lists, avoid prop drilling that causes wide re-render trees, cache API data, compress and CDN-serve assets, and keep bundle size in check with tree-shaking.",
  },
  {
    id: "t8", type: "technical", difficulty: "advanced",
    q: "Explain how you would design a rate limiter for an API.",
    keywords: ["token bucket", "sliding window", "redis", "throttl", "429", "distributed"],
    better: "Track requests per client in a fast store like Redis. Common algorithms: fixed window (simple but bursty at edges), sliding window log/counter (smoother), or token bucket (allows controlled bursts). In a distributed setup the counter must live outside the app servers, and you return 429 with Retry-After headers.",
  },
  {
    id: "t9", type: "technical", difficulty: "beginner",
    q: "What is Git and how do you resolve a merge conflict?",
    keywords: ["branch", "merge", "commit", "pull", "conflict", "resolve", "version control"],
    better: "Git is a distributed version control system. A merge conflict happens when two branches change the same lines. I pull the latest target branch, merge it in, open the conflicting files, choose the right combination of changes, test, then commit the resolution. Communicating with the other author avoids surprises.",
  },
  {
    id: "t10", type: "technical", difficulty: "intermediate",
    q: "What is TypeScript and what benefits does it bring over JavaScript?",
    keywords: ["static", "types", "compile", "interface", "autocomplete", "refactor", "error"],
    better: "TypeScript adds a static type system on top of JavaScript that's checked at compile time. It catches whole classes of bugs before runtime, powers accurate autocomplete, makes refactoring safe, and doubles as living documentation through interfaces and generics. Types are erased at build, so output is plain JS.",
  },
  {
    id: "t11", type: "technical", difficulty: "advanced",
    q: "Explain database indexing. When does an index hurt performance?",
    keywords: ["b-tree", "lookup", "write", "insert", "update", "trade-off", "query", "scan"],
    better: "An index is typically a B-tree that turns O(n) scans into O(log n) lookups for filtered queries. But indexes must be maintained on every insert/update/delete, so they slow writes and consume storage. Index columns used in WHERE/JOIN/ORDER BY, and avoid over-indexing low-cardinality or write-heavy tables.",
  },
  {
    id: "t12", type: "technical", difficulty: "beginner",
    q: "What is responsive design and how do you implement it?",
    keywords: ["media queries", "flexbox", "grid", "mobile", "breakpoint", "viewport", "fluid"],
    better: "Responsive design means the layout adapts to any screen size. I implement it mobile-first with fluid units, CSS Flexbox/Grid, media queries at meaningful breakpoints, responsive images, and testing on real devices. Tools like Tailwind's responsive prefixes make this systematic.",
  },
  {
    id: "h1", type: "hr", difficulty: "beginner",
    q: "Tell me about yourself.",
    keywords: ["background", "project", "internship", "skill", "goal", "experience", "passion"],
    better: "Structure it as Present → Past → Future: what you do now, the key experiences and projects that shaped your skills, and why this role is the logical next step. Keep it under 90 seconds and end by connecting your story to the company's needs.",
  },
  {
    id: "h2", type: "hr", difficulty: "beginner",
    q: "Why do you want to work at this company?",
    keywords: ["product", "culture", "growth", "research", "mission", "impact", "values"],
    better: "Show you researched them: reference a specific product, initiative or engineering practice you admire, connect it to your own goals, and explain the mutual fit — what you'll learn and what you'll contribute. Avoid generic answers like 'it's a great company'.",
  },
  {
    id: "h3", type: "hr", difficulty: "intermediate",
    q: "What are your salary expectations?",
    keywords: ["range", "market", "research", "flexible", "total compensation", "role"],
    better: "Anchor on market research for the role, city and experience level, then give a range rather than a number. Express flexibility based on total compensation — learning, growth, benefits. For freshers in India, citing the company's standard band plus openness is usually well received.",
  },
  {
    id: "h4", type: "hr", difficulty: "intermediate",
    q: "Where do you see yourself in five years?",
    keywords: ["growth", "learn", "lead", "expert", "contribute", "responsibility"],
    better: "Show ambition grounded in the role's path: deepening expertise, owning bigger problems, eventually mentoring or leading. Tie it to growing with the company rather than implying you'll leave. Interviewers are testing commitment and self-awareness.",
  },
  {
    id: "h5", type: "hr", difficulty: "beginner",
    q: "Do you have any questions for us?",
    keywords: ["team", "roadmap", "culture", "growth", "expectations", "onboarding"],
    better: "Always have 2-3 prepared: What does success look like in the first 90 days? How is the team structured? What does the engineering culture reward? What's the biggest challenge the team is solving now? It signals genuine interest and seniority.",
  },
  {
    id: "b1", type: "behavioral", difficulty: "intermediate",
    q: "Tell me about a time you faced a conflict in a team. How did you handle it?",
    keywords: ["situation", "listened", "perspective", "compromise", "resolution", "communicated", "result"],
    better: "Use STAR: Situation (project + disagreement), Task (what was at stake), Action (you listened to both sides, proposed a data-backed compromise, agreed on owners), Result (shipped on time, improved the process). Focus on your behavior, not blaming others.",
  },
  {
    id: "b2", type: "behavioral", difficulty: "beginner",
    q: "Describe a project you're most proud of and your specific contribution.",
    keywords: ["challenge", "built", "role", "impact", "result", "learned", "user"],
    better: "Pick one project, set context in a sentence, then detail YOUR specific contribution — the hard problem you solved, a metric or user impact, and one thing you learned. Owning a clear slice beats vague claims about the whole team's work.",
  },
  {
    id: "b3", type: "behavioral", difficulty: "intermediate",
    q: "Tell me about a time you missed a deadline or failed. What did you do?",
    keywords: ["ownership", "communicated", "prioriti", "learned", "prevent", "honest"],
    better: "Admit it plainly — interviewers test honesty. Explain the cause without excuses, how you communicated early, what you did to limit damage, and the system you put in place so it doesn't repeat. Failure + learning + prevention is the winning arc.",
  },
  {
    id: "b4", type: "behavioral", difficulty: "advanced",
    q: "Tell me about a time you disagreed with a senior engineer or manager. What happened?",
    keywords: ["respect", "data", "listen", "perspective", "commit", "disagree", "outcome"],
    better: "Show you disagreed constructively: you understood their constraints, brought data or a prototype rather than opinions, and once a decision was made you committed fully. 'Disagree and commit' with genuine respect is what senior interviewers want to hear.",
  },
  {
    id: "b5", type: "behavioral", difficulty: "beginner",
    q: "How do you prioritize when you have multiple tasks with tight deadlines?",
    keywords: ["impact", "urgency", "communicate", "break down", "stakeholder", "trade-off"],
    better: "I rank by impact × urgency, clarify real deadlines with stakeholders, break work into shippable slices, and communicate trade-offs early — 'I can do A and B this week, C slips to Monday' beats silently delivering late.",
  },
  {
    id: "b6", type: "behavioral", difficulty: "advanced",
    q: "Tell me about a time you had to learn a new technology quickly to deliver.",
    keywords: ["docs", "prototype", "deadline", "applied", "small project", "learned", "shipped"],
    better: "Give a real example with a deadline: how you scoped the minimum needed (official docs + a throwaway prototype), applied it to the actual task within days, and what you'd do differently. Showing a repeatable learning system beats claiming to learn fast.",
  },
];

/* --------------------------------- FAQs ---------------------------------- */

export const FAQS = [
  {
    q: "Is the match score the same as what an employer's ATS gives?",
    a: "No — and we say this clearly inside the product. Your match score is JOB ASAP's internal assessment of how well your resume covers a job description. Real employer ATS setups vary widely; our score tells you what to fix, not what a company will score you.",
  },
  {
    q: "Does the AI invent experience or skills I don't have?",
    a: "Never. The improvement engine rewrites what you already have — stronger verbs, clearer impact, better keyword coverage — and suggests what you could add. It will not fabricate employers, degrees, certifications or achievements.",
  },
  {
    q: "What file formats are supported?",
    a: "PDF and DOCX uploads, plus plain-text paste. Text extraction runs through our storage abstraction, so cloud parsing providers can be plugged in later without changing the UI.",
  },
  {
    q: "How do credits work?",
    a: "Every AI action costs credits: a job analysis costs 3, resume improvement 2, a cover letter 2, an ATS check 2 and an interview session 3. Free accounts get 10 credits, Starter 100/month and Pro 500/month.",
  },
  {
    q: "Can I use this as a fresher with no work experience?",
    a: "Yes — it's built for exactly that. Projects, internships, certifications and hackathons are treated as first-class experience, and suggestions focus on what freshers can realistically add.",
  },
  {
    q: "Which payment methods will be supported?",
    a: "At launch, UPI, cards and netbanking via an Indian payment gateway. Pricing is fully configurable from the subscription service, so plans and credit packs can change without code edits.",
  },
];

/* --------------------------- demo seed records --------------------------- */

export const APP_STATUSES = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export const STATUS_META: Record<AppStatus, { dot: string; badge: string }> = {
  Saved: { dot: "bg-ink-300", badge: "bg-white/8 text-ink-500 ring-1 ring-white/12" },
  Applied: { dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,.7)]", badge: "bg-sky-400/12 text-sky-300 ring-1 ring-sky-400/25" },
  Screening: { dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,.7)]", badge: "bg-amber-400/12 text-amber-300 ring-1 ring-amber-400/25" },
  Interview: { dot: "bg-brand-400 shadow-[0_0_8px_rgba(167,139,250,.8)]", badge: "bg-brand-500/14 text-brand-300 ring-1 ring-brand-400/30" },
  Offer: { dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]", badge: "bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25" },
  Rejected: { dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,.7)]", badge: "bg-rose-400/12 text-rose-300 ring-1 ring-rose-400/25" },
};

export const daysAgoISO = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const SEED_ANALYSES = [
  {
    id: "seed-a1",
    jobTitle: "Frontend Developer",
    company: "Microsoft",
    location: "Bengaluru",
    matchScore: 82,
    matchingSkills: ["React", "JavaScript", "HTML", "CSS", "REST APIs", "Git"],
    missingSkills: ["TypeScript", "Next.js", "Azure", "CI/CD"],
    missingKeywords: ["API Integration", "Performance Optimization", "Accessibility"],
    recommendations: [
      "Add TypeScript to at least one project — it appears 6 times in this JD.",
      "Mention API integration work explicitly; you have it but don't say it.",
      "Quantify the Lighthouse performance work in QuizWhiz.",
    ],
    createdAt: daysAgoISO(2),
  },
  {
    id: "seed-a2",
    jobTitle: "React Developer",
    company: "Swiggy",
    location: "Bengaluru",
    matchScore: 74,
    matchingSkills: ["React", "JavaScript", "Tailwind CSS", "Git", "Firebase"],
    missingSkills: ["Redux", "Next.js", "GraphQL", "Docker", "Data Structures"],
    missingKeywords: ["State Management", "CI/CD", "SDLC"],
    recommendations: [
      "Name your state management approach — you use Context, say it explicitly.",
      "Add GraphQL or mention REST integration patterns to cover their stack.",
      "Surface DSA practice (LeetCode) — Swiggy screens for it.",
    ],
    createdAt: daysAgoISO(5),
  },
  {
    id: "seed-a3",
    jobTitle: "Software Engineer",
    company: "Amazon",
    location: "Hyderabad",
    matchScore: 68,
    matchingSkills: ["C++", "SQL", "Data Structures", "Algorithms", "OOP"],
    missingSkills: ["Java", "Spring Boot", "AWS", "Microservices", "Python"],
    missingKeywords: ["Scalability", "Deployment", "Mentoring"],
    recommendations: [
      "Lead with DSA depth — 300+ LeetCode problems is Amazon-relevant, say it in the summary.",
      "Add any backend exposure, even Firebase functions, to reduce the backend gap.",
      "Prepare STAR stories — Amazon interviews are heavily behavioral.",
    ],
    createdAt: daysAgoISO(9),
  },
];

export const SEED_APPLICATIONS = [
  { id: "app-1", company: "Microsoft", role: "Frontend Developer", location: "Bengaluru", dateApplied: daysAgoISO(2), status: "Interview" as AppStatus, nextStep: "Technical round on Friday", notes: "Referral from Priya (college senior)" },
  { id: "app-2", company: "Swiggy", role: "React Developer", location: "Bengaluru", dateApplied: daysAgoISO(5), status: "Screening" as AppStatus, nextStep: "Recruiter call scheduled", notes: "" },
  { id: "app-3", company: "Amazon", role: "Software Engineer", location: "Hyderabad", dateApplied: daysAgoISO(9), status: "Applied" as AppStatus, nextStep: "Online assessment pending", notes: "OA link expires in 5 days" },
  { id: "app-4", company: "Razorpay", role: "Frontend Engineer", location: "Remote", dateApplied: daysAgoISO(12), status: "Rejected" as AppStatus, nextStep: "—", notes: "Asked for 2+ yrs, reapply later" },
  { id: "app-5", company: "Zoho", role: "Member Technical Staff", location: "Chennai", dateApplied: daysAgoISO(15), status: "Offer" as AppStatus, nextStep: "Decide by month end", notes: "₹9.5 LPA + joining bonus" },
  { id: "app-6", company: "Flipkart", role: "Software Engineer I", location: "Bengaluru", dateApplied: daysAgoISO(18), status: "Saved" as AppStatus, nextStep: "Tailor resume first", notes: "Match score was low — improve first" },
  { id: "app-7", company: "Freshworks", role: "UI Developer", location: "Chennai", dateApplied: daysAgoISO(21), status: "Applied" as AppStatus, nextStep: "Follow up next week", notes: "" },
];

export const SEED_NOTIFS = [
  { id: "n1", title: "Interview scheduled", body: "Microsoft — Technical round on Friday, 10:00 AM IST.", time: daysAgoISO(1), read: false },
  { id: "n2", title: "New analysis ready", body: "Your Microsoft Frontend Developer analysis scored 82%.", time: daysAgoISO(2), read: false },
  { id: "n3", title: "Credits low", body: "You have 4 credits left. Upgrade anytime for monthly top-ups.", time: daysAgoISO(3), read: true },
];

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/job-match", label: "Job Match", icon: "Target" },
  { to: "/resume-tools", label: "Resume Tools", icon: "FileText" },
  { to: "/cover-letter", label: "Cover Letter", icon: "Mail" },
  { to: "/interview", label: "Interview Practice", icon: "Mic" },
  { to: "/ats-checker", label: "ATS Checker", icon: "ShieldCheck" },
  { to: "/applications", label: "Applications", icon: "Briefcase" },
  { to: "/settings", label: "Settings", icon: "Settings" },
] as const;
