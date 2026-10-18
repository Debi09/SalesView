"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SaleRecord } from "@/lib/types";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { ChartPanel } from "./nb-ui";

const PAGE_SIZE = 10;

export function SalesTable({ records }: { records: SaleRecord[] }) {
  const [page, setPage] = useState(0);
  const sorted = useMemo(
    () => [...records].sort((a, b) => b.order_date.localeCompare(a.order_date) || a.order_id.localeCompare(b.order_id)),
    [records],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  // Go back to page 1 whenever the filtered data changes.
  useEffect(() => setPage(0), [records]);

  const rows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const from = sorted.length ? page * PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * PAGE_SIZE, sorted.length);

  return (
    <ChartPanel title="Sales Table" subtitle="Newest orders first" isEmpty={records.length === 0} bodyClassName="" className="lg:col-span-2">
      <div className="overflow-x-auto rounded-md border-[3px] border-ink">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-nb-yellow">
            <tr className="border-b-[3px] border-ink">
              {["Date", "Order", "Region", "Category", "Product", "Qty", "Sales", "Profit"].map((h, i) => (
                <th key={h} className={cn("nb-label whitespace-nowrap px-3 py-2", i >= 5 && "text-right")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.order_id}-${i}`} className="border-b-2 border-ink/20 font-bold last:border-b-0 odd:bg-cream/60">
                <td className="whitespace-nowrap px-3 py-2">{formatDate(r.order_date)}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.order_id}</td>
                <td className="px-3 py-2">{r.region}</td>
                <td className="px-3 py-2">{r.category}</td>
                <td className="px-3 py-2">{r.product_name}</td>
                <td className="px-3 py-2 text-right">{formatNumber(r.quantity)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(r.sales)}</td>
                <td className="px-3 py-2 text-right">
                  <span className={cn("inline-block rounded-sm px-1.5", r.profit < 0 && "border-2 border-ink bg-nb-pink")}>
                    {formatCurrency(r.profit)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold">
          Showing {from}–{to} of {formatNumber(sorted.length)}
        </p>
        <div className="flex items-center gap-3">
          <button type="button" className="nb-btn bg-white px-3 py-1.5" onClick={() => setPage((p) => p - 1)} disabled={page === 0} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-xs font-black uppercase">
            Page {page + 1} / {pages}
          </span>
          <button type="button" className="nb-btn bg-white px-3 py-1.5" onClick={() => setPage((p) => p + 1)} disabled={page >= pages - 1} aria-label="Next page">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </ChartPanel>
  );
}
