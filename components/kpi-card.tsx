import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Decor } from "./nb-ui";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string; // tailwind bg class for the icon tile, e.g. "bg-nb-yellow"
  trend: number | null; // % change vs previous month
  decor?: "square" | "circle";
}

export function KpiCard({ label, value, icon: Icon, accent, trend, decor }: KpiCardProps) {
  const up = (trend ?? 0) >= 0;
  return (
    <div className="nb-card nb-card-hover relative min-w-0 p-4">
      {decor && <Decor kind={decor} className="-right-2 -top-2" color="#FF5CA8" />}
      <div className="flex items-start justify-between gap-2">
        <p className="nb-label">{label}</p>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-[3px] border-ink", accent)}>
          <Icon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 break-words text-3xl font-black leading-none tracking-tight">{value}</p>
      <div className="mt-3 h-6">
        {trend === null ? (
          <span className="text-xs font-bold text-ink/60">Needs 2+ months</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-bold">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-sm border-2 border-ink px-1.5 py-0.5 font-black",
                up ? "bg-nb-lime" : "bg-nb-pink",
              )}
            >
              {up ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
            vs prev. month
          </span>
        )}
      </div>
    </div>
  );
}
