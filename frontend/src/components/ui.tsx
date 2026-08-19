import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "../utils";
import { useBodyLock } from "../hooks";

/* --------------------------------- Button --------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "outline";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-[0_8px_20px_-8px_rgba(98,39,189,.55)]",
  secondary: "bg-white text-ink-800 ring-1 ring-ink-200 hover:ring-brand-300 hover:text-brand-800",
  ghost: "text-ink-600 hover:bg-ink-100/70 hover:text-ink-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  outline: "text-brand-700 ring-1 ring-brand-300 hover:bg-brand-50",
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
  <div className={cn("rounded-xl bg-white ring-1 ring-ink-100 shadow-card", className)} {...rest}>
    {children}
  </div>
);

/* --------------------------------- Badges --------------------------------- */

const badgeTones: Record<string, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  ink: "bg-ink-100 text-ink-600 ring-ink-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
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
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
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
      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium ring-1 transition-transform hover:scale-[1.04]",
      state === "match" && "bg-emerald-50 text-emerald-800 ring-emerald-200",
      state === "missing" && "bg-rose-50 text-rose-700 ring-rose-200",
      state === "neutral" && "bg-ink-50 text-ink-600 ring-ink-200",
      className
    )}
  >
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        state === "match" ? "bg-emerald-500" : state === "missing" ? "bg-rose-500" : "bg-ink-300"
      )}
    />
    {label}
  </span>
);

/* --------------------------------- Inputs --------------------------------- */

export const inputCls =
  "w-full rounded-lg bg-white px-3.5 text-sm text-ink-900 ring-1 ring-ink-200 placeholder:text-ink-300 transition-shadow focus:ring-2 focus:ring-brand-500 focus:outline-none";

export const Input = ({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(inputCls, "h-10", className)} {...rest} />
);

export const Textarea = ({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(inputCls, "py-2.5 leading-relaxed", className)} {...rest} />
);

export const Select = ({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(inputCls, "h-10 appearance-none pr-8 bg-[right_0.6rem_center] bg-no-repeat", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23585a83' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
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
    <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-ink-700">
      {label}
      {hint && <span className="text-xs font-normal text-ink-400">{hint}</span>}
    </span>
    {children}
    {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
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
    className="flex items-center gap-2.5 text-sm font-medium text-ink-700"
    role="switch"
    aria-checked={on}
  >
    <span
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors duration-200",
        on ? "bg-brand-600" : "bg-ink-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
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
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-[3px]" onClick={onClose} />
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-t-2xl bg-white shadow-lift ring-1 ring-ink-100 animate-pop-in sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        )}
        role="dialog"
        aria-modal
      >
        {title && (
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
            <button onClick={onClose} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Close">
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
    <div className={cn("inline-flex flex-wrap items-center gap-1 rounded-lg bg-ink-100/80 p-1", className)}>
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200",
            value === t.id
              ? "bg-white text-brand-700 shadow-sm ring-1 ring-ink-100"
              : "text-ink-500 hover:text-ink-800"
          )}
        >
          {t.icon}
          {t.label}
          {t.badge !== undefined && (
            <span className={cn("rounded-full px-1.5 text-[11px]", value === t.id ? "bg-brand-50 text-brand-700" : "bg-ink-200 text-ink-600")}>
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const Tip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <span className="group relative inline-flex">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
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
      {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>}
      <h1 className="font-display text-[26px] font-bold leading-tight text-ink-900 sm:text-3xl">{title}</h1>
      {desc && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">{desc}</p>}
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
    brand: "bg-brand-50 text-brand-600 ring-brand-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    sky: "bg-sky-50 text-sky-600 ring-sky-100",
  };
  return (
    <Card className="card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-ink-400">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1 font-display text-[28px] font-bold leading-none text-ink-900">{value}</p>
          )}
          {sub && <p className="mt-2 text-xs font-medium text-ink-400">{sub}</p>}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1", tones[tone])}>
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
  const color = value >= 75 ? "var(--color-brand-600)" : value >= 55 ? "#d97706" : "#e11d48";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-ink-100)" strokeWidth={stroke} />
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
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold leading-none text-ink-900" style={{ fontSize: size / 4.2 }}>
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
    brand: "bg-brand-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}>
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
              i < current && "bg-emerald-500 text-white",
              i === current && "bg-brand-700 text-white ring-4 ring-brand-100",
              i > current && "bg-ink-100 text-ink-400"
            )}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span
            className={cn(
              "hidden text-[13px] font-semibold sm:block",
              i === current ? "text-ink-900" : "text-ink-400"
            )}
          >
            {s}
          </span>
        </div>
        {i < steps.length - 1 && (
          <span className={cn("mx-3 h-px flex-1 sm:w-10 sm:flex-none", i < current ? "bg-emerald-400" : "bg-ink-200")} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ---------------------------------- Logo ---------------------------------- */

export const Logo = ({ light = false, small = false }: { light?: boolean; small?: boolean }) => (
  <span className="inline-flex items-center gap-2.5">
    <span className={cn("flex items-center justify-center rounded-xl bg-brand-700 shadow-[0_6px_16px_-6px_rgba(98,39,189,.6)]", small ? "h-8 w-8" : "h-9 w-9")}>
      <svg viewBox="0 0 24 24" fill="none" className={small ? "h-4.5 w-4.5" : "h-5 w-5"}>
        <path d="M13 2 5 14h5.5L11 22l8-12h-5.5L13 2Z" fill="#fff" />
      </svg>
    </span>
    <span className={cn("font-display font-bold leading-tight", small ? "text-[15px]" : "text-[17px]", light ? "text-white" : "text-ink-900")}>
      AI Career <span className="text-brand-600">Copilot</span>
    </span>
  </span>
);

export const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink-500">
    {children}
  </kbd>
);
