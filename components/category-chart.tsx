"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryPoint } from "@/lib/types";
import { CHART_PALETTE, COLORS, formatAxisCurrency } from "@/lib/utils";
import { ChartPanel, NbTooltip } from "./nb-ui";

export function CategoryProfitChart({ data }: { data: CategoryPoint[] }) {
  return (
    <ChartPanel title="Profit by Category" subtitle="Negative bars are losses" isEmpty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#12121226" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 700 }} stroke={COLORS.ink} tickLine={false} />
          <YAxis tickFormatter={formatAxisCurrency} tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 700 }} stroke={COLORS.ink} tickLine={false} width={56} />
          <ReferenceLine y={0} stroke={COLORS.ink} strokeWidth={2} />
          <Tooltip content={<NbTooltip />} cursor={{ fill: "#12121214" }} />
          <Bar dataKey="profit" name="Profit" stroke={COLORS.ink} strokeWidth={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[(i + 1) % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

export function CategoryShareChart({ data }: { data: CategoryPoint[] }) {
  return (
    <ChartPanel title="Revenue Share by Category" isEmpty={data.length === 0} bodyClassName="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="revenue" nameKey="category" innerRadius="50%" outerRadius="80%" stroke={COLORS.ink} strokeWidth={3} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<NbTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, color: COLORS.ink }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
