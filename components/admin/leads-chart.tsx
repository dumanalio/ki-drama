"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LeadsPerDay } from "@/lib/queries/admin-dashboard";

// Recharts-Primitive nehmen keine Tailwind-Klassen an, nur echte
// CSS-Werte — das sind exakt dieselben Farben wie --color-line,
// --color-ink-muted, --color-surface-alt und --color-accent aus globals.css.
const COLOR_LINE = "#e3e3ea";
const COLOR_INK_MUTED = "#6e6c85";
const COLOR_SURFACE_ALT = "#efeff2";
const COLOR_ACCENT = "#5b4ee3";

export function LeadsChart({ data }: { data: LeadsPerDay[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke={COLOR_LINE} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: COLOR_INK_MUTED }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: COLOR_INK_MUTED }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: COLOR_SURFACE_ALT }}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${COLOR_LINE}`,
              fontSize: 13,
            }}
            labelFormatter={(label) => label}
            formatter={(value) => [`${value}`, "Leads"]}
          />
          <Bar dataKey="count" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
