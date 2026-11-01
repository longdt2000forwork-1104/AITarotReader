"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface EditorialHeaderProps {
  activeTab?: "daily" | "workbench" | "catalog" | "decks" | "journal" | "ledger" | "pricing" | "auth" | "settings";
  credits?: number;
}

export default function EditorialHeader({
  activeTab = "daily",
  credits = 120,
}: EditorialHeaderProps) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="w-full bg-white border-b border-outline-variant h-16 sticky top-0 z-50 transition-colors">
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 lg:px-8">
        {/* Brand & Canonical Title */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          <Link
            href="/"
            className="font-display font-bold text-lg lg:text-xl tracking-tight text-on-surface hover:text-primary transition-colors flex items-center gap-2"
          >
            <span>{t.brand}</span>
            <span className="text-xs font-mono font-normal tracking-widest text-slate-400">
              {t.brandSub}
            </span>
          </Link>
        </div>

        {/* Center Links (Desktop Primary Clusters) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-label tracking-wider uppercase">
          <Link
            href="/"
            className={`px-3 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "daily"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">01</span>
            <span>{t.nav.daily}</span>
          </Link>
          <Link
            href="/workbench/demo-session"
            className={`px-3 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "workbench"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">02</span>
            <span>{t.nav.workbench}</span>
          </Link>
          <Link
            href="/catalog-picker"
            className={`px-3 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">03</span>
            <span>{t.nav.catalog}</span>
          </Link>
          <Link
            href="/decks-archive"
            className={`px-3 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "decks"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">04</span>
            <span>{t.nav.decks}</span>
          </Link>
          <Link
            href="/journal"
            className={`px-3 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "journal"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">05</span>
            <span>{t.nav.journal}</span>
          </Link>
          <Link
            href="/studio-billing"
            className={`px-3 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "ledger"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">06</span>
            <span>{t.nav.billing}</span>
          </Link>
          <Link
            href="/pricing"
            className={`px-3 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "pricing"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">07</span>
            <span>Pricing</span>
          </Link>
        </nav>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-3">
          {/* Interactive Language Switch */}
          <div className="flex items-center border border-outline-variant rounded-lg text-[11px] font-mono font-medium overflow-hidden bg-surface-subtle shadow-sm">
            <button
              onClick={() => setLocale("en")}
              type="button"
              className={`px-2.5 py-1 transition-all ${
                locale === "en"
                  ? "bg-slate-900 text-white font-bold"
                  : "text-slate-600 hover:text-on-surface hover:bg-slate-100"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("vi")}
              type="button"
              className={`px-2.5 py-1 transition-all ${
                locale === "vi"
                  ? "bg-primary text-white font-bold"
                  : "text-slate-600 hover:text-on-surface hover:bg-slate-100"
              }`}
            >
              VI
            </button>
          </div>

          {/* Amber Credit Badge linking to /pricing */}
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] text-[#B45309] border border-amber-200/80 rounded-lg text-xs font-mono font-semibold hover:bg-amber-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">toll</span>
            <span>{credits} CR</span>
            <span className="ml-1 hover:text-amber-950 font-bold" title="Refill credits">
              [+]
            </span>
          </Link>

          {/* Astrological Profile Pill linking to /settings/profile */}
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-outline-variant hover:opacity-85 transition-opacity"
            title="Seeker Profile & Settings"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-serif font-bold text-xs">
              ♈
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-on-surface leading-tight">Aria</span>
              <span className="text-[10px] font-mono text-slate-500">Aries · LP 7</span>
            </div>
          </Link>

          {/* Auth Button */}
          <Link
            href="/auth"
            className="hidden sm:inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-primary border border-primary/30 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Auth
          </Link>
        </div>
      </div>
    </header>
  );
}
