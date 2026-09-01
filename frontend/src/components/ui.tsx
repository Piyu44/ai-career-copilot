import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "../utils";
import { useBodyLock, useTilt } from "../hooks";

/* ------------------------------ 3D primitives ------------------------------ */

export function Cube({ size = 64, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  const half = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
  return (
    <div className={cn("cube", className)} style={{ width: size, height: size, ...style }} aria-hidden>
      {faces.map((t) => (
        <div key={t} className="cube-face" style={{ transform: t }} />
      ))}
    </div>
  );
}

export const Orb = ({ size = 90, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <div className={cn("orb", className)} style={{ width: size, height: size, ...style }} aria-hidden />
);

export const Ring3D = ({ size = 150, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <div className={cn("ring3d", className)} style={{ width: size, height: size, ...style }} aria-hidden />
);

/** Ambient floating 3D shapes for page scenes */
export function SceneShapes({ variant = "a" }: { variant?: "a" | "b" }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {variant === "a" ? (
        <>
          <Cube size={72} className="absolute left-[6%] top-[18%] opacity-70 animate-floaty" />
          <Orb size={44} className="absolute right-[10%] top-[14%] opacity-80 animate-floaty-slow" />
          <Ring3D size={180} className="absolute -right-16 bottom-[8%] opacity-50" />
          <Cube size={34} className="absolute right-[22%] bottom-[22%] opacity-50 animate-floaty" style={{ animationDelay: "-3s" }} />
        </>
      ) : (
        <>
          <Orb size={64} className="absolute left-[8%] bottom-[16%] opacity-70 animate-floaty" />
          <Cube size={52} className="absolute right-[7%] top-[20%] opacity-60 animate-floaty-slow" />
          <Ring3D size={140} className="absolute -left-12 top-[30%] opacity-40" />
        </>
      )}
    </div>
  );
}

/** Perspective tilt wrapper with glare */
export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useTilt<HTMLDivElement>(max);
  return (
    <div className="tilt-scene">
      <div ref={ref} className={cn("tilt-card tilt-glare relative", className)}>
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- Button --------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "outline";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_12px_28px_-8px_rgba(249,115,22,.6)] " +
    "hover:brightness-110 hover:shadow-[0_16px_32px_-6px_rgba(249,115,22,.7)] active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_4px_12px_-6px_rgba(249,115,22,.5)]",
  secondary:
    "glass-chip text-ink-700 hover:bg-white/12 hover:text-white hover:border-orange-400/40 " +
    "shadow-[0_10px_24px_-14px_rgba(0,0,0,.8)] active:translate-y-[1px]",
  ghost: "text-ink-400 hover:bg-white/8 hover:text-ink-800",
  danger:
    "bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_12px_26px_-10px_rgba(225,29,72,.55)] hover:brightness-110 active:translate-y-[2px]",
  dark: "bg-coal-800 text-white ring-1 ring-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_12px_28px_-14px_rgba(0,0,0,.9)] hover:bg-coal-700 active:translate-y-[1px]",
  outline: "text-orange-300 ring-1 ring-orange-400/45 hover:bg-orange-500/12 hover:text-orange-200",
};
const sizeCls: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export const buttonCls = (variant: Variant = "primary", size: Size = "md", extra = "") =>
  cn(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 select-none",
    "disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
    variantCls[variant],
    sizeCls[size],
    extra
  );

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button className={buttonCls(variant, size, className)} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export const Card = ({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("glass rounded-xl", className)} {...rest}>
    {children}
  </div>
);

/* --------------------------------- Badges --------------------------------- */

const badgeTones: Record<string, string> = {
  brand: "bg-brand-500/14 text-brand-300 ring-brand-400/30",
  ink: "bg-white/7 text-ink-500 ring-white/12",
  emerald: "bg-emerald-400/12 text-emerald-300 ring-emerald-400/25",
  amber: "bg-amber-400/12 text-amber-300 ring-amber-400/25",
  rose: "bg-rose-400/12 text-rose-300 ring-rose-400/25",
  sky: "bg-sky-400/12 text-sky-300 ring-sky-400/25",
};

export const Badge = ({
  tone = "ink",
  className,
  children,
}: {
  tone?: keyof typeof badgeTones;
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 backdrop-blur-sm",
      badgeTones[tone],
      className
    )}
  >
    {children}
  </span>
);

