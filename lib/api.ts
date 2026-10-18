import type { Analytics, RawRow, UploadError } from "./types";

// Empty string = same origin (Next.js proxy locally, Vercel rewrites in production).
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  missingColumns: string[];
  constructor(message: string, missingColumns: string[] = []) {
    super(message);
    this.missingColumns = missingColumns;
  }
}

async function request(path: string, init: RequestInit): Promise<Analytics> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    let missing: string[] = [];
    try {
      const { detail } = await res.json();
      if (typeof detail === "string") message = detail;
      else if (detail?.message) {
        message = detail.message;
        missing = detail.missing_columns ?? [];
      }
    } catch {
      /* non-JSON error body: keep the generic message */
    }
    throw new ApiError(message, missing);
  }
  return res.json();
}

export function analyzeCsv(file: File) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/analyze", { method: "POST", body: form });
}

export function analyzeDemo(rows: RawRow[]) {
  return request("/api/demo-analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows }),
  });
}

export function toUploadError(e: unknown): UploadError {
  if (e instanceof ApiError) {
    return { message: e.message, missingColumns: e.missingColumns };
  }
  return {
    message: "Could not reach the analytics API. Check that the backend is running and try again.",
    missingColumns: [],
  };
}
