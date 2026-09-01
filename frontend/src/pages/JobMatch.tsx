import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Edit3, FileCheck, FileText, GraduationCap,
  Lightbulb, Mail, Mic, RefreshCw, Sparkles, Target, Trash2, Upload, XCircle, Zap,
} from "lucide-react";
import {
  Badge, Bar, Button, Card, Field, Input, PageHeader, ScoreRing, SkillChip,
  Stepper, Tabs, Textarea,
} from "../components/ui";
import { UpgradeModal } from "../components/sections";
import { useAuth, useData, useToast } from "../context";
import { usePageMeta } from "../hooks";
import { analyzeJobMatch, type JobAnalysis } from "../services/ai";
import { fileStorage, CREDIT_COST } from "../services/api";
import { CREDIT_COSTS, DEMO_RESUME_TEXT, SAMPLE_JDS } from "../data";
import { cn, downloadPdf, jobCtx, uid } from "../utils";

const ANALYZE_STEPS = [
  "Parsing resume structure",
  "Extracting skills & keywords",
  "Scoring against job description",
  "Writing recommendations",
];

export default function JobMatch() {
  usePageMeta("Job Match Analysis — JOB ASAP", "Analyze your resume against any job description and get a match score with missing skills and keywords.");
  const { user, spendCredits } = useAuth();
  const { resumes, addAnalysis } = useData();
  const { toast } = useToast();

  const [step, setStep] = useState<"form" | "analyzing" | "result">("form");
  const [tab, setTab] = useState<"paste" | "upload">("paste");
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ jobTitle: "", company: "", location: "", jobDescription: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Restore a passed-in analysis (from dashboard / other tools)
  useEffect(() => {
    const ctx = jobCtx.get();
    if (ctx?.matchScore) {
      setAnalysis(ctx);
      setStep("result");
      setForm({ jobTitle: ctx.jobTitle || "", company: ctx.company || "", location: ctx.location || "", jobDescription: ctx.jobDescription || "" });
      if (ctx.resumeText) setResumeText(ctx.resumeText);
    }
  }, []);

  // Analyzing progress animation
  useEffect(() => {
    if (step !== "analyzing") return;
    setProgress(0);
    const timers = ANALYZE_STEPS.map((_, i) =>
      setTimeout(() => setProgress(i + 1), 550 * (i + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const pickResume = (id: string) => {
    const r = resumes.find((x) => x.id === id);
    if (r) {
      setResumeText(r.text);
      setResumeName(r.name);
      toast({ title: `Loaded "${r.name}"`, tone: "info" });
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      fileStorage.validate(f.name, f.size);
    } catch (e: any) {
      toast({ title: "File rejected", desc: e.message, tone: "error" });
      return;
    }
    const text = await fileStorage.readText(f);
    if (text) {
      setResumeText(text);
      setResumeName(f.name);
      toast({ title: "Resume loaded", desc: `${f.name} · ${Math.round(f.size / 1024)} KB`, tone: "success" });
    } else {
      toast({
        title: "Could not read file text",
        desc: "Please paste your resume text directly into the text box or upload a text-based PDF/DOCX.",
        tone: "info",
      });
      setTab("paste");
    }
  };

  const runAnalysis = async () => {
    const errs: Record<string, string> = {};
    if (resumeText.trim().length < 120) errs.resume = "Add your resume (at least a few lines) — paste text or upload a file.";
    if (!form.jobTitle.trim()) errs.jobTitle = "Job title is required";
    if (form.jobDescription.trim().length < 80) errs.jobDescription = "Paste the full job description (80+ characters).";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (!spendCredits("analysis")) {
      setShowUpgrade(true);
      return;
    }

    setStep("analyzing");
    const started = Date.now();
    try {
      const result = await analyzeJobMatch({
        resumeText,
        jobTitle: form.jobTitle.trim(),
        company: form.company.trim() || "Company",
        location: form.location.trim(),
        jobDescription: form.jobDescription,
      });
      const wait = Math.max(0, 2300 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      const record = { ...result, id: uid(), resumeText };
      await addAnalysis(record);
      jobCtx.set(record);
      setAnalysis(record);
      setStep("result");
      toast({
        title: `Match score: ${result.matchScore}%`,
        desc: `${result.missingSkills.length} missing skills found — see recommendations below.`,
        tone: "success",
      });
    } catch (e: any) {
      setStep("form");
      toast({ title: "Analysis failed", desc: e?.message ?? "Please try again.", tone: "error" });
    }
  };

  const downloadReport = () => {
    if (!analysis) return;
    downloadPdf(`${analysis.jobTitle}-${analysis.company}-match-report`.replace(/\s+/g, "-").toLowerCase(), `Job Match Report — ${analysis.jobTitle} @ ${analysis.company}`, [
      { heading: "Overview", text: `Overall match: ${analysis.matchScore}% (JOB ASAP internal assessment — not an employer ATS score). Analyzed ${new Date(analysis.createdAt).toLocaleDateString("en-IN")}.` },
      { heading: "Category Scores", bullet: [
        `Skills: ${analysis.categoryScores.skills}%`,
        `Keywords: ${analysis.categoryScores.keywords}%`,
        `Experience: ${analysis.categoryScores.experience}% — required ${analysis.experienceMatch.required}, detected ${analysis.experienceMatch.detected}`,
        `Education: ${analysis.categoryScores.education}% — ${analysis.educationMatch.required}`,
      ]},
      { heading: "Matching Skills", text: analysis.matchingSkills.join(", ") || "—" },
      { heading: "Missing Skills", text: analysis.missingSkills.join(", ") || "—" },
      { heading: "Missing Keywords", text: analysis.missingKeywords.join(", ") || "—" },
      { heading: "Recommendations", bullet: analysis.recommendations },
    ]);
    toast({ title: "Report downloaded", desc: "PDF saved to your downloads.", tone: "success" });
  };

  const newAnalysis = () => {
    jobCtx.clear();
    setAnalysis(null);
    setStep("form");
    setForm({ jobTitle: "", company: "", location: "", jobDescription: "" });
  };

  /* ------------------------------ FORM VIEW ------------------------------ */
  if (step === "form") {
    return (
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={`Step ${1} of 2 · ${CREDIT_COSTS.analysis} credits`}
          title="Job Match Analysis"
          desc="Your resume against the job description — scored across skills, keywords, experience and education."
        />
        <div className="mb-6"><Stepper steps={["Resume", "Job Description", "Report"]} current={0} /></div>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">1 · Your resume</h2>
            <Tabs
              value={tab}
              onChange={(v) => setTab(v as "paste" | "upload")}
              items={[
                { id: "paste", label: "Paste text", icon: <FileText className="h-3.5 w-3.5" /> },
                { id: "upload", label: "Upload file", icon: <Upload className="h-3.5 w-3.5" /> },
              ]}
            />
          </div>

          {resumes.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-ink-500">Or use a saved resume:</span>
              {resumes.slice(0, 4).map((r) => (
                <button key={r.id} onClick={() => { pickResume(r.id); setTab("paste"); }}
                  className="rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-600 ring-1 ring-ink-200 transition-all hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200">
                  {r.name}
                </button>
              ))}
            </div>
          )}

          {tab === "paste" ? (
            <div>
              <Textarea
                rows={11}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={"Paste your full resume text here…\n\nTip: open your PDF, select all, copy, paste."}
                className="font-mono text-[13px]"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs font-medium text-ink-400">{resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words` : "PDF, DOCX or plain text"}</p>
                <button onClick={() => { setResumeText(DEMO_RESUME_TEXT); setResumeName("Demo resume"); toast({ title: "Demo resume loaded", tone: "info" }); }}
                  className="text-xs font-bold text-brand-700 hover:text-brand-900">
                  Use sample resume →
                </button>
              </div>
            </div>
          ) : resumeText.trim() ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 backdrop-blur-md">
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt,.md" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <FileCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-white">
                        {resumeName || "Uploaded Resume"}
                      </h3>
                      <Badge tone="emerald">✓ Ready for analysis</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-400">
                      {resumeText.trim().split(/\s+/).length} words · {resumeText.length} characters extracted
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Upload className="h-3.5 w-3.5" />}
                    onClick={() => fileRef.current?.click()}
                  >
                    Replace File
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Edit3 className="h-3.5 w-3.5" />}
                    onClick={() => setTab("paste")}
                  >
                    Edit Text
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => { setResumeText(""); setResumeName(""); }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1.5">
                  Extracted Resume Preview:
                </p>
                <div className="max-h-28 overflow-y-auto rounded-lg bg-black/40 p-3 font-mono text-xs leading-relaxed text-ink-300 ring-1 ring-white/10 no-scrollbar">
                  {resumeText.slice(0, 350)}...
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-all",
                drag ? "border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.25)]" : "border-white/15 bg-white/[0.02] hover:border-orange-400/50 hover:bg-orange-500/5"
              )}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt,.md" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              <span className="glass-deep flex h-14 w-14 items-center justify-center rounded-2xl text-orange-300 shadow-[0_0_30px_rgba(249,115,22,.25)]">
                <Upload className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-bold text-white">Drop your Word (.docx) or PDF resume here, or click to browse</p>
              <p className="mt-1 text-xs font-medium text-ink-400">PDF, DOCX, DOC, TXT · up to 5 MB · auto-extracted</p>
            </div>
          )}
          {errors.resume && <p className="mt-2 text-sm font-semibold text-rose-500">{errors.resume}</p>}
        </Card>

        <Card className="mt-5 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">2 · The job</h2>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_JDS.map((jd) => (
                <button key={jd.company}
                  onClick={() => { setForm({ jobTitle: jd.title, company: jd.company, location: jd.location, jobDescription: jd.description }); toast({ title: `Loaded ${jd.title} @ ${jd.company}`, tone: "info" }); }}
                  className="rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-600 ring-1 ring-ink-200 transition-all hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200">
                  {jd.company} sample
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Job title" error={errors.jobTitle}>
              <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Frontend Developer" />
            </Field>
            <Field label="Company">
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Microsoft" />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bengaluru, India" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Job description" error={errors.jobDescription} hint="Paste from LinkedIn, Naukri, Instahyre…">
              <Textarea rows={9} value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                placeholder={"Paste the full job description — responsibilities and requirements…"} />
            </Field>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
            <p className="text-xs font-medium text-ink-400">
              Costs <Badge tone="brand" className="mx-1"><Zap className="h-3 w-3" />{CREDIT_COSTS.analysis}</Badge>
              You have <strong className="text-ink-700">{user?.credits ?? 0}</strong> credits
            </p>
            <Button size="lg" onClick={runAnalysis} icon={<Target className="h-4 w-4" />}>Analyze Job Match</Button>
          </div>
        </Card>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} need={CREDIT_COSTS.analysis} />
      </div>
    );
  }

  /* --------------------------- ANALYZING VIEW ---------------------------- */
  if (step === "analyzing") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <Sparkles className="h-5 w-5 animate-pulse-soft" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Analyzing your match…</h2>
              <p className="text-xs font-medium text-ink-400">{form.jobTitle}{form.company && ` — ${form.company}`}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3.5">
            {ANALYZE_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300",
                  i < progress ? "bg-emerald-500 text-white" : i === progress ? "bg-brand-100 text-brand-700 ring-4 ring-brand-50" : "bg-ink-100 text-ink-300"
                )}>
                  {i < progress ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn("text-sm font-semibold transition-colors", i < progress ? "text-ink-800" : i === progress ? "text-brand-700" : "text-ink-300")}>
                  {s}{i === progress && <span className="animate-pulse-soft">…</span>}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${(progress / ANALYZE_STEPS.length) * 100}%` }} />
          </div>
        </Card>
      </div>
    );
  }

  /* ----------------------------- RESULT VIEW ----------------------------- */
  if (!analysis) return null;
  const a = analysis;
  const cats = [
    ["Skills", a.categoryScores.skills, "brand"],
    ["Keywords", a.categoryScores.keywords, "amber"],
    ["Experience", a.categoryScores.experience, "emerald"],
    ["Education", a.categoryScores.education, "sky"],
  ] as const;

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Analysis report · internal assessment"
        title={`${a.jobTitle} — ${a.company}`}
        desc={`${a.location ? a.location + " · " : ""}Analyzed ${new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`}
        actions={
          <>
            <Button variant="secondary" onClick={newAnalysis} icon={<RefreshCw className="h-4 w-4" />}>New Analysis</Button>
            <Button onClick={downloadReport} icon={<FileText className="h-4 w-4" />}>Download Report</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* score column */}
        <Card className="p-7">
          <div className="flex flex-col items-center">
            <ScoreRing value={a.matchScore} size={168} stroke={13} caption="Overall match" />
            <p className="mt-3 max-w-[260px] text-center text-xs leading-relaxed text-ink-400">
              This is JOB ASAP's internal assessment — <strong className="text-ink-600">not</strong> the score an employer's ATS would give.
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {cats.map(([label, v, tone]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-[13px] font-bold">
                  <span className="text-ink-500">{label}</span><span className="text-ink-800">{v}%</span>
                </div>
                <Bar value={v} tone={tone} />
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className={cn("rounded-xl p-4 ring-1", a.experienceMatch.ok ? "bg-emerald-50 ring-emerald-100" : "bg-amber-50 ring-amber-100")}>
              <GraduationCap className={cn("h-5 w-5", a.experienceMatch.ok ? "text-emerald-600" : "text-amber-600")} />
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ink-400">Experience</p>
              <p className="mt-0.5 text-[13px] font-bold text-ink-800">Needs {a.experienceMatch.required}</p>
              <p className="text-xs font-medium text-ink-500">You show: {a.experienceMatch.detected}</p>
            </div>
            <div className={cn("rounded-xl p-4 ring-1", a.educationMatch.ok ? "bg-emerald-50 ring-emerald-100" : "bg-amber-50 ring-amber-100")}>
              <BadgeCheck className={cn("h-5 w-5", a.educationMatch.ok ? "text-emerald-600" : "text-amber-600")} />
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ink-400">Education</p>
              <p className="mt-0.5 text-[13px] font-bold text-ink-800">{a.educationMatch.required}</p>
              <p className="text-xs font-medium text-ink-500">{a.educationMatch.detected}</p>
            </div>
          </div>
        </Card>

        {/* details column */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> What you have ({a.matchingSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {a.matchingSkills.length ? a.matchingSkills.map((s) => <SkillChip key={s} label={s} state="match" />) : <span className="text-sm text-ink-400">No direct overlaps detected</span>}
                </div>
              </div>
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  <XCircle className="h-4 w-4" /> Missing skills ({a.missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {a.missingSkills.length ? a.missingSkills.map((s) => <SkillChip key={s} label={s} state="missing" />) : <span className="text-sm text-ink-400">Nothing major — nice!</span>}
                </div>
              </div>
            </div>
            {a.missingKeywords.length > 0 && (
              <div className="mt-6 border-t border-ink-100 pt-5">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">Missing keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {a.missingKeywords.map((k) => (
                    <span key={k} className="rounded-md bg-amber-50 px-2.5 py-1 text-[13px] font-semibold text-amber-800 ring-1 ring-amber-200">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <p className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold text-ink-900">
              <Lightbulb className="h-5 w-5 text-amber-500" /> Recommendations
            </p>
            <ol className="space-y-3">
              {a.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/resume-tools">
              <Button variant="secondary" className="w-full" icon={<FileText className="h-4 w-4" />}>Improve My Resume</Button>
            </Link>
            <Link to="/cover-letter">
              <Button variant="secondary" className="w-full" icon={<Mail className="h-4 w-4" />}>Generate Cover Letter</Button>
            </Link>
            <Link to="/interview">
              <Button variant="secondary" className="w-full" icon={<Mic className="h-4 w-4" />}>Practice Interview</Button>
            </Link>
          </div>
          <p className="text-center text-xs font-medium text-ink-400">
            All three tools are pre-filled from this analysis — one brain, zero re-typing.
          </p>
        </div>
      </div>
    </div>
  );
}
