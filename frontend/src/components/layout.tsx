import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Briefcase, ChevronDown, FileText, LayoutDashboard, LogOut, Mail, Menu,
  Mic, Search, Settings, ShieldCheck, Target, X, Zap,
} from "lucide-react";
import { useAuth, useData } from "../context";
import { useBodyLock, useOnClickOutside } from "../hooks";
import { Badge, Button, Kbd, Logo, SceneShapes, Tip } from "./ui";
import { cn, timeAgo } from "../utils";
import { NAV_ITEMS } from "../data";

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Target, FileText, Mail, Mic, ShieldCheck, Briefcase, Settings,
};

/* ============================== PUBLIC LAYOUT ============================== */

const PUBLIC_LINKS = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/#", label: "How it works", hash: "how" },
  { to: "/#", label: "FAQ", hash: "faq" },
];

export function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const goHash = (hash: string) => {
    setOpen(false);
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-coal-950/70 shadow-[0_18px_44px_-24px_rgba(2,0,12,.9)] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="AI Career Copilot home"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((l) =>
            l.hash ? (
              <button key={l.label} onClick={() => goHash(l.hash!)} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-400 transition-colors hover:bg-white/7 hover:text-white">
                {l.label}
              </button>
            ) : (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => cn("rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors", isActive ? "text-brand-300" : "text-ink-400 hover:bg-white/7 hover:text-white")}>
                {l.label}
              </NavLink>
            )
          )}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link to="/dashboard"><Button size="md">Open Dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="md">Log in</Button></Link>
              <Link to="/register"><Button size="md">Get Started Free</Button></Link>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 text-ink-400 hover:bg-white/8 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="glass-deep mx-3 mb-3 rounded-xl px-4 pb-5 pt-3 md:hidden animate-fade-up">
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map((l) =>
              l.hash ? (
                <button key={l.label} onClick={() => goHash(l.hash!)} className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink-500 hover:bg-white/7">{l.label}</button>
              ) : (
                <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-500 hover:bg-white/7">{l.label}</Link>
              )
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {user ? (
              <Link to="/dashboard" className="col-span-2"><Button className="w-full">Open Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="secondary" className="w-full">Log in</Button></Link>
                <Link to="/register"><Button className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-coal-950/85 text-ink-400 backdrop-blur-xl">
      <div className="absolute inset-0 bg-grid-dark opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-x relative grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
            Your AI partner in getting hired — analyze, improve and personalize every application.
          </p>
          <Badge tone="brand" className="mt-4">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-300 shadow-[0_0_8px_rgba(196,181,253,.9)]" /> Demo mode · no AI key required
          </Badge>
        </div>
        {[
          { h: "Product", links: [["Features", "/features"], ["Pricing", "/pricing"], ["Job Match", "/job-match"], ["ATS Checker", "/ats-checker"]] },
          { h: "Tools", links: [["Resume Tools", "/resume-tools"], ["Cover Letter", "/cover-letter"], ["Interview Practice", "/interview"], ["Applications", "/applications"]] },
          { h: "Account", links: [["Log in", "/login"], ["Create account", "/register"], ["Dashboard", "/dashboard"], ["Settings", "/settings"]] },
        ].map((col) => (
          <div key={col.h}>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">{col.h}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-ink-400 transition-colors hover:text-brand-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/8">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-400/80 sm:flex-row">
          <p>© 2026 AI Career Copilot · Built for Indian students, freshers & developers</p>
          <p>Match & ATS scores are internal assessments — not employer ATS results.</p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

/* =============================== APP LAYOUT ================================ */

function CreditMeter() {
  const { user } = useAuth();
  if (!user) return null;
  const planCredits = { free: 10, starter: 100, pro: 500 }[user.plan] || 10;
  const pct = Math.min(100, (user.credits / planCredits) * 100);
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-coal-700 to-coal-950 p-4 text-white ring-1 ring-brand-400/25 shadow-[0_18px_44px_-20px_rgba(109,40,217,.5)]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-600/30 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Credits</span>
          <Badge tone="brand" className="capitalize">{user.plan}</Badge>
        </div>
        <p className="mt-2 font-display text-2xl font-bold">
          {user.credits}
          <span className="text-sm font-semibold text-ink-400"> / {planCredits}</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn("h-full rounded-full transition-all duration-700", pct < 25 ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,.6)]" : "bg-gradient-to-r from-brand-500 to-brand-300 shadow-[0_0_10px_rgba(167,139,250,.7)]")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <Link to="/pricing" className="mt-3 block text-center text-xs font-semibold text-brand-300 transition-colors hover:text-brand-200">
          Upgrade for more →
        </Link>
      </div>
    </div>
  );
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 no-scrollbar">
      {NAV_ITEMS.map((item) => {
        const Icon = NAV_ICONS[item.icon];
        const link = (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-brand-500/14 text-brand-200 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] ring-1 ring-brand-400/25"
                  : "text-ink-400 hover:bg-white/6 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400 shadow-[0_0_10px_rgba(167,139,250,.9)]" />}
                <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-brand-300" : "text-ink-400/80 group-hover:text-ink-600")} />
                {!collapsed && item.label}
              </>
            )}
          </NavLink>
        );
        return collapsed ? <Tip key={item.to} label={item.label}>{link}</Tip> : link;
      })}
    </nav>
  );
}

