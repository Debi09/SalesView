"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ChevronDown, ShieldCheck, UploadCloud, X } from "lucide-react";
import type { DataQuality, UploadError } from "@/lib/types";
import { EXPECTED_COLUMNS, cn, formatNumber } from "@/lib/utils";

interface DataUploadProps {
  open: boolean;
  uploading: boolean;
  error: UploadError | null;
  onUpload: (file: File) => void;
  onClose: () => void;
}

export function DataUpload({ open, uploading, error, onUpload, onClose }: DataUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) return null;

  const submit = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setLocalError("Only .csv files are supported. Export your sheet as CSV and try again.");
      return;
    }
    setLocalError(null);
    onUpload(file);
  };

  const message = localError ?? error?.message;
  const missing = localError ? [] : (error?.missingColumns ?? []);

  return (
    <section className="nb-card relative bg-white p-5" aria-label="Upload CSV">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black uppercase">Upload a sales CSV</h2>
          <p className="mt-1 text-sm font-bold">It replaces the current dataset. Your file is sent to the analytics API for cleaning.</p>
        </div>
        <button type="button" className="nb-btn bg-white px-2 py-2" onClick={onClose} aria-label="Close upload panel">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <label
        htmlFor="csv-input"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); submit(e.dataTransfer.files[0]); }}
        className={cn(
          "mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-md border-[3px] border-dashed border-ink p-6 text-center transition-colors",
          dragging ? "bg-nb-yellow" : "bg-cream hover:bg-nb-yellow/40",
        )}
      >
        <UploadCloud className="h-8 w-8" aria-hidden="true" />
        <span className="text-sm font-black uppercase">{uploading ? "Analyzing…" : "Drop a .csv here or click to choose"}</span>
        <input
          id="csv-input"
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => { submit(e.target.files?.[0]); e.target.value = ""; }}
        />
      </label>

      {message && (
        <div role="alert" className="mt-4 flex gap-3 rounded-md border-[3px] border-ink bg-nb-pink p-3 text-sm font-bold">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-black">Upload failed</p>
            <p>{message}</p>
            {missing.length > 0 && (
              <p className="mt-1">
                Absent columns: <span className="font-black">{missing.join(", ")}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="nb-label mb-2">Expected columns</p>
        <ul className="flex flex-wrap gap-2">
          {EXPECTED_COLUMNS.map((c) => (
            <li
              key={c}
              className={cn(
                "rounded-sm border-2 border-ink px-2 py-0.5 text-xs font-black",
                missing.includes(c) ? "bg-nb-pink" : "bg-nb-lime",
              )}
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Compact expandable summary of what cleaning did to the dataset. */
export function DataQualityPanel({ quality }: { quality: DataQuality }) {
  const [open, setOpen] = useState(false);
  const stats = [
    { label: "Source rows", value: quality.source_rows },
    { label: "Clean rows", value: quality.clean_rows },
    { label: "Duplicates removed", value: quality.duplicates_removed },
    { label: "Missing values handled", value: quality.missing_values_handled },
    { label: "Invalid rows removed", value: quality.invalid_rows_removed },
  ];

  return (
    <section className="nb-card bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-black uppercase">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          Data quality
          <span className="rounded-sm border-2 border-ink bg-nb-lime px-1.5 text-xs">
            {formatNumber(quality.clean_rows)} of {formatNumber(quality.source_rows)} rows kept
          </span>
        </span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div className="border-t-[3px] border-ink p-4">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-md border-2 border-ink bg-cream p-3">
                <dt className="nb-label">{s.label}</dt>
                <dd className="mt-1 text-2xl font-black">{formatNumber(s.value)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs font-bold text-ink/70">Covers the whole uploaded file, regardless of the filters you have applied.</p>
        </div>
      )}
    </section>
  );
}
