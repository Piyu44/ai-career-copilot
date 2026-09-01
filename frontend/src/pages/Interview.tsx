import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, ChevronDown, History, Lightbulb, Mic, MicOff,
  PlayCircle, RotateCcw, Send, Sparkles, XCircle, Zap,
} from "lucide-react";
import { Badge, Bar, Button, Card, PageHeader, Select } from "../components/ui";
import { EvalRadar } from "../components/charts";
import { UpgradeModal } from "../components/sections";
import { useAuth, useToast } from "../context";
import { usePageMeta } from "../hooks";
import { evaluateInterviewAnswer, pickQuestions, type AnswerEval } from "../services/ai";
import { api } from "../services/api";
import { CREDIT_COSTS, type BankQuestion, type InterviewDifficulty, type InterviewType } from "../data";
import { cn, jobCtx } from "../utils";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", "React Developer", "Data Analyst"];
const TYPES: { id: InterviewType; label: string }[] = [
  { id: "technical", label: "Technical" },
  { id: "hr", label: "HR" },
  { id: "behavioral", label: "Behavioral" },
  { id: "mixed", label: "Mixed" },
];
const DIFFS: InterviewDifficulty[] = ["beginner", "intermediate", "advanced"];

interface SessionRecord {
  id: string;
  role: string;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  average: number;
  date: string;
  results: { q: string; overall: number }[];
}