export const SkillChip = ({
  label,
  state = "neutral",
  className,
}: {
  label: string;
  state?: "match" | "missing" | "neutral";
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium ring-1 backdrop-blur-sm transition-transform hover:scale-[1.04]",
      state === "match" && "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
      state === "missing" && "bg-rose-400/10 text-rose-300 ring-rose-400/25",
      state === "neutral" && "bg-white/6 text-ink-500 ring-white/12",
      className
    )}
  >
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]",
        state === "match" ? "bg-emerald-400" : state === "missing" ? "bg-rose-400" : "bg-ink-300"
      )}
    />
    {label}
  </span>
);

/* --------------------------------- Inputs --------------------------------- */

export const inputCls =
  "w-full rounded-lg bg-white/[0.06] px-3.5 text-sm text-ink-800 ring-1 ring-white/12 placeholder:text-ink-300 " +
  "backdrop-blur-sm transition-all focus:bg-white/[0.09] focus:ring-2 focus:ring-brand-400/60 focus:outline-none";

export const Input = ({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(inputCls, "h-10", className)} {...rest} />
);

export const Textarea = ({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(inputCls, "py-2.5 leading-relaxed", className)} {...rest} />
);

export const Select = ({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(inputCls, "h-10 appearance-none pr-8 bg-[right_0.6rem_center] bg-no-repeat [&>option]:bg-coal-900 [&>option]:text-ink-800", className)}
    style={{
      backgroundImage:
        "url(\"image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23a49bc6' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
    }}
    {...rest}
  >
    {children}
  </select>
);

export const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-ink-600">
      {label}
      {hint && <span className="text-xs font-normal text-ink-400">{hint}</span>}
    </span>
    {children}
    {error && <span className="mt-1 block text-xs font-medium text-rose-400">{error}</span>}
  </label>
);

export const Toggle = ({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!on)}
    className="flex items-center gap-2.5 text-sm font-medium text-ink-600"
    role="switch"
    aria-checked={on}
  >
    <span
      className={cn(
        "relative h-6 w-11 rounded-full ring-1 transition-colors duration-200",
        on ? "bg-gradient-to-r from-orange-500 to-purple-600 ring-orange-400/40 shadow-[0_0_14px_rgba(249,115,22,.5)]" : "bg-white/10 ring-white/15"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.4)] transition-all duration-200",
          on ? "left-[22px]" : "left-0.5"
        )}
      />
    </span>
    {label}
  </button>
);

/* --------------------------------- Modal ---------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useBodyLock(open);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-[6px]" onClick={onClose} />
      <div
        className={cn(
          "glass-deep relative w-full overflow-hidden rounded-t-2xl animate-pop-in sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        )}
        role="dialog"
        aria-modal
      >
        {title && (
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="font-display text-lg font-bold text-white">{title}</h3>
            <button onClick={onClose} className="rounded-md p-1.5 text-ink-400 hover:bg-white/10 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({
  open,
  title,
  body,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm leading-relaxed text-ink-500">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

/* ---------------------------------- Tabs ---------------------------------- */

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: string; label: string; icon?: React.ReactNode; badge?: string | number }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("glass-chip inline-flex flex-wrap items-center gap-1 rounded-lg p-1", className)}>
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200",
            value === t.id
              ? "bg-gradient-to-b from-brand-500/30 to-brand-700/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.15)] ring-1 ring-brand-400/35"
              : "text-ink-400 hover:text-white"
          )}
        >
          {t.icon}
          {t.label}
          {t.badge !== undefined && (
            <span className={cn("rounded-full px-1.5 text-[11px]", value === t.id ? "bg-brand-500/25 text-brand-200" : "bg-white/10 text-ink-400")}>
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Feedback bits ------------------------------ */

export const Skeleton = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={cn("skeleton h-4 w-full", className)} style={style} />
);

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/14 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/14 text-brand-300 ring-1 ring-brand-400/25 shadow-[0_0_28px_rgba(139,92,246,.25)]">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-400">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <span className="group relative inline-flex">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-coal-900 px-2.5 py-1 text-xs font-medium text-ink-700 opacity-0 shadow-lift ring-1 ring-white/12 transition-opacity duration-150 group-hover:opacity-100">
      {label}
    </span>
  </span>
);

/* ------------------------------- Page chrome ------------------------------- */

