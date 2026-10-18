"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { Filters } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarFiltersProps {
  regions: string[];
  categories: string[];
  minDate: string;
  maxDate: string;
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ChipGroup({
  label,
  options,
  selected,
  accent,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  accent: string;
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="nb-label mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-sm border-2 border-ink px-2.5 py-1 text-xs font-black uppercase transition-all duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-nb-blue/40",
                on ? cn(accent, "shadow-nb-sm") : "bg-white hover:bg-cream",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs font-bold text-ink/60">{selected.length ? `${selected.length} selected` : "All included"}</p>
    </fieldset>
  );
}

export function SidebarFilters({
  regions,
  categories,
  minDate,
  maxDate,
  filters,
  onChange,
  onReset,
}: SidebarFiltersProps) {
  // Mobile: filters collapse behind a button. On lg+ they are always visible.
  const [open, setOpen] = useState(false);
  const activeCount =
    Number(Boolean(filters.start || filters.end)) +
    Number(filters.regions.length > 0) +
    Number(filters.categories.length > 0);

  return (
    <aside className="nb-card h-fit p-4 lg:sticky lg:top-6 lg:w-[260px] lg:shrink-0">
      <button
        type="button"
        className="flex w-full items-center justify-between lg:cursor-default"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filters-body"
      >
        <span className="flex items-center gap-2 text-base font-black uppercase">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-sm border-2 border-ink bg-nb-pink px-1.5 text-xs">{activeCount}</span>
          )}
        </span>
        <ChevronDown className={cn("h-5 w-5 transition-transform lg:hidden", open && "rotate-180")} aria-hidden="true" />
      </button>

      <div id="filters-body" className={cn("mt-4 space-y-5", open ? "block" : "hidden", "lg:block")}>
        <fieldset className="space-y-2">
          <legend className="nb-label mb-2">Date range</legend>
          <label className="block text-xs font-bold">
            From
            <input
              type="date"
              className="nb-input mt-1"
              value={filters.start}
              min={minDate}
              max={filters.end || maxDate}
              onChange={(e) => onChange({ ...filters, start: e.target.value })}
            />
          </label>
          <label className="block text-xs font-bold">
            To
            <input
              type="date"
              className="nb-input mt-1"
              value={filters.end}
              min={filters.start || minDate}
              max={maxDate}
              onChange={(e) => onChange({ ...filters, end: e.target.value })}
            />
          </label>
        </fieldset>

        <ChipGroup
          label="Region"
          options={regions}
          selected={filters.regions}
          accent="bg-nb-yellow"
          onToggle={(v) => onChange({ ...filters, regions: toggle(filters.regions, v) })}
        />
        <ChipGroup
          label="Category"
          options={categories}
          selected={filters.categories}
          accent="bg-nb-lime"
          onToggle={(v) => onChange({ ...filters, categories: toggle(filters.categories, v) })}
        />

        <button type="button" className="nb-btn w-full bg-white" onClick={onReset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset filters
        </button>
      </div>
    </aside>
  );
}
