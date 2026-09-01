import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, BarChart3, Briefcase, CheckCircle2, ClipboardCheck,
  FileText, FileWarning, Mail, Mic, PenLine, ShieldCheck,
  Sparkles, Target, TrendingUp, Upload, User, XCircle, Zap,
} from "lucide-react";
import { Badge, Bar, Button, Card, Cube, Orb, Ring3D, SceneShapes, ScoreRing, SkillChip, TiltCard } from "../components/ui";
import { TrendArea } from "../components/charts";
import { FinalCta, FaqSection, PricingSection, SectionHead } from "../components/sections";
import { useReveal } from "../hooks";
import { SEO } from "../components/SEO";
import { COMPANY_CHIPS } from "../data";
import { useAuth } from "../context";
import { cn } from "../utils";

/* ------------------------------- hero preview ------------------------------ */

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/25 blur-[100px]" />
      </div>

      {/* 3D scene around the panel */}
      <Cube size={62} className="absolute -left-8 -top-8 z-10 hidden opacity-80 sm:block" />
      <Orb size={46} className="absolute -right-5 top-16 z-10 hidden animate-floaty sm:block" />
      <Ring3D size={190} className="absolute -bottom-14 -left-16 hidden opacity-60 sm:block" />
      <Cube size={30} className="absolute -right-8 bottom-24 z-10 hidden opacity-60 sm:block" style={{ animationDelay: "-8s" }} />

      <TiltCard max={6}>
        <Card className="glass-deep relative overflow-hidden rounded-2xl">
          {/* window chrome */}
          <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90 shadow-[0_0_8px_rgba(251,113,133,.7)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,.7)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,.7)]" />
            <span className="glass-chip ml-3 rounded-md px-2.5 py-1 text-[11px] font-semibold text-ink-400">
              app.aicareer.dev/job-match
            </span>
            <Badge tone="brand" className="ml-auto">Live analysis</Badge>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3">
              <ScoreRing value={78} size={124} caption="Match" />
              <Badge tone="ink" className="text-[10px]">Internal assessment</Badge>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-display text-[15px] font-bold text-white">Frontend Developer</p>
                  <p className="text-xs font-medium text-ink-400">Microsoft · Bengaluru</p>
                </div>
                <Button size="sm" variant="outline">Full report</Button>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  ["Skills", 72, "brand"],
                  ["Keywords", 64, "amber"],
                  ["Experience", 90, "emerald"],
                ].map(([label, v, tone]: any) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wide text-ink-400">{label}</span>
                    <Bar value={v} tone={tone} className="h-1.5" />
                    <span className="w-8 text-right text-xs font-bold text-ink-600">{v}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["React", "JavaScript", "HTML", "CSS"].map((s) => <SkillChip key={s} label={s} state="match" />)}
                {["TypeScript", "Next.js", "REST APIs"].map((s) => <SkillChip key={s} label={s} state="missing" />)}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 px-5 pb-4 pt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-ink-400">
              <span>Match trend · last 6 analyses</span><TrendingUp className="h-3.5 w-3.5 text-brand-300" />
            </div>
            <TrendArea height={110} data={[
              { label: "1", value: 58 }, { label: "2", value: 64 }, { label: "3", value: 61 },
              { label: "4", value: 74 }, { label: "5", value: 71 }, { label: "6", value: 82 },
            ]} />
          </div>
        </Card>
      </TiltCard>

      {/* floating glass cards */}
      <div className="absolute -right-3 -top-6 z-20 hidden animate-floaty sm:block lg:-right-8">
        <div className="glass-deep flex items-center gap-3 rounded-xl px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/14 text-emerald-300 ring-1 ring-emerald-400/25">
            <Mail className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-white">Cover letter ready</p>
            <p className="text-[11px] font-medium text-ink-400">Tailored to Microsoft</p>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
      </div>
      <div className="absolute -bottom-6 -left-3 z-20 hidden animate-floaty-slow sm:block lg:-left-8">
        <div className="glass-deep flex items-center gap-3 rounded-xl px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/16 text-brand-300 ring-1 ring-brand-400/25">
            <Mic className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-white">Interview score 8.5/10</p>
            <p className="text-[11px] font-medium text-ink-400">React · Intermediate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- hero ----------------------------------- */

