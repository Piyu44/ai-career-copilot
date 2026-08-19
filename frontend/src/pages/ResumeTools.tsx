import React, { useEffect, useState } from "react";
import {
  CheckCircle2, Copy, FileDown, FileText, Lightbulb, RefreshCw, Save,
  ShieldCheck, Sparkles, Wand2, XCircle, Zap,
} from "lucide-react";
import {
  Badge, Bar, Button, Card, EmptyState, Field, PageHeader, ScoreRing, Select,
  Skeleton, Tabs, Textarea,
} from "../components/ui";
import { CategoryBars } from "../components/charts";
import { UpgradeModal } from "../components/sections";
import { useAuth, useData, useToast } from "../context";
import { usePageMeta } from "../hooks";
import { atsCheck, improveResume, type AtsResult, type ImproveResult } from "../services/ai";
import { CREDIT_COSTS } from "../data";
import { cn, copyText, downloadDocx, downloadPdf, jobCtx, uid } from "../utils";

/* ============================== RESUME TOOLS =============================== */

export function ResumeToolsPage() {
  usePageMeta("AI Resume Builder — Improve your resume with AI", "Rewrite your resume for a specific job: stronger verbs, JD-targeted skills, honest suggestions.");
  const { user, spendCredits } = useAuth();
  const { resumes, analyses, saveResume } = useData();
  const { toast } = useToast();

  const [resumeId, setResumeId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const [tab, setTab] = useState("improved");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<ImproveResult | null>(null);
  const [variant, setVariant] = useState(0);
  const [regenSection, setRegenSection] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ctx = jobCtx.get();
    if (ctx) {
      if (ctx.resumeText) setResumeText(ctx.resumeText);
      if (ctx.jobDescription) setJdText(ctx.jobDescription);
      if (ctx.jobTitle) setJobTitle(ctx.jobTitle);
    } else if (resumes[0]) {
      setResumeId(resumes[0].id);
      setResumeText(resumes[0].text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (v = variant) => {
    const errs: Record<string, string> = {};
    if (resumeText.trim().length < 120) errs.resume = "Paste or select a resume first.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!spendCredits("improve")) return setShowUpgrade(true);
    setWorking(true);
    setResult(null);
    try {
      const res = await improveResume(resumeText, jdText, jobTitle || "software role", v);
      setResult(res);
      setTab("improved");
      toast({ title: "Resume improved", desc: `${res.changes.length} changes · ${res.suggestions.length} suggestions`, tone: "success" });
    } catch (e: any) {
      toast({ title: "Improvement failed", desc: e?.message, tone: "error" });
    } finally {
      setWorking(false);
    }
  };

  const regenerate = async (section: string) => {
    if (!spendCredits("improve")) return setShowUpgrade(true);
    setRegenSection(section);
    const v = variant + 1;
    setVariant(v);
    try {
      const res = await improveResume(resumeText, jdText, jobTitle || "software role", v);
      setResult(res);
      toast({ title: `${section} regenerated`, desc: "Fresh phrasing, same facts.", tone: "success" });
    } finally {
      setRegenSection(null);
    }
  };

  const saveAsResume = () => {
    if (!result) return;
    saveResume({ id: uid(), name: `Tailored — ${jobTitle || "role"}${analysisId ? "" : ""}`, text: result.improvedText, updatedAt: new Date().toISOString() });
    toast({ title: "Saved to your resumes", tone: "success" });
  };

  const downloadAs = (kind: "pdf" | "docx") => {
    if (!result) return;
    const name = `improved-resume-${(jobTitle || "role").replace(/\s+/g, "-").toLowerCase()}`;
    if (kind === "pdf") {
      downloadPdf(name, "Resume — AI Improved", [
        { heading: "Professional Summary", text: result.summary },
        { heading: "Skills", text: result.skills },
        ...result.sections.filter((s) => !/SKILLS|SUMMARY|OBJECTIVE/i.test(s.heading)).map((s) => ({ heading: s.heading, text: s.body })),
      ]);
    } else {
      const body = `<h1>Resume — AI Improved</h1><h2>Professional Summary</h2><p>${result.summary}</p><h2>Skills</h2><p>${result.skills}</p>` +
        result.sections.filter((s) => !/SKILLS|SUMMARY|OBJECTIVE/i.test(s.heading))
          .map((s) => `<h2>${s.heading}</h2>${s.body.split("\n").map((l) => (l.trim().startsWith("-") ? `<p>• ${l.replace(/^-\s*/, "")}</p>` : `<p>${l}</p>`)).join("")}`)
          .join("");
      downloadDocx(name, "Resume", body);
    }
    toast({ title: `Downloaded ${kind.toUpperCase()}`, tone: "success" });
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={`Resume Tools · ${CREDIT_COSTS.improve} credits per run`}
        title="Resume Improvement"
        desc="Original vs AI Improved — rewritten for the target job, with every change explained. The AI never invents experience."
      />

      {/* inputs */}
      <Card className="p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-700">Your resume</span>
              {resumes.length > 0 && (
                <Select value={resumeId} onChange={(e) => { setResumeId(e.target.value); const r = resumes.find((x) => x.id === e.target.value); if (r) setResumeText(r.text); }} className="h-8 w-44 text-xs">
                  <option value="">— paste below —</option>
                  {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              )}
            </div>
            <Textarea rows={8} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text…" className="font-mono text-[12.5px]" />
            {errors.resume && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.resume}</p>}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-700">Target job description <span className="font-normal text-ink-400">(optional but sharper)</span></span>
              {analyses.length > 0 && (
                <Select value={analysisId} onChange={(e) => {
                  setAnalysisId(e.target.value);
                  const a = analyses.find((x) => x.id === e.target.value);
                  if (a) { setJdText(a.jobDescription || ""); setJobTitle(a.jobTitle); toast({ title: `Targeting ${a.jobTitle} — ${a.company}`, tone: "info" }); }
                }} className="h-8 w-48 text-xs">
                  <option value="">— from an analysis —</option>
                  {analyses.map((a) => <option key={a.id} value={a.id}>{a.jobTitle} · {a.company}</option>)}
                </Select>
              )}
            </div>
            <div className="mb-2">
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Target job title (e.g. Frontend Developer)"
                className="h-9 w-full rounded-lg bg-white/[0.06] px-3 text-[13px] text-ink-800 ring-1 ring-white/12 backdrop-blur-sm placeholder:text-ink-300 focus:bg-white/[0.09] focus:ring-2 focus:ring-brand-400/60 focus:outline-none" />
            </div>
            <Textarea rows={6} value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the job description to tailor against…" className="text-[12.5px]" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <p className="text-xs font-medium text-ink-400">
            Costs <Badge tone="brand" className="mx-1"><Zap className="h-3 w-3" />{CREDIT_COSTS.improve}</Badge> · balance <strong className="text-ink-700">{user?.credits ?? 0}</strong>
          </p>
          <Button size="lg" onClick={() => run()} loading={working} icon={<Wand2 className="h-4 w-4" />}>Improve My Resume</Button>
        </div>
      </Card>

      {/* result */}
      <div className="mt-6">
        {working && (
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-700">
              <Sparkles className="h-4 w-4 animate-pulse-soft" /> Rewriting for impact…
            </div>
            <div className="space-y-2.5">{[90, 100, 75, 95, 60, 85].map((w, i) => <Skeleton key={i} className="h-4" style={{ width: `${w}%` } as any} />)}</div>
          </Card>
        )}

        {!working && !result && (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No improved resume yet"
            desc="Add your resume and optionally a job description, then hit Improve. You'll get Original vs AI Improved with a full change log."
            action={<Button onClick={() => run()} loading={working} icon={<Wand2 className="h-4 w-4" />}>Improve My Resume</Button>}
          />
        )}

        {!working && result && (
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/50 px-5 py-3.5">
              <Tabs value={tab} onChange={setTab} items={[
                { id: "improved", label: "AI Improved", icon: <Sparkles className="h-3.5 w-3.5" /> },
                { id: "original", label: "Original" },
                { id: "changes", label: "Changes", badge: result.changes.length },
              ]} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" icon={<Copy className="h-3.5 w-3.5" />} onClick={async () => { await copyText(result.improvedText); toast({ title: "Copied to clipboard", tone: "success" }); }}>Copy</Button>
                <Button size="sm" variant="secondary" icon={<FileDown className="h-3.5 w-3.5" />} onClick={() => downloadAs("pdf")}>PDF</Button>
                <Button size="sm" variant="secondary" icon={<FileDown className="h-3.5 w-3.5" />} onClick={() => downloadAs("docx")}>DOCX</Button>
                <Button size="sm" icon={<Save className="h-3.5 w-3.5" />} onClick={saveAsResume}>Save</Button>
              </div>
            </div>

            {tab === "original" && (
              <pre className="max-h-[540px] overflow-auto whitespace-pre-wrap p-6 font-mono text-[12.5px] leading-relaxed text-ink-600">{result.originalText}</pre>
            )}

            {tab === "improved" && (
              <div className="max-h-[540px] space-y-6 overflow-auto p-6">
                <SectionBlock title="Professional Summary" onRegen={() => regenerate("Summary")} busy={regenSection === "Summary"}>
                  <p className="rounded-xl bg-brand-50 p-4 text-[14px] leading-relaxed text-ink-800 ring-1 ring-brand-100">{result.summary}</p>
                </SectionBlock>
                <SectionBlock title="Skills" onRegen={() => regenerate("Skills")} busy={regenSection === "Skills"}>
                  <p className="text-[13.5px] font-medium leading-relaxed text-ink-700">{result.skills || "—"}</p>
                  <p className="mt-1.5 text-xs text-ink-400">Re-ordered: skills the JD asks for appear first.</p>
                </SectionBlock>
                {result.sections.filter((s) => !/SKILLS|SUMMARY|OBJECTIVE/i.test(s.heading)).map((s) => (
                  <SectionBlock key={s.heading} title={s.heading}>
                    <div className="space-y-1.5">
                      {s.body.split("\n").map((line, i) => (
                        <p key={i} className={cn("text-[13.5px] leading-relaxed", line.trim().startsWith("-") ? "flex gap-2 text-ink-700" : "font-semibold text-ink-900")}>
                          {line.trim().startsWith("-") ? (<><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /><span>{line.replace(/^-\s*/, "")}</span></>) : line}
                        </p>
                      ))}
                    </div>
                  </SectionBlock>
                ))}
                <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <p className="flex items-center gap-2 text-sm font-bold text-amber-800"><Lightbulb className="h-4 w-4" /> What you could add (never invented)</p>
                  <ul className="mt-2 space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-amber-900"><span className="text-amber-500">→</span>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "changes" && (
              <div className="max-h-[540px] space-y-3 overflow-auto p-6">
                {result.changes.length === 0 && <p className="py-8 text-center text-sm text-ink-400">No line-level changes — your bullets were already strong. Regenerate for fresh phrasing.</p>}
                {result.changes.map((c, i) => (
                  <div key={i} className="rounded-xl border border-ink-100 p-4 transition-shadow hover:shadow-card">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge tone="brand">{c.section}</Badge>
                      <span className="text-[11px] font-semibold text-ink-400">{c.why}</span>
                    </div>
                    <p className="rounded-lg bg-rose-50 px-3 py-2 font-mono text-[12px] text-rose-700 line-through decoration-rose-300">− {c.before}</p>
                    <p className="mt-1.5 rounded-lg bg-emerald-50 px-3 py-2 font-mono text-[12px] text-emerald-800">+ {c.after}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} need={CREDIT_COSTS.improve} />
    </div>
  );
}

function SectionBlock({ title, children, onRegen, busy }: { title: string; children: React.ReactNode; onRegen?: () => void; busy?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">{title}</h3>
        {onRegen && (
          <Button size="sm" variant="ghost" loading={busy} onClick={onRegen} icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Regenerate
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

/* =============================== ATS CHECKER =============================== */

export function AtsCheckerPage() {
  usePageMeta("ATS Resume Checker — Free ATS score check", "Check formatting, structure, keywords and readability. Clearly labelled as our assessment, not an employer ATS.");
  const { user, spendCredits } = useAuth();
  const { resumes } = useData();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const ctx = jobCtx.get();
    if (ctx?.resumeText) setResumeText(ctx.resumeText);
    else if (resumes[0]) setResumeText(resumes[0].text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async () => {
    if (resumeText.trim().length < 120) {
      toast({ title: "Add a resume first", desc: "Paste at least a few lines of your resume.", tone: "warning" });
      return;
    }
    if (!spendCredits("ats")) return setShowUpgrade(true);
    setWorking(true);
    setResult(null);
    try {
      const res = await atsCheck(resumeText, jdText || undefined);
      setResult(res);
      toast({ title: `ATS assessment: ${res.score}/100`, tone: res.score >= 70 ? "success" : "warning" });
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={`ATS Checker · ${CREDIT_COSTS.ats} credits`}
        title="ATS Resume Checker"
        desc="Six checks — contact info, structure, formatting, keywords, impact and readability — with plain-language fixes."
      />

      {!result && (
        <Card className="p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Resume text" hint={resumes.length ? "or pick a saved resume below" : undefined}>
              <Textarea rows={10} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text…" className="font-mono text-[12.5px]" />
            </Field>
            <div className="flex flex-col gap-4">
              {resumes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {resumes.slice(0, 4).map((r) => (
                    <button key={r.id} onClick={() => setResumeText(r.text)} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-bold text-ink-600 ring-1 ring-ink-200 hover:bg-brand-50 hover:text-brand-700">
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
              <Field label="Job description (optional)" hint="adds a keyword-relevance check">
                <Textarea rows={7} value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste a JD to test keyword relevance…" className="text-[12.5px]" />
              </Field>
              <div className="rounded-xl bg-ink-50 p-4 ring-1 ring-ink-100">
                <p className="flex items-center gap-2 text-[13px] font-bold text-ink-700"><ShieldCheck className="h-4 w-4 text-brand-600" /> Honest by design</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">The score is our platform's assessment of parse-ability and quality. Real employer ATS configurations vary — we'll never pretend otherwise.</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
            <p className="text-xs font-medium text-ink-400">Costs <Badge tone="brand" className="mx-1"><Zap className="h-3 w-3" />{CREDIT_COSTS.ats}</Badge> · balance <strong className="text-ink-700">{user?.credits ?? 0}</strong></p>
            <Button size="lg" onClick={run} loading={working} icon={<ShieldCheck className="h-4 w-4" />}>Run ATS Check</Button>
          </div>
        </Card>
      )}

      {working && (
        <Card className="mt-6 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-700"><ShieldCheck className="h-4 w-4 animate-pulse-soft" /> Running 6 checks…</div>
          <div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        </Card>
      )}

      {result && !working && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800 ring-1 ring-amber-200">
            ⚖️ This is AI Career Copilot's assessment of your resume — not a score from any employer's ATS.
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card className="flex flex-col items-center p-7">
              <ScoreRing value={result.score} size={164} stroke={13} suffix="" caption="out of 100" />
              <p className="mt-3 font-display text-lg font-bold text-ink-900">
                {result.score >= 80 ? "Recruiter-ready" : result.score >= 60 ? "Solid — a few fixes away" : "Needs attention"}
              </p>
              <Button variant="secondary" className="mt-4" icon={<RefreshCw className="h-4 w-4" />} onClick={() => setResult(null)}>Check another resume</Button>
            </Card>
            <Card className="p-6">
              <h3 className="mb-3 font-display text-[15px] font-bold text-ink-900">Category scores</h3>
              <CategoryBars data={result.categories.map((c) => ({ name: c.name, score: c.score }))} height={230} />
              <div className="mt-4 space-y-2.5">
                {result.categories.map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-3 rounded-lg bg-ink-50/70 px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-ink-800">{c.name}</p>
                      <p className="truncate text-xs text-ink-400">{c.detail}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1", c.score >= 75 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : c.score >= 55 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200")}>{c.score}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <p className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink-900"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Strengths</p>
              {result.strengths.length ? (
                <ul className="space-y-2.5">{result.strengths.map((s, i) => <li key={i} className="flex gap-2.5 text-sm text-ink-600"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />{s}</li>)}</ul>
              ) : <p className="text-sm text-ink-400">None yet — the recommendations below will change that.</p>}
              <p className="mb-3 mt-6 flex items-center gap-2 font-display text-[15px] font-bold text-ink-900"><XCircle className="h-5 w-5 text-rose-500" /> Weaknesses</p>
              {result.weaknesses.length ? (
                <ul className="space-y-2.5">{result.weaknesses.map((s, i) => <li key={i} className="flex gap-2.5 text-sm text-ink-600"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />{s}</li>)}</ul>
              ) : <p className="text-sm text-ink-400">No critical weaknesses detected.</p>}
            </Card>
            <Card className="p-6">
              <p className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink-900"><Lightbulb className="h-5 w-5 text-amber-500" /> Recommendations</p>
              <ol className="space-y-3">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700 ring-1 ring-amber-200">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      )}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} need={CREDIT_COSTS.ats} />
    </div>
  );
}
