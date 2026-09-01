import React, { useMemo, useState } from "react";
import {
  Briefcase, CalendarCheck2, ChevronDown, Pencil, Plus, Search, Trash2, Trophy, XCircle,
} from "lucide-react";
import { Badge, Button, Card, Confirm, EmptyState, Field, Input, Modal, PageHeader, Select, Skeleton, StatCard, Textarea, Tip } from "../components/ui";
import { useData, useToast } from "../context";
import { SEO } from "../components/SEO";
import { APP_STATUSES, STATUS_META, type AppStatus } from "../data";
import { cn, formatDate, uid } from "../utils";

const emptyForm = { company: "", role: "", location: "", dateApplied: new Date().toISOString().slice(0, 10), status: "Applied" as AppStatus, nextStep: "", notes: "" };

export default function ApplicationsPage() {
  const { applications, loading, upsertApplication, removeApplication } = useData();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppStatus>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "company">("recent");
  const [modal, setModal] = useState<null | { id?: string }>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<any | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    APP_STATUSES.forEach((s) => (c[s] = 0));
    applications.forEach((a) => (c[a.status] = (c[a.status] || 0) + 1));
    return c;
  }, [applications]);

  const filtered = useMemo(() => {
    let list = [...applications];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((a) => `${a.company} ${a.role} ${a.location} ${a.nextStep}`.toLowerCase().includes(q));
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    list.sort((a, b) =>
      sortBy === "company" ? a.company.localeCompare(b.company)
        : sortBy === "oldest" ? new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime()
        : new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    );
    return list;
  }, [applications, search, statusFilter, sortBy]);

  const openAdd = () => { setForm(emptyForm); setErrors({}); setModal({}); };
  const openEdit = (a: any) => {
    setForm({ ...a, dateApplied: a.dateApplied?.slice(0, 10) });
    setErrors({});
    setModal({ id: a.id });
  };

  const save = async () => {
    const errs: Record<string, string> = {};
    if (!form.company.trim()) errs.company = "Company is required";
    if (!form.role.trim()) errs.role = "Role is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await upsertApplication({
      ...form,
      id: modal?.id || uid(),
      company: form.company.trim(),
      role: form.role.trim(),
      dateApplied: new Date(form.dateApplied).toISOString(),
      createdAt: new Date().toISOString(),
    });
    setSaving(false);
    setModal(null);
    toast({ title: modal?.id ? "Application updated" : "Application added", desc: `${form.company} — ${form.role}`, tone: "success" });
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setDeleting(confirmDel.id);
    await removeApplication(confirmDel.id);
    setDeleting(null);
    setConfirmDel(null);
    toast({ title: "Application deleted", desc: `${confirmDel.company} — ${confirmDel.role}`, tone: "info" });
  };

  const total = applications.length;
  const pipelineMax = Math.max(1, ...APP_STATUSES.map((s) => counts[s]));

  return (
    <div className="animate-fade-up">
      <SEO 
        title="Application Tracker"
        description="Track every application through saved, applied, screening, interview, offer and rejected stages."
      />
      <PageHeader
        eyebrow="Application Tracker"
        title="Applications"
        desc="Every application, every stage, every next step — nothing slips through placement season."
        actions={<Button onClick={openAdd} icon={<Plus className="h-4 w-4" />}>Add Application</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Total Applications" value={loading ? "" : total} loading={loading} />
        <StatCard icon={<CalendarCheck2 className="h-5 w-5" />} label="Interviews" value={loading ? "" : counts.Interview} tone="amber" loading={loading} />
        <StatCard icon={<Trophy className="h-5 w-5" />} label="Offers" value={loading ? "" : counts.Offer} tone="emerald" loading={loading} />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejections" value={loading ? "" : counts.Rejected} tone="sky" loading={loading} />
      </div>

      {/* pipeline */}
      <Card className="mt-6 p-6">
        <h2 className="mb-4 font-display text-[15px] font-bold text-ink-900">Pipeline</h2>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink-100">
          {APP_STATUSES.filter((s) => counts[s] > 0).map((s) => (
            <div key={s} className={cn("h-full transition-all duration-700", STATUS_META[s].dot)} style={{ width: `${(counts[s] / total || 0) * 100}%` }} title={`${s}: ${counts[s]}`} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {APP_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={cn("rounded-xl border p-3 text-left backdrop-blur-sm transition-all", statusFilter === s ? "border-brand-400/60 bg-brand-500/14 shadow-[0_0_20px_rgba(139,92,246,.25)] ring-2 ring-brand-400/20" : "border-white/10 bg-white/[0.04] hover:border-brand-400/30")}>
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} />
                <span className="text-xs font-bold text-ink-500">{s}</span>
              </div>
              <p className="mt-1 font-display text-xl font-bold text-ink-900">{loading ? "–" : counts[s]}</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink-100">
                <div className={cn("h-full rounded-full transition-all duration-700", STATUS_META[s].dot)} style={{ width: `${(counts[s] / pipelineMax) * 100}%` }} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* toolbar */}
      <Card className="mt-6">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-5 py-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, role, notes…" className="pl-9" />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-40">
            <option value="all">All statuses</option>
            {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-44">
            <option value="recent">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="company">Company A–Z</option>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Briefcase className="h-6 w-6" />}
              title={applications.length === 0 ? "No applications tracked yet" : "Nothing matches your filters"}
              desc={applications.length === 0 ? "Add your first application and start the pipeline — future you will thank you during placement season." : "Try clearing the search or status filter."}
              action={applications.length === 0 ? <Button onClick={openAdd} icon={<Plus className="h-4 w-4" />}>Add Application</Button> : <Button variant="secondary" onClick={() => { setSearch(""); setStatusFilter("all"); }}>Clear filters</Button>}
            />
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-ink-100 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Date Applied</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Next Step</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="group border-b border-ink-50 transition-colors last:border-0 hover:bg-brand-50/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 font-display text-sm font-bold text-ink-600">{a.company[0]}</span>
                          <div>
                            <p className="text-sm font-bold text-ink-800">{a.company}</p>
                            {a.location && <p className="text-xs text-ink-400">{a.location}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-ink-600">{a.role}</td>
                      <td className="px-5 py-3.5 text-sm text-ink-500">{formatDate(a.dateApplied)}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1", STATUS_META[a.status as AppStatus].badge)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[a.status as AppStatus].dot)} /> {a.status}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-[13px] font-medium text-ink-500">{a.nextStep || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Tip label="Edit"><button onClick={() => openEdit(a)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-brand-700"><Pencil className="h-4 w-4" /></button></Tip>
                          <Tip label="Delete"><button onClick={() => setConfirmDel(a)} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></Tip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* mobile cards */}
            <div className="divide-y divide-ink-50 md:hidden">
              {filtered.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 font-display text-sm font-bold text-ink-600">{a.company[0]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-800">{a.company} · {a.role}</p>
                    <p className="text-xs text-ink-400">{formatDate(a.dateApplied)} · {a.nextStep || "no next step"}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ring-1", STATUS_META[a.status as AppStatus].badge)}>{a.status}</span>
                  <button onClick={() => openEdit(a)} className="rounded-lg p-2 text-ink-400"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setConfirmDel(a)} className="rounded-lg p-2 text-ink-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* add/edit modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? "Edit application" : "Add application"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" error={errors.company}>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Razorpay" />
          </Field>
          <Field label="Role" error={errors.role}>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Frontend Engineer" />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Bengaluru" />
          </Field>
          <Field label="Date applied">
            <Input type="date" value={form.dateApplied} onChange={(e) => setForm({ ...form, dateApplied: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Next step">
            <Input value={form.nextStep} onChange={(e) => setForm({ ...form, nextStep: e.target.value })} placeholder="OA on Monday" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral contact, CTC discussed, prep links…" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
          <Button onClick={save} loading={saving}>{modal?.id ? "Save changes" : "Add application"}</Button>
        </div>
      </Modal>

      <Confirm
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={doDelete}
        loading={!!deleting}
        title="Delete this application?"
        body={confirmDel ? `${confirmDel.company} — ${confirmDel.role} will be removed from your tracker. This can't be undone.` : ""}
      />
    </div>
  );
}