function SearchBox() {
  const { analyses } = useData();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const nav = useNavigate();
  const ref = useOnClickOutside(() => setFocused(false));

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const pages = NAV_ITEMS.filter((n) => !query || n.label.toLowerCase().includes(query)).map((n) => ({
      label: n.label, to: n.to, kind: "Page",
    }));
    const an = analyses
      .filter((a) => query && `${a.jobTitle} ${a.company}`.toLowerCase().includes(query))
      .slice(0, 4)
      .map((a) => ({ label: `${a.jobTitle} — ${a.company}`, to: "/job-match", kind: `Match ${a.matchScore}%` }));
    return query ? [...an, ...pages.filter((p) => p.label.toLowerCase().includes(query))] : pages;
  }, [q, analyses]);

  const go = (to: string) => {
    nav(to);
    setQ("");
    setFocused(false);
  };

  return (
    <div ref={ref} className="relative hidden w-64 sm:block lg:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) go(results[0].to);
          if (e.key === "Escape") { setQ(""); setFocused(false); }
        }}
        placeholder="Search tools & analyses…"
        className="h-9 w-full rounded-lg bg-white/6 pl-9 pr-12 text-sm text-white ring-1 ring-white/10 backdrop-blur-sm transition-all placeholder:text-ink-300 focus:bg-white/10 focus:ring-2 focus:ring-brand-400/50 focus:outline-none"
      />
      <span className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 lg:block"><Kbd>/</Kbd></span>
      {focused && (
        <div className="glass-deep absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl py-1.5 animate-pop-in">
          {results.length === 0 && <p className="px-4 py-3 text-sm text-ink-400">No matches for "{q}"</p>}
          {results.map((r) => (
            <button key={`${r.to}-${r.label}`} onClick={() => go(r.to)} className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-brand-500/12">
              <span className="truncate font-medium text-ink-600">{r.label}</span>
              <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-400 ring-1 ring-white/10">{r.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotifBell() {
  const { notifs, markNotifsRead } = useData();
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside(() => setOpen(false));
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-ink-400 transition-colors hover:bg-white/8 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,.7)] ring-2 ring-coal-950">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="glass-deep absolute right-0 top-11 z-50 w-[320px] overflow-hidden rounded-xl animate-pop-in">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-bold text-white">Notifications</p>
            <button onClick={() => markNotifsRead()} className="text-xs font-semibold text-brand-300 hover:text-brand-200">Mark all read</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-400">You're all caught up 🎉</p>}
            {notifs.map((n) => (
              <div key={n.id} className={cn("flex gap-3 border-b border-white/6 px-4 py-3", !n.read && "bg-brand-500/10")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-white/20" : "bg-brand-400 shadow-[0_0_8px_rgba(167,139,250,.9)]")} />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink-700">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-ink-400">{n.body}</p>
                  <p className="mt-1 text-[11px] font-medium text-ink-300">{timeAgo(n.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside(() => setOpen(false));
  const nav = useNavigate();
  if (!user) return null;
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/8">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_6px_16px_-4px_rgba(139,92,246,.7)]">{initials}</span>
        <ChevronDown className={cn("hidden h-4 w-4 text-ink-400 transition-transform sm:block", open && "rotate-180")} />
      </button>
      {open && (
        <div className="glass-deep absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl animate-pop-in">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
            <Badge tone="brand" className="mt-2 capitalize">{user.plan} plan</Badge>
          </div>
          <div className="py-1.5">
            <button onClick={() => { setOpen(false); nav("/settings"); }} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink-500 hover:bg-white/6 hover:text-white">
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button onClick={() => { setOpen(false); logout(); }} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const { user } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  useBodyLock(drawer);
  useEffect(() => setDrawer(false), [location.pathname]);
  if (!user) return null;

  const bottomNav = NAV_ITEMS.slice(0, 4).concat(NAV_ITEMS[7]);

  return (
    <div className="relative min-h-screen">
      <SceneShapes variant="b" />

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "glass-deep fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-[248px]"
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-white/8", collapsed ? "justify-center" : "px-5")}>
          {collapsed ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-[0_8px_20px_-6px_rgba(139,92,246,.7)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M13 2 5 14h5.5L11 22l8-12h-5.5L13 2Z" fill="#fff" /></svg>
            </span>
          ) : (
            <Link to="/dashboard"><Logo /></Link>
          )}
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="space-y-3 p-3">
          {!collapsed && <CreditMeter />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-ink-400 transition-colors hover:bg-white/7 hover:text-white"
          >
            <ChevronDown className={cn("h-4 w-4 rotate-90 transition-transform", collapsed && "-rotate-90")} />
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-[3px]" onClick={() => setDrawer(false)} />
          <div className="glass-deep absolute inset-y-0 left-0 flex w-[270px] flex-col animate-fade-up">
            <div className="flex h-16 items-center justify-between border-b border-white/8 px-5">
              <Logo />
              <button onClick={() => setDrawer(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-white/8" aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            <SidebarNav collapsed={false} onNavigate={() => setDrawer(false)} />
            <div className="p-3"><CreditMeter /></div>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-30 border-b border-white/8 bg-paper/60 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setDrawer(true)} className="rounded-lg p-2 text-ink-500 hover:bg-white/8 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <SearchBox />
            <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
              <Link to="/settings" className="glass-chip group flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-3.5 text-[13px] font-bold text-ink-700 transition-all hover:border-brand-300/40">
                <Zap className={cn("h-4 w-4", user.credits < 5 ? "text-amber-400" : "text-brand-300")} />
                {user.credits}
                <span className="hidden font-semibold text-ink-400 sm:inline">credits</span>
              </Link>
              <Badge tone="brand" className="hidden capitalize sm:inline-flex">{user.plan}</Badge>
              <NotifBell />
              <AvatarMenu />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-7 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="glass-deep fixed inset-x-0 bottom-0 z-40 border-t border-white/10 lg:hidden">
        <div className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold", isActive ? "text-brand-300" : "text-ink-400")
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("rounded-lg px-2.5 py-1", isActive && "bg-brand-500/15 shadow-[0_0_14px_rgba(139,92,246,.3)]")}><Icon className="h-[18px] w-[18px]" /></span>
                    {item.label.split(" ")[0]}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ============================== route guards =============================== */

export function Protected() {
  const { user, initializing } = useAuth();
  if (initializing)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse-soft"><Logo /></div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
