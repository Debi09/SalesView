import { BarChart3, CalendarRange, Upload, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Decor } from "./nb-ui";

interface DashboardHeaderProps {
  dateRange: string;
  sourceName: string;
  loading: boolean;
  uploadOpen: boolean;
  onLoadDemo: () => void;
  onToggleUpload: () => void;
}

export function DashboardHeader({
  dateRange,
  sourceName,
  loading,
  uploadOpen,
  onLoadDemo,
  onToggleUpload,
}: DashboardHeaderProps) {
  return (
    <header className="nb-card relative bg-white p-5 sm:p-7">
      <Decor kind="star" className="-right-4 -top-5" />
      <Decor kind="square" className="-bottom-3 left-10" color="#4263FF" />
      <Decor kind="circle" className="-left-3 -top-3" color="#B9F227" />

      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-black uppercase">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm border-[3px] border-ink bg-ink text-nb-yellow">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </span>
          SalesView
        </span>
        <span className="inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-nb-lime px-2 py-1 text-xs font-black uppercase">
          <span className="h-2 w-2 rounded-full bg-ink motion-safe:animate-pulse" aria-hidden="true" />
          Live Analytics
        </span>
      </div>

      <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
        Sales Performance
      </h1>
      <p className="mt-3 text-base font-bold sm:text-lg">Revenue, profit and growth at a glance.</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className={cn("nb-btn bg-nb-yellow")} onClick={onLoadDemo} disabled={loading}>
          <Zap className="h-4 w-4" aria-hidden="true" />
          Load Demo Data
        </button>
        <button
          type="button"
          className="nb-btn bg-nb-blue text-white"
          onClick={onToggleUpload}
          aria-expanded={uploadOpen}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload CSV
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
        <span className="inline-flex items-center gap-2">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          {dateRange}
        </span>
        <span className="text-ink/70">Source: {sourceName}</span>
      </div>
    </header>
  );
}