export const PageHeader = ({
  eyebrow,
  title,
  desc,
  actions,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  actions?: React.ReactNode;
}) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-300">{eyebrow}</p>}
      <h1 className="font-display text-[26px] font-bold leading-tight text-white sm:text-3xl">{title}</h1>
      {desc && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-400">{desc}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatCard = ({
  icon,
  label,
  value,
  sub,
  tone = "brand",
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "brand" | "emerald" | "amber" | "sky";
  loading?: boolean;
}) => {
  const tones = {
    brand: "bg-brand-500/14 text-brand-300 ring-brand-400/25",
    emerald: "bg-emerald-400/12 text-emerald-300 ring-emerald-400/25",
    amber: "bg-amber-400/12 text-amber-300 ring-amber-400/25",
    sky: "bg-sky-400/12 text-sky-300 ring-sky-400/25",
  };
  return (
    <Card className="card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-ink-400">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1 font-display text-[28px] font-bold leading-none text-white">{value}</p>
          )}
          {sub && <p className="mt-2 text-xs font-medium text-ink-400">{sub}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 shadow-[0_0_20px_rgba(139,92,246,.12)]", tones[tone])}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

/* ------------------------------- Score visuals ----------------------------- */

export function ScoreRing({
  value,
  size = 132,
  stroke = 11,
  suffix = "%",
  caption,
}: {
  value: number;
  size?: number;
  stroke?: number;
  suffix?: string;
  caption?: string;
}) {
  const [offset, setOffset] = useState(1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  useEffect(() => {
    const t = setTimeout(() => setOffset(1 - value / 100), 60);
    return () => clearTimeout(t);
  }, [value]);
  const color = value >= 75 ? "#f97316" : value >= 55 ? "#fbbf24" : "#fb7185";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)", filter: `drop-shadow(0 0 10px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold leading-none text-white" style={{ fontSize: size / 4.2 }}>
          {value}
          <span className="text-[0.55em] text-ink-400">{suffix}</span>
        </span>
        {caption && <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{caption}</span>}
      </div>
    </div>
  );
}

export const Bar = ({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: "brand" | "emerald" | "amber" | "rose" | "sky";
  className?: string;
}) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.min(100, Math.max(0, value))), 80);
    return () => clearTimeout(t);
  }, [value]);
  const tones = {
    brand: "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 shadow-[0_0_12px_rgba(249,115,22,.5)]",
    emerald: "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,.4)]",
    amber: "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,.4)]",
    rose: "bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,.4)]",
    sky: "bg-gradient-to-r from-sky-500 to-sky-400 shadow-[0_0_10px_rgba(14,165,233,.4)]",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/8 ring-1 ring-white/8", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", tones[tone])}
        style={{ width: `${w}%` }}
      />
    </div>
  );
};

export const Stepper = ({ steps, current }: { steps: string[]; current: number }) => (
  <div className="flex items-center gap-0">
    {steps.map((s, i) => (
      <React.Fragment key={s}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
              i < current && "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,.5)]",
              i === current && "bg-gradient-to-r from-orange-500 to-purple-600 text-white ring-4 ring-orange-500/20 shadow-[0_0_16px_rgba(249,115,22,.55)]",
              i > current && "bg-white/8 text-ink-300 ring-1 ring-white/12"
            )}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span
            className={cn(
              "hidden text-[13px] font-semibold sm:block",
              i === current ? "text-white" : "text-ink-400"
            )}
          >
            {s}
          </span>
        </div>
        {i < steps.length - 1 && (
          <span className={cn("mx-3 h-px flex-1 sm:w-10 sm:flex-none", i < current ? "bg-emerald-400/60" : "bg-white/12")} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ---------------------------------- Logo ---------------------------------- */

export const Logo = ({ light = true, small = false, showTagline = false }: { light?: boolean; small?: boolean; showTagline?: boolean }) => (
  <span className="inline-flex items-center gap-2.5">
    <img
      src="/logo.png"
      alt="JOB ASAP Logo"
      className={cn(
        "rounded-xl object-cover shadow-[0_4px_16px_rgba(249,115,22,0.3)] ring-1 ring-white/20 transition-transform duration-300 hover:scale-105",
        small ? "h-8 w-8" : "h-9 w-9"
      )}
    />
    <span className="flex flex-col">
      <span className={cn("font-display font-black leading-tight tracking-tight flex items-center", small ? "text-[15px]" : "text-[17px]", "text-white")}>
        JOB<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 ml-1">ASAP</span>
        <span className="ml-1.5 rounded-md bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-300 ring-1 ring-orange-400/30">AI</span>
      </span>
      {showTagline && (
        <span className="text-[9px] font-bold tracking-widest text-ink-400 uppercase -mt-0.5">
          Find it · Apply it · Get it
        </span>
      )}
    </span>
  </span>
);

export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded border border-white/14 bg-white/6 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink-400">
    {children}
  </kbd>
);
