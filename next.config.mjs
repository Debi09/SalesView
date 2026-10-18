/** @type {import('next').NextConfig} */
const nextConfig = {
  // Local dev only: forward the Python endpoints to uvicorn (npm run dev:api).
  // On Vercel, vercel.json routes these paths to api/index.py instead.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    const target = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";
    return [
      { source: "/api/analyze", destination: `${target}/api/analyze` },
      { source: "/api/demo-analyze", destination: `${target}/api/demo-analyze` },
    ];
  },
};

export default nextConfig;
