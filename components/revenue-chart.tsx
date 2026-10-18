"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyPoint } from "@/lib/types";
import { COLORS, formatAxisCurrency, formatMonth } from "@/lib/utils";
import { ChartPanel, NbTooltip } from "./nb-ui";

export function RevenueChart({ data }: { data: MonthlyPoint[] }) {
  const rows = data.map((d) => ({ ...d, label: formatMonth(d.month) }));
  const dot = (color: string) => ({ r: 4, fill: color, stroke: COLORS.ink, strokeWidth: 2 });

  return (
    <ChartPanel title="Monthly Revenue and Profit" subtitle="Per calendar month" isEmpty={data.length === 0} className="lg:col-span-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#12121226" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 700 }} stroke={COLORS.ink} tickLine={false} minTickGap={12} />
          <YAxis tickFormatter={formatAxisCurrency} tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 700 }} stroke={COLORS.ink} tickLine={false} width={56} />
          <Tooltip content={<NbTooltip />} cursor={{ stroke: COLORS.ink, strokeWidth: 2 }} />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, color: COLORS.ink }} />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.blue} strokeWidth={3} dot={dot(COLORS.blue)} activeDot={{ ...dot(COLORS.blue), r: 6 }} />
          <Line type="monotone" dataKey="profit" name="Profit" stroke={COLORS.pink} strokeWidth={3} dot={dot(COLORS.pink)} activeDot={{ ...dot(COLORS.pink), r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