function Hero() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden">
      <SceneShapes variant="a" />
      <div className="container-x relative grid items-center gap-14 pb-20 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:pb-28 lg:pt-20">
        <div className="animate-fade-up">
          <Badge tone="brand" className="glass-chip mb-5 py-1">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Find It · Apply It · Get It — JOB ASAP AI
          </Badge>
          <h1 className="font-display text-[42px] font-bold leading-[1.04] tracking-tight sm:text-6xl">
            <span className="text-3d text-white">Get More</span>
            <br />
            <span className="text-3d text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-purple-400 text-glow">Interviews</span>{" "}
            <span className="text-3d text-white">With AI</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-400">
            Upload your resume, paste a job description, and let AI analyze, improve and
            personalize your application — match score, missing skills, tailored resume,
            cover letter and mock interviews in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={user ? "/job-match" : "/register"}>
              <Button size="lg" icon={<Target className="h-5 w-5" />}>Analyze My Resume</Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="secondary" icon={<ArrowRight className="h-5 w-5" />}>Explore Tools</Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-semibold text-ink-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 10 free credits</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Works without an AI key</span>
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:150ms]"><HeroPreview /></div>
      </div>
    </section>
  );
}

function CompanyMarquee() {
  const row = [...COMPANY_CHIPS, ...COMPANY_CHIPS];
  return (
    <section className="border-y border-white/8 bg-white/[0.03] py-6 backdrop-blur-sm">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-ink-300">
        Job seekers analyze roles at
      </p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-3">
          {row.map((c, i) => (
            <span key={i} className="glass-chip flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-ink-500">
              <Briefcase className="h-3.5 w-3.5 text-brand-400" /> {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- how it works ------------------------------ */

const STEPS = [
  {
    icon: Upload, n: "01", title: "Upload your resume",
    desc: "Drop a PDF or DOCX, or paste your text. We parse skills, experience, education and structure.",
    tag: "PDF · DOCX · Paste",
  },
  {
    icon: PenLine, n: "02", title: "Paste the job description",
    desc: "Add the job title, company and description. Any portal works — LinkedIn, Naukri, Instahyre.",
    tag: "Any job portal",
  },
  {
    icon: BarChart3, n: "03", title: "Get your match report",
    desc: "Match score, missing skills & keywords, plus one-click fixes: tailored resume, cover letter, mock interview.",
    tag: "60-second analysis",
  },
];

function HowItWorks() {
  const ref = useReveal();
  return (
    <section id="how" className="py-24">
      <div className="container-x">
        <div ref={ref} className="reveal">
          <SectionHead eyebrow="How it works" title={<>Three steps from <span className="text-brand-300">apply</span> to <span className="text-brand-300">interview</span></>}
            desc="No 40-field forms. No week-long resume services. One analysis loop you can run on every application." />
        </div>
        <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
          <div className="absolute left-0 right-0 top-10 hidden border-t-2 border-dashed border-brand-400/25 md:block" />
          {STEPS.map((s, i) => (
            <div key={s.n} className={cn("reveal relative", i === 1 && "md:translate-y-6")} ref={useReveal()}>
              <div className="relative z-10 mb-5 inline-block" style={{ perspective: "500px" }}>
                <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl shadow-[0_20px_44px_-18px_rgba(109,40,217,.55)]"
                  style={{ transform: "rotateX(12deg) rotateY(-14deg)" }}>
                  <s.icon className="h-8 w-8 text-brand-300" />
                  <span className="absolute -right-2 -top-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-700 px-2 py-0.5 font-display text-[11px] font-bold text-white shadow-[0_6px_14px_-4px_rgba(139,92,246,.8)]">{s.n}</span>
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{s.desc}</p>
              <Badge tone="brand" className="mt-3">{s.tag}</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ features bento ----------------------------- */

function FeaturesBento() {
  const ref = useReveal();
  return (
    <section className="py-24">
      <div className="container-x">
        <div ref={ref} className="reveal">
          <SectionHead center eyebrow="Core features" title={<>Everything between <span className="text-brand-300">"apply"</span> and <span className="text-brand-300">"you're hired"</span></>}
            desc="Six tightly-connected tools that share one brain — your resume and the job description." />
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          {/* Job match — large */}
          <div className="card-hover glass-deep group relative overflow-hidden rounded-2xl p-7 text-white md:col-span-4">
            <div className="absolute inset-0 bg-dots-dark opacity-40" />
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-600/25 blur-3xl" />
            <Cube size={44} className="absolute right-8 top-8 hidden opacity-50 lg:block" />
            <div className="relative flex h-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-sm">
                <Target className="h-7 w-7 text-brand-300" />
                <h3 className="mt-4 font-display text-2xl font-bold">Job Match Analysis</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">
                  An honest internal score with matching skills, missing skills, missing keywords,
                  experience & education fit — and exactly what to fix.
                </p>
              </div>
              <div className="glass-chip shrink-0 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Match score</p>
                <p className="font-display text-5xl font-bold text-brand-300 text-glow">82<span className="text-xl">%</span></p>
                <div className="mt-2 space-y-1.5">
                  {[72, 64, 90].map((v, i) => (
                    <div key={i} className="h-1.5 w-36 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300 shadow-[0_0_8px_rgba(167,139,250,.6)]" style={{ width: `${v}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* ATS */}
          <div className="card-hover glass rounded-2xl p-7 md:col-span-2">
            <ShieldCheck className="h-7 w-7 text-brand-300" />
            <h3 className="mt-4 font-display text-xl font-bold text-white">ATS Resume Checker</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">Formatting, structure, keywords, readability — scored across 6 categories with a clear disclaimer.</p>
            <div className="mt-4 flex items-center gap-3">
              <ScoreRing value={72} size={72} stroke={7} suffix="" caption="" />
              <span className="text-xs font-semibold text-ink-400">Platform assessment,<br />not an employer ATS score</span>
            </div>
          </div>
          {/* Resume improve */}
          <div className="card-hover glass rounded-2xl p-7 md:col-span-2">
            <FileText className="h-7 w-7 text-brand-300" />
            <h3 className="mt-4 font-display text-xl font-bold text-white">Resume Improvement</h3>
            <div className="mt-3 space-y-1.5 font-mono text-[11.5px]">
              <p className="rounded bg-rose-400/10 px-2 py-1 text-rose-300 line-through decoration-rose-400/50">Worked on listing pages…</p>
              <p className="rounded bg-emerald-400/10 px-2 py-1 text-emerald-300">Engineered listing pages used by 40k users…</p>
            </div>
          </div>
          {/* Cover letter */}
          <div className="card-hover glass rounded-2xl p-7 md:col-span-2">
            <Mail className="h-7 w-7 text-brand-300" />
            <h3 className="mt-4 font-display text-xl font-bold text-white">Cover Letters</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">Professional, confident, friendly or concise — personalized per company and tone.</p>
            <div className="mt-3 flex gap-1.5">
              {["Professional", "Confident", "Friendly"].map((t) => <Badge key={t} tone="ink">{t}</Badge>)}
            </div>
          </div>
          {/* Interview */}
          <div className="card-hover glass rounded-2xl p-7 md:col-span-2">
            <Mic className="h-7 w-7 text-brand-300" />
            <h3 className="mt-4 font-display text-xl font-bold text-white">AI Interview Simulator</h3>
            <div className="mt-3 flex items-center gap-2">
              <Badge tone="brand">8.5/10</Badge><Badge tone="ink">Technical</Badge><Badge tone="ink">HR</Badge><Badge tone="ink">Behavioral</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">Real questions, evaluated answers, better-answer rewrites.</p>
          </div>
          {/* Tracker */}
          <div className="card-hover glass rounded-2xl p-7 md:col-span-3">
            <ClipboardCheck className="h-7 w-7 text-brand-300" />
            <h3 className="mt-4 font-display text-xl font-bold text-white">Application Tracker</h3>
            <div className="mt-3 space-y-2">
              {[["Applied", 60, "from-sky-500 to-sky-400"], ["Screening", 40, "from-amber-500 to-amber-400"], ["Interview", 25, "from-brand-600 to-brand-400"], ["Offer", 10, "from-emerald-500 to-emerald-400"]].map(([l, w, c]: any) => (
                <div key={l} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-bold text-ink-400">{l}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8"><div className={cn("h-full rounded-full bg-gradient-to-r", c)} style={{ width: `${w}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          {/* Credits */}
          <div className="card-hover relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_24px_56px_-22px_rgba(109,40,217,.7)] md:col-span-3">
            <Orb size={90} className="absolute -right-6 -top-8 opacity-50" />
            <Zap className="h-7 w-7 text-brand-200" />
            <h3 className="mt-4 font-display text-xl font-bold">Transparent credit system</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-100/90">Every AI action has a visible credit cost. No surprise bills, no unlimited-fair-use asterisks.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[["Analysis", "3"], ["Improve", "2"], ["Cover letter", "2"], ["Interview", "3"]].map(([l, c]) => (
                <span key={l} className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold ring-1 ring-white/25 backdrop-blur-sm">{l} · {c}⚡</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ deep-dive rows ----------------------------- */

function MatchShowcase() {
  const ref = useReveal();
  const points = [
    ["Overall match score", "A weighted internal score across skills, keywords, experience and education — clearly labelled, never pretending to be an employer's ATS."],
    ["Missing skills & keywords", "The exact gaps between your resume and the JD, so you fix what actually matters."],
    ["One-click next steps", "Improve resume, generate cover letter, start a mock interview — all pre-filled from the same analysis."],
  ];
  return (
    <section className="py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div ref={ref} className="reveal">
          <SectionHead eyebrow="Job Match Analysis" title={<>Know your score <span className="text-brand-300">before</span> the recruiter does</>} />
          <ul className="space-y-5">
            {points.map(([t, d]) => (
              <li key={t} className="flex gap-3.5">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/14 text-emerald-300 ring-1 ring-emerald-400/25">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-white">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <TiltCard max={4}>
          <Card className="glass-deep reveal reveal-on p-6">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <p className="font-display text-lg font-bold text-white">React Developer — Swiggy</p>
                <p className="text-xs font-medium text-ink-400">Bengaluru · analyzed 2 days ago</p>
              </div>
              <Badge tone="ink">Internal assessment</Badge>
            </div>
            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
              <ScoreRing value={74} size={128} />
              <div className="w-full flex-1 space-y-3">
                {[
                  ["Skills", 68, "brand"], ["Keywords", 71, "amber"],
                  ["Experience", 88, "emerald"], ["Education", 95, "sky"],
                ].map(([l, v, tone]: any) => (
                  <div key={l}>
                    <div className="mb-1 flex justify-between text-xs font-bold"><span className="text-ink-400">{l}</span><span className="text-ink-600">{v}%</span></div>
                    <Bar value={v} tone={tone} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> What you have</p>
                <div className="flex flex-wrap gap-1.5">{["React", "JavaScript", "Tailwind CSS", "Git"].map((s) => <SkillChip key={s} label={s} state="match" />)}</div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-300"><XCircle className="h-3.5 w-3.5" /> Missing skills</p>
                <div className="flex flex-wrap gap-1.5">{["Redux", "Next.js", "GraphQL", "Docker"].map((s) => <SkillChip key={s} label={s} state="missing" />)}</div>
              </div>
            </div>
          </Card>
        </TiltCard>
      </div>
    </section>
  );
}

function ResumeShowcase() {
  const ref = useReveal();
  return (
    <section className="py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <TiltCard max={4} className="order-2 lg:order-1">
          <Card className="glass-deep reveal reveal-on overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.03] px-5 py-3">
              <Badge tone="ink">Original</Badge>
              <ArrowRight className="h-4 w-4 text-ink-300" />
              <Badge tone="brand"><Sparkles className="h-3 w-3" /> AI Improved</Badge>
              <Badge tone="emerald" className="ml-auto">12 changes</Badge>
            </div>
            <div className="space-y-3 p-5 font-mono text-[12px] leading-relaxed">
              <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-rose-300 line-through decoration-rose-400/50">
                − Was responsible for converting Figma designs into pages
              </p>
              <p className="rounded-lg bg-emerald-400/10 px-3 py-2 text-emerald-300">
                + Owned Figma-to-code conversion for 14 responsive pages, matching design specs pixel-perfectly
              </p>
              <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-rose-300 line-through decoration-rose-400/50">
                − Worked on the product listing pages
              </p>
              <p className="rounded-lg bg-emerald-400/10 px-3 py-2 text-emerald-300">
                + Engineered product listing pages serving 40,000 monthly users
              </p>
              <p className="rounded-lg bg-brand-500/12 px-3 py-2 text-brand-200 ring-1 ring-brand-400/25">
                <span className="font-sans font-bold">Suggested:</span> add a TypeScript project to cover the #1 JD gap — never invented, always optional.
              </p>
            </div>
          </Card>
        </TiltCard>
        <div ref={ref} className="reveal order-1 lg:order-2">
          <SectionHead eyebrow="Resume Improvement" title={<>Same experience, told <span className="text-brand-300">10× better</span></>}
            desc="Side-by-side Original vs AI Improved, with every change explained. The AI rewrites how you say it — it never invents what you did." />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [FileWarning, "Never fabricates", "No fake employers, degrees or achievements. Ever."],
              [Sparkles, "Impact verbs", "Passive lines become ownership statements."],
              [Target, "JD-targeted", "Skills the job asks for move to the front."],
              [User, "Honest suggestions", "Gaps become 'you could add…' — your call."],
            ].map(([Icon, t, d]: any) => (
              <div key={t} className="glass-chip rounded-xl p-4">
                <Icon className="h-5 w-5 text-brand-300" />
                <p className="mt-2 text-sm font-bold text-white">{t}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InterviewShowcase() {
  const ref = useReveal();
  return (
    <section className="relative overflow-hidden py-24 text-white">
      <div className="glass-deep absolute inset-x-0 inset-y-6 border-y border-white/8" />
      <div className="absolute inset-x-0 inset-y-6 bg-grid-dark opacity-50 [mask-image:radial-gradient(70%_90%_at_50%_50%,black,transparent)]" />
      <div className="absolute left-1/3 top-10 h-72 w-72 rounded-full bg-brand-600/22 blur-[110px]" />
      <Cube size={52} className="absolute right-[8%] top-24 hidden opacity-60 lg:block" />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
        <div ref={ref} className="reveal">
          <SectionHead eyebrow="AI Interview Simulator" title={<>Rehearse until the real thing feels <span className="text-brand-300 text-glow">easy</span></>}
            desc="Pick a role, difficulty and interview type. The AI asks one question at a time, scores technical accuracy, communication, clarity and confidence — then shows a better answer." />
          <div className="flex flex-wrap gap-2">
            {["Technical", "HR", "Behavioral", "Mixed"].map((t) => <Badge key={t} tone="brand">{t}</Badge>)}
            {["Beginner", "Intermediate", "Advanced"].map((t) => <Badge key={t} tone="ink">{t}</Badge>)}
          </div>
        </div>
        <div className="space-y-3">
          <div className="glass-deep reveal reveal-on max-w-md rounded-2xl rounded-tl-md p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">AI Interviewer · Technical</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              "Explain the difference between useMemo and useCallback in React."
            </p>
          </div>
          <div className="reveal reveal-on ml-auto max-w-md rounded-2xl rounded-tr-md bg-gradient-to-br from-brand-600 to-brand-800 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_20px_44px_-16px_rgba(109,40,217,.7)]">
            <p className="text-sm leading-relaxed text-white">
              Both memoize with a dependency array — useMemo caches the computed value, useCallback caches the function reference itself so memoized children don't re-render…
            </p>
          </div>
          <div className="reveal reveal-on flex flex-wrap items-center gap-2 pl-2">
            <span className="glass-chip rounded-xl px-4 py-2.5">
              <span className="font-display text-2xl font-bold text-emerald-300">8.5<span className="text-sm text-ink-400">/10</span></span>
            </span>
            {[["Technical", "9.0"], ["Clarity", "8.6"], ["Communication", "8.2"], ["Confidence", "8.4"]].map(([l, v]) => (
              <span key={l} className="glass-chip rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-400">
                {l} <span className="text-white">{v}</span>
              </span>
            ))}
          </div>
          <p className="reveal reveal-on pl-2 text-xs text-ink-400">Next: "How does the event loop work?" · Progress 2 of 5</p>
        </div>
      </div>
    </section>
  );
}

function TrackerShowcase() {
  const ref = useReveal();
  const rows: [string, string, string, string][] = [
    ["Microsoft", "Frontend Developer", "Interview", "bg-brand-500/14 text-brand-300 ring-brand-400/30"],
    ["Swiggy", "React Developer", "Screening", "bg-amber-400/12 text-amber-300 ring-amber-400/25"],
    ["Amazon", "Software Engineer", "Applied", "bg-sky-400/12 text-sky-300 ring-sky-400/25"],
    ["Zoho", "Member Technical Staff", "Offer", "bg-emerald-400/12 text-emerald-300 ring-emerald-400/25"],
  ];
  return (
    <section className="py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div ref={ref} className="reveal">
          <SectionHead eyebrow="Application Tracker" title={<>Never lose track of a <span className="text-brand-300">follow-up</span> again</>}
            desc="A pipeline for every application — saved, applied, screening, interview, offer, rejected — with next steps so nothing slips during placement season." />
          <div className="flex flex-wrap gap-2">
            {["Add & edit", "Filter & search", "Sort", "Pipeline view", "Next-step reminders"].map((t) => (
              <Badge key={t} tone="ink">{t}</Badge>
            ))}
          </div>
        </div>
        <TiltCard max={4}>
          <Card className="glass-deep reveal reveal-on overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
              <p className="font-display text-sm font-bold text-white">My applications</p>
              <Badge tone="brand">4 active</Badge>
            </div>
            {rows.map(([co, role, status, tone]) => (
              <div key={co} className="flex items-center justify-between gap-3 border-b border-white/6 px-5 py-3.5 transition-colors hover:bg-brand-500/8">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 font-display text-sm font-bold text-ink-600 ring-1 ring-white/10">
                    {co[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-700">{co}</p>
                    <p className="truncate text-xs text-ink-400">{role}</p>
                  </div>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1", tone)}>{status}</span>
              </div>
            ))}
            <div className="bg-white/[0.03] px-5 py-3 text-right">
              <Link to="/register" className="inline-flex items-center gap-1 text-xs font-bold text-brand-300 hover:text-brand-200">
                Track yours free <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </TiltCard>
      </div>
    </section>
  );
}

/* --------------------------------- landing --------------------------------- */

export default function Landing() {
  return (
    <>
      <SEO 
        title="Home"
        description="Upload your resume, paste a job description, and let JOB ASAP analyze your match, improve your resume, write cover letters and run mock interviews."
      />
      <Hero />
      <CompanyMarquee />
      <HowItWorks />
      <FeaturesBento />
      <MatchShowcase />
      <ResumeShowcase />
      <InterviewShowcase />
      <TrackerShowcase />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
