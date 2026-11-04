import type { Metadata } from "next";
import { Be_Vietnam_Pro, Newsreader } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "AITarotReader — Sunlit Botanical & Editorial Print",
  description: "Structured Tarot Synthesis for Creative Direction & Daily Clarity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <body className="bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900" suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
