import React, { useEffect, useState } from "react";
import {
  Building2, Copy, FileDown, History, Mail, RefreshCw, Sparkles, Zap,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Skeleton, Textarea } from "../components/ui";
import { UpgradeModal } from "../components/sections";
import { useAuth, useData, useToast } from "../context";
import { usePageMeta } from "../hooks";
import { generateCoverLetter, type LetterTone } from "../services/ai";
import { api } from "../services/api";
import { CREDIT_COSTS } from "../data";
import { cn, copyText, downloadDocx, downloadPdf, jobCtx, timeAgo } from "../utils";

const TONES: { id: LetterTone; desc: string }[] = [
  { id: "Professional", desc: "Polished & formal" },
  { id: "Confident", desc: "Bold & direct" },
  { id: "Friendly", desc: "Warm & human" },
  { id: "Concise", desc: "Short & sharp" },
];

export default function CoverLetterPage() {
  usePageMeta("AI Cover Letter Generator — Personalized cover letters", "Generate a cover letter from your resume and the job description, in your chosen tone.");
  const { user, spendCredits } = useAuth();
  const { resumes } = useData();
  const { toast } = useToast();

  const [resumeText, setResumeText] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jdText, setJdText] = useState("");
  const [tone, setTone] = useState<LetterTone>("Professional");
  const [working, setWorking] = useState(false);
  const [letter, setLetter] = useState<{ subject: string; letter: string } | null>(null);
  const [history, setHistory] = useState<any[]>(api.covers.list());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ctx = jobCtx.get();
    if (ctx) {
      if (ctx.resumeText) setResumeText(ctx.resumeText);
      else if (resumes[0]) setResumeText(resumes[0].text);
      if (ctx.company) setCompany(ctx.company);
      if (ctx.jobTitle) setPosition(ctx.jobTitle);
      if (ctx.jobDescription) setJdText(ctx.jobDescription);
    } else if (resumes[0]) {
      setResumeText(resumes[0].text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async (silent = false) => {
    const errs: Record<string, string> = {};
    if (resumeText.trim().length < 120) errs.resume = "Paste or select your resume.";
    if (!company.trim()) errs.company = "Company is required";
    if (!position.trim()) errs.position = "Position is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!spendCredits("coverLetter")) return setShowUpgrade(true);
    setWorking(true);
    try {
      const res = await generateCoverLetter({ resumeText, company: company.trim(), jobTitle: position.trim(), tone, jobDescription: jdText || undefined });
      setLetter(res);
      api.covers.add({ ...res, company: company.trim(), position: position.trim(), tone, createdAt: new Date().toISOString() });
      setHistory(api.covers.list());
      if (!silent) toast({ title: "Cover letter generated", desc: `${tone} tone · ${res.letter.split(/\s+/).length} words`, tone: "success" });
    } catch (e: any) {
      toast({ title: "Generation failed", desc: e?.message, tone: "error" });
    } finally {
      setWorking(false);
    }
  };

  const downloadAs = (kind: "pdf" | "docx") => {
    if (!letter) return;
    const name = `cover-letter-${company.replace(/\s+/g, "-").toLowerCase()}`;
    if (kind === "pdf") {
      downloadPdf(name, letter.subject, [{ text: letter.letter }]);
    } else {
      downloadDocx(name, letter.subject, `<h1>${letter.subject}</h1>${letter.letter.split("\n").filter(Boolean).map((p) => `<p>${p}</p>`).join("")}`);
    }
    toast({ title: `Downloaded ${kind.toUpperCase()}`, tone: "success" });
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={`Cover Letter · ${CREDIT_COSTS.coverLetter} credits`}
        title="Cover Letter Generator"
        desc="Personalized from your resume and the exact job — pick a tone, regenerate until it sounds like you."
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* form */}
        <div className="space-y-5">
          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-700">Resume</span>
              {resumes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {resumes.slice(0, 3).map((r) => (
                    <button key={r.id} onClick={() => setResumeText(r.text)} className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-600 ring-1 ring-ink-200 hover:bg-brand-50 hover:text-brand-700">
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Textarea rows={5} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume text…" className="font-mono text-[12px]" />
            {errors.resume && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.resume}</p>}
          </Card>

          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company" error={errors.company}>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Swiggy" />
              </Field>
              <Field label="Position" error={errors.position}>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="React Developer" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Job description (optional)" hint="sharply personalizes the letter">
                <Textarea rows={4} value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the JD…" className="text-[12.5px]" />
              </Field>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-[13px] font-semibold text-ink-700">Tone</p>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200",
                      tone === t.id ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100" : "border-ink-200 bg-white hover:border-brand-300"
                    )}>
                    <span className={cn("block text-[13px] font-bold", tone === t.id ? "text-brand-800" : "text-ink-800")}>{t.id}</span>
                    <span className="text-[11px] font-medium text-ink-400">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
              <p className="text-xs font-medium text-ink-400">Costs <Badge tone="brand" className="mx-1"><Zap className="h-3 w-3" />{CREDIT_COSTS.coverLetter}</Badge> · balance <strong className="text-ink-700">{user?.credits ?? 0}</strong></p>
              <Button size="lg" onClick={() => generate()} loading={working} icon={<Mail className="h-4 w-4" />}>Generate</Button>
            </div>
          </Card>

          {history.length > 0 && (
            <Card className="p-5">
              <p className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink-700"><History className="h-4 w-4 text-brand-600" /> Recent letters</p>
              <div className="space-y-2">
                {history.slice(0, 4).map((h) => (
                  <button key={h.id} onClick={() => { setLetter({ subject: h.subject, letter: h.letter }); setCompany(h.company); setPosition(h.position); setTone(h.tone); }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg bg-ink-50/70 px-3.5 py-2.5 text-left transition-colors hover:bg-brand-50">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-ink-800">{h.position} — {h.company}</span>
                      <span className="text-[11px] font-medium text-ink-400">{h.tone} · {timeAgo(h.createdAt)}</span>
                    </span>
                    <Badge tone="ink" className="capitalize">{h.tone}</Badge>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* letter */}
        <div>
          {working && (
            <Card className="p-7">
              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-brand-700"><Sparkles className="h-4 w-4 animate-pulse-soft" /> Writing your letter…</div>
              <div className="space-y-3">{[60, 100, 95, 100, 88, 100, 70, 45].map((w, i) => <Skeleton key={i} className="h-3.5" style={{ width: `${w}%` } as any} />)}</div>
            </Card>
          )}
          {!working && !letter && (
            <div className="flex h-full min-h-[420px] items-center">
              <div className="w-full">
                <EmptyState
                  icon={<Mail className="h-6 w-6" />}
                  title="Your letter will appear here"
                  desc="Fill in the company and position, pick a tone, and generate a personalized cover letter in seconds."
                />
              </div>
            </div>
          )}
          {!working && letter && (
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/50 px-6 py-3.5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand-600" />
                  <p className="text-[13px] font-bold text-ink-800">{letter.subject}</p>
                </div>
                <Badge tone="brand" className="capitalize">{tone}</Badge>
              </div>
              <div className="max-h-[480px] overflow-auto whitespace-pre-wrap px-7 py-6 text-[14px] leading-[1.75] text-ink-700">
                {letter.letter}
                {"\n\n"}{user?.name}
                {"\n"}{user?.email}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-ink-100 bg-ink-50/40 px-6 py-4">
                <Button size="sm" variant="secondary" icon={<Copy className="h-3.5 w-3.5" />} onClick={async () => { await copyText(letter.letter); toast({ title: "Copied to clipboard", tone: "success" }); }}>Copy</Button>
                <Button size="sm" variant="secondary" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => generate(true)} loading={working}>Regenerate</Button>
                <Button size="sm" variant="secondary" icon={<FileDown className="h-3.5 w-3.5" />} onClick={() => downloadAs("pdf")}>PDF</Button>
                <Button size="sm" variant="secondary" icon={<FileDown className="h-3.5 w-3.5" />} onClick={() => downloadAs("docx")}>DOCX</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} need={CREDIT_COSTS.coverLetter} />
    </div>
  );
}
