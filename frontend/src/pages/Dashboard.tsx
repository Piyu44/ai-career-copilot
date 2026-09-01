import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Briefcase, CalendarCheck2, ChevronRight, ClipboardCheck, FileText,
  Lightbulb, Mail, Mic, ShieldCheck, Target, TrendingUp, Zap,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton, StatCard } from "../components/ui";
import { TrendArea } from "../components/charts";
import { useAuth, useData } from "../context";
import { usePageMeta } from "../hooks";
import { jobCtx, timeAgo } from "../utils";
import { CREDIT_COSTS } from "../data";

const scoreTone = (s: number) => (s >= 75 ? "emerald" : s >= 60 ? "amber" : "rose") as "emerald" | "amber" | "rose";

export default function Dashboard() {
  usePageMeta("Dashboard — JOB ASAP");
  const { user } = useAuth();
  const { analyses, applications, loading } = useData();
  const nav = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name.split(" ")[0] ?? "there";

  const avgMatch = analyses.length
    ? Math.round(analyses.reduce((a, b) => a + b.matchScore, 0) / analyses.length)
    : 0;
  const interviews = applications.filter((a) => a.status === "Interview").length;
  const planCredits = { free: 10, starter: 100, pro: 500 }[user?.plan ?? "free"] ?? 10;

  const gapSkills = [...new Set(analyses.flatMap((a) => a.missingSkills || []))].slice(0, 6);
  const gapKeywords = [...new Set(analyses.flatMap((a) => a.missingKeywords || []))].slice(0, 5);

  const trendData = [...analyses]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((a, i) => ({ label: a.company?.slice(0, 8) ?? `#${i + 1}`, value: a.matchScore }));

  const openAnalysis = (a: any) => {
    jobCtx.set(a);
    nav("/job-match");
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Dashboard"
        title={`${greeting}, ${firstName} 👋`}
        desc="Here's where your job hunt stands — and the fastest way to move it forward."
        actions={
          <Link to="/job-match">
            <Button icon={<Target className="h-4 w-4" />}>New Job Analysis</Button>
          </Link>
        }
      />

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Target className="h-5 w-5" />} label="Job Analyses" value={loading ? "" : analyses.length} sub={`Last: ${analyses[0] ? timeAgo(analyses[0].createdAt) : "—"}`} loading={loading} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Average Match" value={loading ? "" : `${avgMatch}%`} sub={avgMatch >= 70 ? "Strong positioning" : "Room to improve"} tone="emerald" loading={loading} />
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Applications" value={loading ? "" : applications.length} sub={`${applications.filter((a) => a.status === "Offer").length} offers`} tone="sky" loading={loading} />
        <StatCard icon={<CalendarCheck2 className="h-5 w-5" />} label="Interviews" value={loading ? "" : interviews} sub="Active interview stages" tone="amber" loading={loading} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* left column */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900">Match score trend</h2>
                <p className="text-xs font-medium text-ink-400">How your targeting has improved, analysis by analysis</p>
              </div>
              <Badge tone="brand"><TrendingUp className="h-3.5 w-3.5" /> {analyses.length} analyses</Badge>
            </div>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : trendData.length >= 2 ? (
              <TrendArea data={trendData} />
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm font-medium text-ink-400">
                Run 2+ analyses to see your trend line
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-ink-900">Recent analyses</h2>
              <Link to="/job-match" className="text-[13px] font-bold text-brand-700 hover:text-brand-900">New analysis</Link>
            </div>
            {loading ? (
              <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : analyses.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<Target className="h-6 w-6" />}
                  title="No job analyses yet."
                  desc="Paste a resume and a job description to see your match score, missing skills and keywords."
                  action={<Link to="/job-match"><Button icon={<Target className="h-4 w-4" />}>Analyze Your First Job</Button></Link>}
                />
              </div>
            ) : (
              <div>
                {analyses.slice(0, 5).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => openAnalysis(a)}
                    className="group flex w-full items-center gap-4 border-b border-ink-50 px-6 py-4 text-left transition-colors last:border-0 hover:bg-brand-50/40"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 font-display text-sm font-bold text-ink-600 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700">
                      {(a.company || "?")[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink-800">{a.jobTitle} — {a.company}</span>
                      <span className="text-xs font-medium text-ink-400">{timeAgo(a.createdAt)} · {a.location || "—"}</span>
                    </span>
                    <Badge tone={scoreTone(a.matchScore)}>{a.matchScore}% match</Badge>
                    <ChevronRight className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* right column */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-coal-700 to-coal-950 p-5 text-white ring-1 ring-brand-400/20">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-600/30 blur-2xl" />
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-300">Credits remaining</p>
                <Badge tone="brand" className="bg-brand-500/20 text-brand-200 ring-brand-400/30 capitalize">{user?.plan}</Badge>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <p className="font-display text-4xl font-bold">{user?.credits ?? 0}</p>
                <p className="text-xs font-semibold text-ink-400">of {planCredits} this cycle</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${(user?.credits ?? 0) / planCredits < 0.25 ? "bg-amber-400" : "bg-brand-400"}`}
                  style={{ width: `${Math.min(100, ((user?.credits ?? 0) / planCredits) * 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 p-5 text-[13px] font-medium text-ink-500">
              <p className="flex justify-between"><span>Job analysis</span><span className="font-bold text-ink-700">{CREDIT_COSTS.analysis} <Zap className="mb-0.5 inline h-3 w-3 text-brand-500" /></span></p>
              <p className="flex justify-between"><span>Resume improve</span><span className="font-bold text-ink-700">{CREDIT_COSTS.improve} <Zap className="mb-0.5 inline h-3 w-3 text-brand-500" /></span></p>
              <p className="flex justify-between"><span>Cover letter</span><span className="font-bold text-ink-700">{CREDIT_COSTS.coverLetter} <Zap className="mb-0.5 inline h-3 w-3 text-brand-500" /></span></p>
              <Link to="/pricing" className="mt-1 flex items-center gap-1 font-bold text-brand-700 hover:text-brand-900">
                Get more credits <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-[15px] font-bold text-ink-900">Improve Your Chances</h2>
                <p className="text-xs font-medium text-ink-400">Gaps found across your analyses</p>
              </div>
            </div>
            {gapSkills.length === 0 && gapKeywords.length === 0 ? (
              <p className="mt-4 text-sm text-ink-400">Run an analysis and the gaps you should close will appear here.</p>
            ) : (
              <>
                {gapSkills.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-rose-600">Missing skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gapSkills.map((s) => (
                        <span key={s} className="rounded-md bg-rose-50 px-2.5 py-1 text-[13px] font-semibold text-rose-700 ring-1 ring-rose-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {gapKeywords.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-600">Missing keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gapKeywords.map((s) => (
                        <span key={s} className="rounded-md bg-amber-50 px-2.5 py-1 text-[13px] font-semibold text-amber-700 ring-1 ring-amber-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <Link to="/resume-tools" className="mt-5 block">
                  <Button variant="outline" className="w-full" icon={<FileText className="h-4 w-4" />}>Fix with Resume Tools</Button>
                </Link>
              </>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/ats-checker", icon: ShieldCheck, label: "ATS Check", desc: `${CREDIT_COSTS.ats} credits` },
              { to: "/cover-letter", icon: Mail, label: "Cover Letter", desc: `${CREDIT_COSTS.coverLetter} credits` },
              { to: "/interview", icon: Mic, label: "Mock Interview", desc: `${CREDIT_COSTS.interview} credits` },
              { to: "/applications", icon: ClipboardCheck, label: "Track Apps", desc: "Free" },
            ].map((q) => (
              <Link key={q.to} to={q.to}>
                <Card className="card-hover flex h-full flex-col items-start p-4">
                  <q.icon className="h-5 w-5 text-brand-600" />
                  <p className="mt-2.5 text-sm font-bold text-ink-800">{q.label}</p>
                  <p className="text-[11px] font-semibold text-ink-400">{q.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
