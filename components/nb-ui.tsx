import type { ReactNode } from "react";
import { cn, formatCurrency } from "@/lib/utils";

/* Small neo-brutalist primitives shared by charts, table and panels. */

type DecorKind = "star" | "square" | "circle" | "arrow";

/** Non-interactive corner decoration. Position it with className (e.g. "-top-4 -right-4"). */
export function Decor({
  kind,
  className,
  color = "#FFE500",
}: {
  kind: DecorKind;
  className?: string;
  color?: string;
}) {
  const base = cn("pointer-events-none absolute select-none", className);
  if (kind === "square")
    return <span aria-hidden="true" className={cn(base, "block h-4 w-4 border-[3px] border-ink")} style={{ background: color }} />;
  if (kind === "circle")
    return <span aria-hidden="true" className={cn(base, "block h-5 w-5 rounded-full border-[3px] border-ink")} style={{ background: color }} />;
  if (kind === "arrow")
    return (
      <svg aria-hidden="true" className={cn(base, "h-8 w-8")} viewBox="0 0 32 32" fill="none">
        <path d="M4 16h22M17 7l9 9-9 9" stroke="#121212" strokeWidth="4" strokeLinecap="square" />
      </svg>
    );
  return (
    <svg aria-hidden="true" className={cn(base, "h-10 w-10")} viewBox="0 0 40 40">
      <polygon
        points="20,1 24,13 36,8 28,19 39,24 27,26 30,38 20,30 10,38 13,26 1,24 12,19 4,8 16,13"
        fill={color}
        stroke="#121212"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyState({ message = "No data for these filters" }: { message?: string }) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-1 rounded-md border-[3px] border-dashed border-ink bg-cream p-6 text-center">
      <p className="text-sm font-black uppercase">{message}</p>
      <p className="text-xs font-bold">Widen the date range or reset the filters.</p>
    </div>
  );
}

/** White panel with a title, used by every chart and the table. */
export function ChartPanel({
  title,
  subtitle,
  isEmpty = false,
  bodyClassName = "h-72",
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  isEmpty?: boolean;
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("nb-card nb-card-hover relative p-4 sm:p-5", className)}>
      <header className="mb-4">
        <h3 className="text-base font-black uppercase leading-tight">{title}</h3>
        {subtitle && <p className="nb-label mt-1 text-ink/70">{subtitle}</p>}
      </header>
      <div className={bodyClassName}>{isEmpty ? <EmptyState /> : children}</div>
    </section>
  );
}

interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
}

/** Recharts tooltip: white, black border, bold text, hard shadow. */
export function NbTooltip({
  active,
  payload,
  label,
  money = true,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  money?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const title = label ?? payload[0].name;
  return (
    <div className="rounded-md border-[3px] border-ink bg-white px-3 py-2 text-xs font-bold shadow-nb-sm">
      {title !== undefined && <p className="mb-1 font-black uppercase">{title}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 border-2 border-ink" style={{ background: p.color }} />
          {label !== undefined && <span>{p.name}:</span>}
          <span>{money && typeof p.value === "number" ? formatCurrency(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}
