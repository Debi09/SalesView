"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProductPoint } from "@/lib/types";
import { CHART_PALETTE, COLORS, formatAxisCurrency, truncate } from "@/lib/utils";
import { ChartPanel, NbTooltip } from "./nb-ui";

export function TopProductsChart({ data }: { data: ProductPoint[] }) {
  return (
    <ChartPanel title="Top 10 Products by Revenue" isEmpty={data.length === 0} bodyClassName="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#12121226" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={formatAxisCurrency} tick={{ fill: COLORS.ink, fontSize: 12, fontWeight: 700 }} stroke={COLORS.ink} tickLine={false} />
          <YAxis
            type="category"
            dataKey="product_name"
            width={112}
            interval={0}
            tickFormatter={(v: string) => truncate(v, 16)}
            tick={{ fill: COLORS.ink, fontSize: 11, fontWeight: 700 }}
            stroke={COLORS.ink}
            tickLine={false}
          />
          <Tooltip content={<NbTooltip />} cursor={{ fill: "#12121214" }} />
          <Bar dataKey="revenue" name="Revenue" stroke={COLORS.ink} strokeWidth={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
