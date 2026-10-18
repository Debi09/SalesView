import type {
  Analytics,
  DataQuality,
  Filters,
  MonthlyPoint,
  SaleRecord,
} from "./types";

export const COLORS = {
  cream: "#F8F4E8",
  ink: "#121212",
  yellow: "#FFE500",
  blue: "#4263FF",
  pink: "#FF5CA8",
  lime: "#B9F227",
  orange: "#FF7A00",
} as const;

export const CHART_PALETTE = [
  COLORS.blue,
  COLORS.pink,
  COLORS.yellow,
  COLORS.lime,
  COLORS.orange,
];

export const EXPECTED_COLUMNS = [
  "order_id",
  "order_date",
  "region",
  "category",
  "sub_category",
  "product_name",
  "sales",
  "quantity",
  "discount",
  "profit",
] as const;

export const cn = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/* ---------- formatting ---------- */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const formatCurrency = (n: number) => usd.format(n);
export const formatNumber = (n: number) => int.format(n);
export const formatPercent = (n: number) => `${n.toFixed(1)}%`;

/** KPI-sized currency: $98,432 or $1.25M so big numbers fit the card. */
export function formatKpiCurrency(n: number) {
  return Math.abs(n) >= 1_000_000
    ? `${n < 0 ? "-" : ""}$${(Math.abs(n) / 1_000_000).toFixed(2)}M`
    : usd.format(n);
}

/** Short axis label: 12500 -> $12.5k */
export function formatAxisCurrency(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${sign}$${abs}`;
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export const formatMonth = (yyyyMm: string) =>
  new Date(`${yyyyMm}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });

export const truncate = (s: string, max: number) =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;

/* ---------- client-side filtering ---------- */

export const EMPTY_FILTERS: Filters = {
  start: "",
  end: "",
  regions: [],
  categories: [],
};

export const hasActiveFilters = (f: Filters) =>
  Boolean(f.start || f.end || f.regions.length || f.categories.length);

export function filterRecords(records: SaleRecord[], f: Filters): SaleRecord[] {
  return records.filter(
    (r) =>
      (!f.start || r.order_date >= f.start) &&
      (!f.end || r.order_date <= f.end) &&
      (!f.regions.length || f.regions.includes(r.region)) &&
      (!f.categories.length || f.categories.includes(r.category)),
  );
}

/* ---------- analytics ---------- */

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Mirrors build_analytics() in api/index.py. The backend does the heavy
 * lifting for uploads; this only re-aggregates when filters change.
 */
export function computeAnalytics(
  records: SaleRecord[],
  quality: DataQuality,
): Analytics {
  let revenue = 0;
  let profit = 0;
  const orderIds = new Set<string>();
  const monthly = new Map<string, { revenue: number; profit: number; orders: Set<string> }>();
  const regions = new Map<string, number>();
  const categories = new Map<string, { revenue: number; profit: number }>();
  const products = new Map<string, number>();

  for (const r of records) {
    revenue += r.sales;
    profit += r.profit;
    orderIds.add(r.order_id);

    const month = r.order_date.slice(0, 7);
    const m = monthly.get(month) ?? { revenue: 0, profit: 0, orders: new Set<string>() };
    m.revenue += r.sales;
    m.profit += r.profit;
    m.orders.add(r.order_id);
    monthly.set(month, m);

    regions.set(r.region, (regions.get(r.region) ?? 0) + r.sales);

    const c = categories.get(r.category) ?? { revenue: 0, profit: 0 };
    c.revenue += r.sales;
    c.profit += r.profit;
    categories.set(r.category, c);

    products.set(r.product_name, (products.get(r.product_name) ?? 0) + r.sales);
  }

  const orders = orderIds.size;
  return {
    kpis: {
      total_revenue: round2(revenue),
      total_profit: round2(profit),
      profit_margin: revenue ? round2((profit / revenue) * 100) : 0,
      total_orders: orders,
      average_order_value: orders ? round2(revenue / orders) : 0,
    },
    monthly: [...monthly.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        revenue: round2(v.revenue),
        profit: round2(v.profit),
        orders: v.orders.size,
      })),
    regions: [...regions.entries()]
      .map(([region, rev]) => ({ region, revenue: round2(rev) }))
      .sort((a, b) => b.revenue - a.revenue),
    categories: [...categories.entries()]
      .map(([category, v]) => ({
        category,
        revenue: round2(v.revenue),
        profit: round2(v.profit),
      }))
      .sort((a, b) => b.revenue - a.revenue),
    top_products: [...products.entries()]
      .map(([product_name, rev]) => ({ product_name, revenue: round2(rev) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    data_quality: quality,
    records,
  };
}

export type TrendMetric = "revenue" | "profit" | "margin" | "orders" | "aov";

/** % change of the latest month vs the month before it (null if < 2 months). */
export function monthlyTrend(monthly: MonthlyPoint[], metric: TrendMetric): number | null {
  if (monthly.length < 2) return null;
  const value = (m: MonthlyPoint) => {
    switch (metric) {
      case "revenue": return m.revenue;
      case "profit": return m.profit;
      case "orders": return m.orders;
      case "margin": return m.revenue ? m.profit / m.revenue : 0;
      case "aov": return m.orders ? m.revenue / m.orders : 0;
    }
  };
  const last = value(monthly[monthly.length - 1]);
  const prev = value(monthly[monthly.length - 2]);
  return prev === 0 ? null : ((last - prev) / Math.abs(prev)) * 100;
}
