import type { Analytics, DataQuality, RawRow, SaleRecord } from "./types";
import { computeAnalytics } from "./utils";

// Small seeded PRNG so the demo data is identical on every load.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATALOG = [
  { name: "Ultrabook 14", category: "Technology", sub: "Laptops", price: 1150, margin: 0.16 },
  { name: "Pro Smartphone", category: "Technology", sub: "Phones", price: 640, margin: 0.2 },
  { name: "Wireless Earbuds", category: "Technology", sub: "Accessories", price: 120, margin: 0.34 },
  { name: "USB-C Dock", category: "Technology", sub: "Accessories", price: 85, margin: 0.3 },
  { name: "Ergo Office Chair", category: "Furniture", sub: "Chairs", price: 320, margin: 0.14 },
  { name: "Standing Desk", category: "Furniture", sub: "Tables", price: 540, margin: 0.08 },
  { name: "Oak Bookcase", category: "Furniture", sub: "Bookcases", price: 210, margin: 0.12 },
  { name: "Desk Lamp", category: "Furniture", sub: "Furnishings", price: 45, margin: 0.28 },
  { name: "Copy Paper Case", category: "Office Supplies", sub: "Paper", price: 38, margin: 0.4 },
  { name: "Heavy Duty Binder", category: "Office Supplies", sub: "Binders", price: 12, margin: 0.42 },
  { name: "Filing Cabinet", category: "Office Supplies", sub: "Storage", price: 160, margin: 0.18 },
  { name: "Marker Set", category: "Office Supplies", sub: "Art", price: 18, margin: 0.38 },
] as const;

// Weighted by repetition: West and East sell the most.
const REGIONS = [
  "West", "West", "West", "East", "East", "East", "Central", "Central", "South", "North",
];

const round2 = (n: number) => Math.round(n * 100) / 100;

function buildRows(): RawRow[] {
  const rand = mulberry32(2026);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const start = Date.UTC(2025, 9, 1); // 1 Oct 2025 -> 12 full months
  const rows: RawRow[] = [];
  let orderNo = 1000;

  for (let i = 0; i < 240; i++) {
    if (i % 5 !== 4) orderNo++; // every 5th line shares the previous order id
    const p = pick(CATALOG);
    const day = Math.floor(Math.pow(rand(), 0.85) * 365); // slight growth over time
    const qty = 1 + Math.floor(rand() * 5);
    const discount = pick([0, 0, 0, 0, 0.1, 0.15, 0.2, 0.3]);
    const sales = round2(p.price * qty * (1 - discount));
    const profit = round2(sales * (p.margin - discount * 0.8 + (rand() - 0.5) * 0.12));

    rows.push({
      order_id: `ORD-${orderNo}`,
      order_date: new Date(start + day * 86_400_000).toISOString().slice(0, 10),
      region: pick(REGIONS),
      category: p.category,
      sub_category: p.sub,
      product_name: p.name,
      sales,
      quantity: qty,
      discount,
      profit,
    });
  }

  // A few deliberately messy rows so the data-quality panel has something to report.
  rows.push({ ...rows[0] }); // exact duplicate
  rows.push({ ...rows[10], order_id: "ORD-9001", category: "" }); // missing category
  rows.push({ ...rows[20], order_id: "ORD-9002", sales: -49.9 }); // invalid sales
  rows.push({ ...rows[30], order_id: "ORD-9003", profit: null }); // missing number
  return rows;
}

export const DEMO_ROWS: RawRow[] = buildRows();

/**
 * Fallback used only when the Python API is unreachable (e.g. you started
 * just `npm run dev`). Same cleaning rules as api/index.py, kept deliberately small.
 */
export function analyzeDemoInBrowser(rows: RawRow[] = DEMO_ROWS): Analytics {
  const seen = new Set<string>();
  const records: SaleRecord[] = [];
  let duplicates = 0;
  let invalid = 0;
  let missing = 0;

  for (const row of rows) {
    const key = JSON.stringify(row);
    if (seen.has(key)) { duplicates++; continue; }
    seen.add(key);

    const text = (v: RawRow[string]) => {
      const s = v === null || v === undefined ? "" : String(v).trim();
      if (!s) missing++;
      return s || "Unknown";
    };
    const num = (v: RawRow[string]) => {
      const n = v === null || v === "" ? NaN : Number(v);
      if (Number.isNaN(n)) { missing++; return 0; }
      return n;
    };

    const record: SaleRecord = {
      order_id: String(row.order_id),
      order_date: String(row.order_date),
      region: text(row.region),
      category: text(row.category),
      sub_category: text(row.sub_category),
      product_name: text(row.product_name),
      sales: num(row.sales),
      quantity: Math.round(num(row.quantity)),
      discount: num(row.discount),
      profit: num(row.profit),
    };
    if (record.sales < 0) { invalid++; continue; }
    records.push(record);
  }

  const quality: DataQuality = {
    source_rows: rows.length,
    clean_rows: records.length,
    duplicates_removed: duplicates,
    missing_values_handled: missing,
    invalid_rows_removed: invalid,
  };
  return computeAnalytics(records, quality);
}
