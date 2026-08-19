import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Briefcase, ChevronDown, FileText, LayoutDashboard, LogOut, Mail, Menu,
  Mic, Search, Settings, ShieldCheck, Target, X, Zap,
} from "lucide-react";
import { useAuth, useData } from "../context";
import { useBodyLock, useOnClickOutside } from "../hooks";
import { Badge, Button, Kbd, Logo, Tip } from "./ui";
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
    if (location.pathname !== "/") {
      window.location.hash = `#/${""}`;
      setTimeout(() => {
        window.location.hash = "";
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return;
    }
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/90 shadow-[0_8px_30px_-18px_rgba(20,21,46,.25)] backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="AI Career Copilot home"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((l) =>
            l.hash ? (
              <button key={l.label} onClick={() => goHash(l.hash!)} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100/60 hover:text-ink-900">
                {l.label}
              </button>
            ) : (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => cn("rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors", isActive ? "text-brand-700" : "text-ink-600 hover:bg-ink-100/60 hover:text-ink-900")}>
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
        <button className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-ink-100 bg-white px-4 pb-5 pt-3 shadow-lift md:hidden animate-fade-up">
          <div className="flex flex-col gap-1">
            {PUBLIC_LINKS.map((l) =>
              l.hash ? (
                <button key={l.label} onClick={() => goHash(l.hash!)} className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink-700 hover:bg-ink-50">{l.label}</button>
              ) : (
                <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">{l.label}</Link>
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
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      <div className="absolute inset-0 bg-grid-dark opacity-60" />
      <div className="container-x relative grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
            Your AI partner in getting hired — analyze, improve and personalize every application.
          </p>
          <Badge tone="brand" className="mt-4 bg-brand-500/15 text-brand-200 ring-brand-500/30">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-300" /> Demo mode · no AI key required
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
                  <Link to={to} className="text-sm text-ink-400 transition-colors hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-500 sm:flex-row">
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
    <div className="rounded-xl bg-ink-900 p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-300">Credits</span>
        <Badge tone="brand" className="bg-brand-500/20 text-brand-200 ring-brand-400/30 capitalize">{user.plan}</Badge>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">
        {user.credits}
        <span className="text-sm font-semibold text-ink-400"> / {planCredits}</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-all duration-700", pct < 25 ? "bg-amber-400" : "bg-brand-400")} style={{ width: `${pct}%` }} />
      </div>
      <Link to="/pricing" className="mt-3 block text-center text-xs font-semibold text-brand-300 transition-colors hover:text-brand-200">
        Upgrade for more →
      </Link>
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
                  ? "bg-brand-50 text-brand-800"
                  : "text-ink-500 hover:bg-ink-100/70 hover:text-ink-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />}
                <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-brand-700" : "text-ink-400 group-hover:text-ink-600")} />
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
        className="h-9 w-full rounded-lg bg-ink-100/70 pl-9 pr-12 text-sm text-ink-800 ring-1 ring-transparent transition-all placeholder:text-ink-300 focus:bg-white focus:ring-2 focus:ring-brand-400 focus:outline-none"
      />
      <span className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 lg:block"><Kbd>/</Kbd></span>
      {focused && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl bg-white py-1.5 shadow-lift ring-1 ring-ink-100 animate-pop-in">
          {results.length === 0 && <p className="px-4 py-3 text-sm text-ink-400">No matches for "{q}"</p>}
          {results.map((r, i) => (
            <button key={`${r.to}-${r.label}`} onClick={() => go(r.to)} className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-brand-50/70">
              <span className="truncate font-medium text-ink-700">{r.label}</span>
              <span className="shrink-0 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-500">{r.kind}</span>
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
        className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[320px] overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-ink-100 animate-pop-in">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">Notifications</p>
            <button onClick={() => { markNotifsRead(); }} className="text-xs font-semibold text-brand-600 hover:text-brand-800">Mark all read</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-400">You're all caught up 🎉</p>}
            {notifs.map((n) => (
              <div key={n.id} className={cn("flex gap-3 border-b border-ink-50 px-4 py-3", !n.read && "bg-brand-50/50")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-ink-200" : "bg-brand-500")} />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink-800">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-ink-500">{n.body}</p>
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
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-ink-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{initials}</span>
        <ChevronDown className={cn("hidden h-4 w-4 text-ink-400 transition-transform sm:block", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-ink-100 animate-pop-in">
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-ink-900">{user.name}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
            <Badge tone="brand" className="mt-2 capitalize">{user.plan} plan</Badge>
          </div>
          <div className="py-1.5">
            <button onClick={() => { setOpen(false); nav("/settings"); }} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button onClick={() => { setOpen(false); logout(); }} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
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
    <div className="min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-ink-100 bg-white transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-[248px]"
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-ink-100", collapsed ? "justify-center" : "px-5")}>
          {collapsed ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700">
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
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <ChevronDown className={cn("h-4 w-4 rotate-90 transition-transform", collapsed && "-rotate-90")} />
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[270px] flex-col bg-white shadow-lift animate-fade-up">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
              <Logo />
              <button onClick={() => setDrawer(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100" aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            <SidebarNav collapsed={false} onNavigate={() => setDrawer(false)} />
            <div className="p-3"><CreditMeter /></div>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-30 border-b border-ink-100 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setDrawer(true)} className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <SearchBox />
            <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
              <Link to="/settings" className="group flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-3 pr-3.5 text-[13px] font-bold text-ink-700 ring-1 ring-ink-200 transition-all hover:ring-brand-300">
                <Zap className={cn("h-4 w-4", user.credits < 5 ? "text-amber-500" : "text-brand-600")} />
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
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold", isActive ? "text-brand-700" : "text-ink-400")
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("rounded-lg px-2.5 py-1", isActive && "bg-brand-50")}><Icon className="h-[18px] w-[18px]" /></span>
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
      <div className="flex min-h-screen items-center justify-center bg-paper">
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