export default function InterviewPage() {
  usePageMeta("AI Interview Simulator — Practice with AI", "Technical, HR and behavioral mock interviews with per-answer scoring and model answers.");
  const { user, spendCredits } = useAuth();
  const { toast } = useToast();

  const [phase, setPhase] = useState<"setup" | "session" | "summary">("setup");
  const [role, setRole] = useState(() => jobCtx.get()?.jobTitle || "Frontend Developer");
  const [type, setType] = useState<InterviewType>("technical");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("beginner");
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [stage, setStage] = useState<"answer" | "evaluating" | "eval">("answer");
  const [evalRes, setEvalRes] = useState<AnswerEval | null>(null);
  const [showBetter, setShowBetter] = useState(false);
  const [records, setRecords] = useState<{ q: BankQuestion; a: string; e: AnswerEval }[]>([]);
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    api.sessions.list().then(setHistory).catch(console.error);
  }, []);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [listening, setListening] = useState(false);

  const SR: any = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

  const start = () => {
    if (!spendCredits("interview")) return setShowUpgrade(true);
    setQuestions(pickQuestions(type, difficulty, 5));
    setIdx(0);
    setAnswer("");
    setRecords([]);
    setStage("answer");
    setEvalRes(null);
    setPhase("session");
    toast({ title: "Interview started", desc: `${TYPES.find((t) => t.id === type)?.label} · ${difficulty} · 5 questions`, tone: "info" });
  };

  const submitAnswer = async () => {
    if (answer.trim().split(/\s+/).length < 5) {
      toast({ title: "Answer is too short", desc: "Give at least a full sentence — interviewers need substance to score.", tone: "warning" });
      return;
    }
    setStage("evaluating");
    const e = await evaluateInterviewAnswer(questions[idx], answer);
    setEvalRes(e);
    setRecords((prev) => [...prev, { q: questions[idx], a: answer, e }]);
    setStage("eval");
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const avg = Math.round((records.reduce((s, r) => s + r.e.overall, 0) / records.length) * 10) / 10;
      const session: SessionRecord = {
        id: `s-${Date.now()}`,
        role, type, difficulty, average: avg,
        date: new Date().toISOString(),
        results: records.map((r) => ({ q: r.q.q, overall: r.e.overall })),
      };
      api.sessions.add(session).then(async () => {
        setHistory(await api.sessions.list());
      }).catch(console.error);
      setPhase("summary");
      toast({ title: `Session complete — ${avg}/10 average`, tone: avg >= 7 ? "success" : "info" });
      return;
    }
    setIdx(idx + 1);
    setAnswer("");
    setEvalRes(null);
    setShowBetter(false);
    setStage("answer");
  };

  const toggleMic = () => {
    if (!SR) {
      toast({ title: "Voice input not available", desc: "Voice support activates when the browser exposes SpeechRecognition — type your answer for now.", tone: "warning" });
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.onresult = (ev: any) => {
        setAnswer((prev) => (prev ? prev + " " : "") + ev.results[0][0].transcript);
        setListening(false);
      };
      rec.onend = () => setListening(false);
      rec.start();
      setListening(true);
      toast({ title: "Listening…", desc: "Speak your answer, then stop.", tone: "info" });
    } catch {
      toast({ title: "Could not start microphone", tone: "error" });
    }
  };

  /* --------------------------------- setup -------------------------------- */
  if (phase === "setup") {
    return (
      <div className="animate-fade-up">
        <PageHeader
          eyebrow={`Interview Practice · ${CREDIT_COSTS.interview} credits per session`}
          title="AI Interview Simulator"
          desc="Real questions, one at a time. Every answer scored on four axes, with a model answer to study."
        />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Configure your session</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-700">Job role</p>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-700">Interview type</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TYPES.map((t) => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={cn("rounded-lg px-3 py-2.5 text-[13px] font-bold ring-1 backdrop-blur-sm transition-all", type === t.id ? "bg-gradient-to-b from-brand-500 to-brand-700 text-white ring-brand-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_10px_22px_-8px_rgba(139,92,246,.6)]" : "bg-white/[0.05] text-ink-500 ring-white/12 hover:ring-brand-400/35 hover:text-white")}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-700">Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFS.map((d) => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={cn("rounded-lg px-3 py-2.5 text-[13px] font-bold capitalize ring-1 backdrop-blur-sm transition-all", difficulty === d ? "bg-white text-coal-950 ring-white/40 shadow-[0_8px_20px_-8px_rgba(255,255,255,.35)]" : "bg-white/[0.05] text-ink-500 ring-white/12 hover:ring-brand-400/35 hover:text-white")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3.5 ring-1 ring-ink-100">
                <p className="text-[13px] font-semibold text-ink-500">5 questions · ~10 minutes · scored per answer</p>
                <p className="flex items-center gap-1 text-[13px] font-bold text-brand-700"><Zap className="h-3.5 w-3.5" /> {CREDIT_COSTS.interview}</p>
              </div>
              <Button size="lg" className="w-full" onClick={start} icon={<PlayCircle className="h-5 w-5" />}>
                Start Interview — {user?.credits ?? 0} credits available
              </Button>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <p className="mb-3 flex items-center gap-2 font-display text-[15px] font-bold text-ink-900"><History className="h-4 w-4 text-brand-600" /> Past sessions</p>
              {history.length === 0 ? (
                <p className="text-sm text-ink-400">No sessions yet — your scores will build a practice history here.</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex items-center justify-between gap-3 rounded-lg bg-ink-50/70 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-ink-800">{h.role}</p>
                        <p className="text-[11px] font-medium capitalize text-ink-400">{h.type} · {h.difficulty} · {new Date(h.date).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold ring-1", h.average >= 7 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : h.average >= 5 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200")}>
                        {h.average}/10
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coal-700 to-coal-950 p-6 text-white ring-1 ring-brand-400/20">
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-600/30 blur-2xl" />
              <Mic className="h-6 w-6 text-brand-300" />
              <h3 className="mt-3 font-display text-lg font-bold">How scoring works</h3>
              <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-300">
                <li><strong className="text-white">Technical accuracy</strong> — key concepts you hit</li>
                <li><strong className="text-white">Communication</strong> — substance & structure</li>
                <li><strong className="text-white">Clarity</strong> — filler-free, focused delivery</li>
                <li><strong className="text-white">Confidence</strong> — assertive, non-hedging language</li>
              </ul>
            </div>
          </div>
        </div>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} need={CREDIT_COSTS.interview} />
      </div>
    );
  }

  /* -------------------------------- session ------------------------------- */
  if (phase === "session") {
    const q = questions[idx];
    return (
      <div className="mx-auto max-w-3xl animate-fade-up">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[13px] font-bold">
            <span className="text-ink-500 capitalize">{type} · {difficulty} · {role}</span>
            <span className="text-brand-700">Question {idx + 1} of {questions.length}</span>
          </div>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < idx ? "bg-emerald-400" : i === idx ? "bg-brand-600" : "bg-ink-200")} />
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-coal-700 to-coal-950 p-6 text-white">
            <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-brand-600/25 blur-2xl" />
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold">AI</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">Interviewer</p>
                <p className="mt-1 text-[16px] font-medium leading-relaxed">"{q.q}"</p>
              </div>
            </div>
          </div>

          {stage !== "eval" && (
            <div className="p-6">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={7}
                placeholder="Type your answer as you'd speak it in the interview…"
                className="w-full rounded-xl bg-white/[0.06] p-4 text-[14px] leading-relaxed text-ink-800 ring-1 ring-white/12 backdrop-blur-sm placeholder:text-ink-300 focus:bg-white/[0.09] focus:ring-2 focus:ring-brand-400/60 focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Button variant={listening ? "danger" : "secondary"} size="sm" onClick={toggleMic}
                    icon={listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}>
                    {listening ? "Stop" : "Voice input"}
                  </Button>
                  <span className="text-xs font-medium text-ink-400">{answer.trim() ? `${answer.trim().split(/\s+/).length} words` : "Aim for 3–5 structured sentences"}</span>
                </div>
                <Button size="lg" onClick={submitAnswer} loading={stage === "evaluating"} icon={<Send className="h-4 w-4" />}>
                  {stage === "evaluating" ? "Evaluating…" : "Submit Answer"}
                </Button>
              </div>
            </div>
          )}

          {stage === "eval" && evalRes && (
            <div className="p-6 animate-fade-up">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className={cn("flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-pop", evalRes.overall >= 7 ? "bg-emerald-500" : evalRes.overall >= 5 ? "bg-amber-500" : "bg-rose-500")}>
                  <span className="font-display text-4xl font-bold">{evalRes.overall}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">out of 10</span>
                </div>
                <div className="w-full flex-1 space-y-2.5">
                  {([["Technical Accuracy", evalRes.subs.technical, "brand"], ["Communication", evalRes.subs.communication, "sky"], ["Clarity", evalRes.subs.clarity, "emerald"], ["Confidence", evalRes.subs.confidence, "amber"]] as const).map(([l, v, t]) => (
                    <div key={l} className="flex items-center gap-3">
                      <span className="w-36 shrink-0 text-xs font-bold text-ink-500">{l}</span>
                      <Bar value={v * 10} tone={t} className="h-1.5" />
                      <span className="w-8 text-right text-xs font-bold text-ink-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> What you did well</p>
                  <ul className="space-y-1.5">{evalRes.didWell.map((d, i) => <li key={i} className="text-[13px] leading-relaxed text-emerald-900">• {d}</li>)}</ul>
                </div>
                <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-100">
                  <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-rose-800"><XCircle className="h-4 w-4" /> What you missed</p>
                  <ul className="space-y-1.5">{evalRes.missed.map((d, i) => <li key={i} className="text-[13px] leading-relaxed text-rose-900">• {d}</li>)}</ul>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-brand-100">
                <button onClick={() => setShowBetter(!showBetter)} className="flex w-full items-center justify-between bg-brand-50 px-4 py-3 text-left">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-brand-800"><Lightbulb className="h-4 w-4" /> Study a stronger answer</span>
                  <ChevronDown className={cn("h-4 w-4 text-brand-600 transition-transform", showBetter && "rotate-180")} />
                </button>
                {showBetter && <p className="bg-white/[0.04] px-4 py-3.5 text-[13.5px] leading-relaxed text-ink-600">{evalRes.better}</p>}
              </div>

              <div className="mt-6 flex justify-end">
                <Button size="lg" onClick={next} icon={<ArrowRight className="h-4 w-4" />}>
                  {idx + 1 >= questions.length ? "Finish Session" : "Next Question"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  /* -------------------------------- summary ------------------------------- */
  const avg = Math.round((records.reduce((s, r) => s + r.e.overall, 0) / records.length) * 10) / 10;
  const radar = [
    { metric: "Technical", value: Math.round((records.reduce((s, r) => s + r.e.subs.technical, 0) / records.length) * 10) / 10 },
    { metric: "Communication", value: Math.round((records.reduce((s, r) => s + r.e.subs.communication, 0) / records.length) * 10) / 10 },
    { metric: "Clarity", value: Math.round((records.reduce((s, r) => s + r.e.subs.clarity, 0) / records.length) * 10) / 10 },
    { metric: "Confidence", value: Math.round((records.reduce((s, r) => s + r.e.subs.confidence, 0) / records.length) * 10) / 10 },
  ];

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <PageHeader eyebrow="Session complete" title={`You averaged ${avg}/10`} desc={`${role} · ${type} · ${difficulty} — saved to your practice history.`} />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <EvalRadar data={radar} />
          <Button variant="secondary" className="mt-2 w-full" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setPhase("setup")}>
            Practice Again
          </Button>
          <Link to="/dashboard" className="mt-2 block"><Button variant="ghost" className="w-full">Back to Dashboard</Button></Link>
        </Card>
        <Card className="p-6">
          <p className="mb-4 font-display text-[15px] font-bold text-ink-900">Question by question</p>
          <div className="space-y-3">
            {records.map((r, i) => (
              <div key={i} className="rounded-xl border border-ink-100 p-4 transition-shadow hover:shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold leading-snug text-ink-800">{i + 1}. {r.q.q}</p>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1", r.e.overall >= 7 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : r.e.overall >= 5 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200")}>
                    {r.e.overall}/10
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-400">{r.a}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
