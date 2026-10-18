"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, Percent, Receipt, ShoppingCart, TrendingUp } from "lucide-react";
import { analyzeCsv, analyzeDemo, toUploadError } from "@/lib/api";
import { DEMO_ROWS, analyzeDemoInBrowser } from "@/lib/mock-data";
import type { Analytics, Filters, UploadError } from "@/lib/types";
import {
  EMPTY_FILTERS,
  computeAnalytics,
  filterRecords,
  formatCurrency,
  formatDate,
  formatKpiCurrency,
  formatNumber,
  formatPercent,
  hasActiveFilters,
  monthlyTrend,
} from "@/lib/utils";
import { CategoryProfitChart, CategoryShareChart } from "@/components/category-chart";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { DataQualityPanel, DataUpload } from "@/components/data-upload";
import { KpiCard } from "@/components/kpi-card";
import { RegionalChart } from "@/components/regional-chart";
import { RevenueChart } from "@/components/revenue-chart";
import { SalesTable } from "@/components/sales-table";
import { SidebarFilters } from "@/components/sidebar-filters";
import { TopProductsChart } from "@/components/top-products-chart";

const unique = (values: string[]) => [...new Set(values)].sort();

export default function Page() {
  const [data, setData] = useState<Analytics | null>(null);
  const [sourceName, setSourceName] = useState("Demo data");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadDemo = useCallback(async () => {
    setLoading(true);
    setUploadError(null);
    setNotice(null);
    try {
      setData(await analyzeDemo(DEMO_ROWS));
    } catch {
      // API not running (only `npm run dev`): compute the demo in the browser instead.
      setData(analyzeDemoInBrowser());
      setNotice("The Python API is not reachable, so the demo was calculated in your browser. Start it with: npm run dev:api");
    } finally {
      setLoading(false);
    }
    setSourceName("Demo data");
    setFilters(EMPTY_FILTERS);
  }, []);

  useEffect(() => {
    loadDemo();
  }, [loadDemo]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      setData(await analyzeCsv(file));
      setSourceName(file.name);
      setFilters(EMPTY_FILTERS);
      setNotice(null);
      setUploadOpen(false);
    } catch (e) {
      setUploadError(toUploadError(e));
    } finally {
      setUploading(false);
    }
  };

  const records = useMemo(() => data?.records ?? [], [data]);
  const regions = useMemo(() => unique(records.map((r) => r.region)), [records]);
  const categories = useMemo(() => unique(records.map((r) => r.category)), [records]);
  const [minDate, maxDate] = useMemo(() => {
    const dates = records.map((r) => r.order_date).sort();
    return [dates[0] ?? "", dates[dates.length - 1] ?? ""];
  }, [records]);

  // Unfiltered: use the backend's numbers. Filtered: re-aggregate the returned rows.
  const view = useMemo(() => {
    if (!data) return null;
    if (!hasActiveFilters(filters)) return data;
    return computeAnalytics(filterRecords(data.records, filters), data.data_quality);
  }, [data, filters]);

  const dateRange = minDate
    ? `${formatDate(filters.start || minDate)} – ${formatDate(filters.end || maxDate)}`
    : "No data loaded";

  const k = view?.kpis;
  const m = view?.monthly ?? [];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6">
      <DashboardHeader
        dateRange={dateRange}
        sourceName={sourceName}
        loading={loading || uploading}
        uploadOpen={uploadOpen}
        onLoadDemo={loadDemo}
        onToggleUpload={() => setUploadOpen((o) => !o)}
      />

      <DataUpload
        open={uploadOpen || uploadError !== null}
        uploading={uploading}
        error={uploadError}
        onUpload={handleUpload}
        onClose={() => {
          setUploadOpen(false);
          setUploadError(null);
        }}
      />

      {notice && (
        <p role="status" className="rounded-md border-[3px] border-ink bg-nb-orange p-3 text-sm font-bold">
          {notice}
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <SidebarFilters
          regions={regions}
          categories={categories}
          minDate={minDate}
          maxDate={maxDate}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />

        <main className="min-w-0 flex-1 space-y-6">
          {!view || !k ? (
            <DashboardSkeleton />
          ) : (
            <>
              <DataQualityPanel quality={view.data_quality} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <KpiCard label="Total Revenue" value={formatKpiCurrency(k.total_revenue)} icon={DollarSign} accent="bg-nb-yellow" trend={monthlyTrend(m, "revenue")} decor="square" />
                <KpiCard label="Total Profit" value={formatKpiCurrency(k.total_profit)} icon={TrendingUp} accent="bg-nb-lime" trend={monthlyTrend(m, "profit")} />
                <KpiCard label="Profit Margin" value={formatPercent(k.profit_margin)} icon={Percent} accent="bg-nb-pink" trend={monthlyTrend(m, "margin")} decor="circle" />
                <KpiCard label="Total Orders" value={formatNumber(k.total_orders)} icon={ShoppingCart} accent="bg-nb-blue" trend={monthlyTrend(m, "orders")} />
                <KpiCard label="Avg. Order Value" value={formatCurrency(k.average_order_value)} icon={Receipt} accent="bg-nb-orange" trend={monthlyTrend(m, "aov")} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <RevenueChart data={view.monthly} />
                <RegionalChart data={view.regions} />
                <CategoryProfitChart data={view.categories} />
                <CategoryShareChart data={view.categories} />
                <TopProductsChart data={view.top_products} />
                <SalesTable records={view.records} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
