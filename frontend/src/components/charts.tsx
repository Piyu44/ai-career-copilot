import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid var(--color-ink-100)",
  boxShadow: "0 12px 28px -14px rgba(20,21,46,.25)",
  fontSize: 12,
  fontFamily: "var(--font-sans)",
};

export function TrendArea({
  data,
  color = "var(--color-brand-600)",
  height = 220,
  name = "Score",
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  name?: string;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-ink-100)" strokeDasharray="4 6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--color-ink-200)" }} />
          <Area
            type="monotone"
            dataKey="value"
            name={name}
            stroke={color}
            strokeWidth={2.5}
            fill="url(#trendFill)"
            dot={{ r: 3.5, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const BAR_COLORS = ["#7437d4", "#8b57e3", "#a67dee", "#d97706", "#0ea5e9", "#10b981"];

export function CategoryBars({
  data,
  height = 240,
}: {
  data: { name: string; score: number }[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-ink-100)" strokeDasharray="4 6" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            tick={{ fontSize: 12, fill: "var(--color-ink-600)", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(139,87,227,.06)" }} />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EvalRadar({
  data,
  height = 260,
}: {
  data: { metric: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--color-ink-200)" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11.5, fill: "var(--color-ink-500)", fontWeight: 600 }} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="var(--color-brand-600)" fill="var(--color-brand-500)" fillOpacity={0.32} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
