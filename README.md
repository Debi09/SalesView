# SalesView: Sales Performance & KPI Analytics Dashboard

Upload a sales CSV (or use the built-in demo data) and see revenue, profit, growth, regions, categories and top products.
Next.js 15 frontend, Python FastAPI + Pandas backend, one repo, deployed together on Vercel.

## Project layout

```
app/            Next.js App Router (page, layout, /api/health route)
components/     Dashboard UI (nb-ui.tsx holds shared neo-brutalist pieces)
lib/            api.ts (all backend calls), utils.ts, types.ts, mock-data.ts
api/index.py    FastAPI app: cleaning + KPI calculations with Pandas
vercel.json     Routes /api/analyze and /api/demo-analyze to the Python function
```

## CSV format

Required columns (header names are case-insensitive):

`order_id, order_date, region, category, sub_category, product_name, sales, quantity, discount, profit`

Cleaning rules: dates parsed to datetime, duplicates removed, missing text becomes `Unknown`,
missing numbers become `0`, rows with an unreadable date or negative sales are removed.
If columns are missing, the upload panel lists exactly which ones.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | `{ "status": "ok" }` |
| POST | `/api/analyze` | multipart upload, field name `file` (a `.csv`) |
| POST | `/api/demo-analyze` | JSON body `{ "rows": [ ... ] }` |

Both POST endpoints return `kpis`, `monthly`, `regions`, `categories`, `top_products`, `data_quality` and the cleaned `records`.
Filters run in the browser on `records`.

## Run locally

Requires Node 18.18+ and Python 3.10+.

```bash
npm install

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt uvicorn

cp .env.example .env.local         # Windows: copy .env.example .env.local
```

Run two terminals:

```bash
# terminal 1: Python API on http://127.0.0.1:8000
npm run dev:api

# terminal 2: dashboard on http://localhost:3000
npm run dev
```

In development, Next.js proxies `/api/analyze` and `/api/demo-analyze` to port 8000.
If the API is not running, the demo still loads (calculated in the browser) and a notice explains how to start the API.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com/new and import the repository. Framework Preset: **Next.js** (auto-detected). Leave build settings as they are.
3. Add environment variables (Project Settings > Environment Variables). None are required for the demo. Optional:
   - `DATABASE_URL` for a future Supabase / Neon / Vercel Postgres connection
   - `APP_ENV=production`
4. Click **Deploy**. Vercel installs `requirements.txt` for `api/index.py` and builds the Next.js app.
5. Open the deployment URL and check `/api/health`, then upload a CSV.

CLI alternative:

```bash
npm i -g vercel
vercel          # first deploy (preview)
vercel --prod   # production
```

## Good to know

- Vercel limits request bodies on functions to about 4.5 MB, so very large CSVs need to be trimmed.
- The local SQLite file is for development only. Vercel's disk is read-only, so the API skips it there.
  To move to a hosted database, change `DATABASE_URL` and replace the body of `log_analysis()` in `api/index.py`.
- `python-multipart` is included in `requirements.txt` because FastAPI needs it to read file uploads.
