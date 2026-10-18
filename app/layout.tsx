import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Archivo ships a heavy 900 weight, which the font-black headings and metrics need.
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "SalesView | Sales Performance",
  description: "Revenue, profit and growth at a glance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
