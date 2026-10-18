"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RegionPoint } from "@/lib/types";
import { CHART_PALETTE, COLORS, formatAxisCurrency } from "@/lib/utils";
import { ChartPanel, NbTooltip } from "./nb-ui";

export function RegionalChart({ data }: { data: RegionPoint[] }) {
  return (
    <ChartPanel title="Revenue by Region" subtitle="Highest first" isEmpty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#12121226" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="region" tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 700 }} stroke={COLORS.ink} tickLine={false} />
          <YAxis tickFormatter={formatAxisCurrency} tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 700 }} stroke={COLORS.ink} tickLine={false} width={56} />
          <Tooltip content={<NbTooltip />} cursor={{ fill: "#12121214" }} />
          <Bar dataKey="revenue" name="Revenue" stroke={COLORS.ink} strokeWidth={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
