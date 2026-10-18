"""SalesView API: FastAPI + Pandas.

Vercel serves this file as a Python function; locally run it with
`npm run dev:api` (uvicorn). All calculation logic lives in the helper
functions below so the endpoints stay tiny.
"""
import io
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

REQUIRED_COLUMNS = [
    "order_id", "order_date", "region", "category", "sub_category",
    "product_name", "sales", "quantity", "discount", "profit",
]
TEXT_COLUMNS = ["order_id", "region", "category", "sub_category", "product_name"]
NUMERIC_COLUMNS = ["sales", "quantity", "discount", "profit"]

# SQLite works locally. For Supabase / Neon / Vercel Postgres, change
# DATABASE_URL and replace the body of log_analysis() with a Postgres client.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./salesview.db")

app = FastAPI(title="SalesView API")


class DemoPayload(BaseModel):
    rows: list[dict[str, Any]]


class CsvError(ValueError):
    def __init__(self, message: str, missing_columns: list[str] | None = None):
        super().__init__(message)
        self.missing_columns = missing_columns or []


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def clean_dataframe(raw: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, int]]:
    """Validate columns, clean the data and return (clean_df, quality_report)."""
    raw = raw.rename(columns=lambda c: str(c).strip().lower())
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in raw.columns]
    if missing_cols:
        raise CsvError(f"Missing required columns: {', '.join(missing_cols)}", missing_cols)

    # Work on trimmed strings first so " West" and "West" count as duplicates.
    df = raw[REQUIRED_COLUMNS].astype("string")
    df = df.apply(lambda col: col.str.strip()).replace("", pd.NA)

    source_rows = len(df)
    df = df.drop_duplicates()
    duplicates_removed = source_rows - len(df)

    missing_handled = 0
    for col in TEXT_COLUMNS:
        missing_handled += int(df[col].isna().sum())
    # A missing order_id gets a unique placeholder so rows are not merged into one order.
    placeholder = pd.Series("UNKNOWN-" + df.index.astype(str), index=df.index)
    df["order_id"] = df["order_id"].where(df["order_id"].notna(), placeholder)
    for col in ["region", "category", "sub_category", "product_name"]:
        df[col] = df[col].fillna("Unknown")

    for col in NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce").astype("float64")
        missing_handled += int(df[col].isna().sum())
        df[col] = df[col].fillna(0)

    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce", format="mixed")

    # Rows we cannot place on a timeline, or with negative sales, are dropped.
    invalid = df["order_date"].isna() | (df["sales"] < 0)
    invalid_removed = int(invalid.sum())
    df = df[~invalid].copy()

    df["quantity"] = df["quantity"].round().astype(int)
    for col in TEXT_COLUMNS:
        df[col] = df[col].astype(str)

    quality = {
        "source_rows": int(source_rows),
        "clean_rows": int(len(df)),
        "duplicates_removed": int(duplicates_removed),
        "missing_values_handled": int(missing_handled),
        "invalid_rows_removed": invalid_removed,
    }
    return df.reset_index(drop=True), quality


def build_analytics(df: pd.DataFrame, quality: dict[str, int]) -> dict[str, Any]:
    """Turn a clean dataframe into frontend-ready JSON."""
    revenue = float(df["sales"].sum())
    profit = float(df["profit"].sum())
    orders = int(df["order_id"].nunique())

    monthly = (
        df.assign(month=df["order_date"].dt.strftime("%Y-%m"))
        .groupby("month")
        .agg(revenue=("sales", "sum"), profit=("profit", "sum"), orders=("order_id", "nunique"))
        .round(2)
        .reset_index()
    )
    regions = (
        df.groupby("region")["sales"].sum().round(2)
        .sort_values(ascending=False).reset_index()
        .rename(columns={"sales": "revenue"})
    )
    categories = (
        df.groupby("category")
        .agg(revenue=("sales", "sum"), profit=("profit", "sum"))
        .round(2).sort_values("revenue", ascending=False).reset_index()
    )
    top_products = (
        df.groupby("product_name")["sales"].sum().round(2)
        .nlargest(10).reset_index()
        .rename(columns={"sales": "revenue"})
    )

    records = df.assign(order_date=df["order_date"].dt.strftime("%Y-%m-%d"))
    records = records.sort_values(["order_date", "order_id"])

    return {
        "kpis": {
            "total_revenue": round(revenue, 2),
            "total_profit": round(profit, 2),
            "profit_margin": round(profit / revenue * 100, 2) if revenue else 0,
            "total_orders": orders,
            "average_order_value": round(revenue / orders, 2) if orders else 0,
        },
        "monthly": monthly.to_dict(orient="records"),
        "regions": regions.to_dict(orient="records"),
        "categories": categories.to_dict(orient="records"),
        "top_products": top_products.to_dict(orient="records"),
        "data_quality": quality,
        "records": records.round(2).to_dict(orient="records"),
    }


def log_analysis(source: str, quality: dict[str, int]) -> None:
    """Store a tiny audit row. Local SQLite only; skipped on Vercel (read-only disk)."""
    if not DATABASE_URL.startswith("sqlite") or os.getenv("VERCEL"):
        return
    try:
        path = DATABASE_URL.replace("sqlite:///", "", 1)
        with sqlite3.connect(path) as conn:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS analyses "
                "(created_at TEXT, source TEXT, source_rows INT, clean_rows INT)"
            )
            conn.execute(
                "INSERT INTO analyses VALUES (?, ?, ?, ?)",
                (datetime.now(timezone.utc).isoformat(), source,
                 quality["source_rows"], quality["clean_rows"]),
            )
    except sqlite3.Error:
        pass  # logging must never break an analysis


def run_pipeline(raw: pd.DataFrame, source: str) -> dict[str, Any]:
    try:
        clean, quality = clean_dataframe(raw)
    except CsvError as err:
        raise HTTPException(
            status_code=400,
            detail={"message": str(err), "missing_columns": err.missing_columns},
        )
    result = build_analytics(clean, quality)
    log_analysis(source, quality)
    return result


def bad_request(message: str) -> HTTPException:
    return HTTPException(status_code=400, detail={"message": message, "missing_columns": []})


# --------------------------------------------------------------------------
# Endpoints (each path is also registered without the /api prefix, so the app
# works whether the platform keeps or strips the prefix).
# --------------------------------------------------------------------------
@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze")
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    if not content.strip():
        raise bad_request("The uploaded file is empty.")
    try:
        raw = pd.read_csv(io.BytesIO(content), dtype=str, encoding="utf-8-sig", encoding_errors="replace")
    except Exception:
        raise bad_request("Could not read this file as CSV. Check that it is comma-separated.")
    return run_pipeline(raw, file.filename or "upload.csv")


@app.post("/api/demo-analyze")
@app.post("/demo-analyze")
def demo_analyze(payload: DemoPayload):
    if not payload.rows:
        raise bad_request("No demo rows were sent.")
    return run_pipeline(pd.DataFrame(payload.rows), "demo")
