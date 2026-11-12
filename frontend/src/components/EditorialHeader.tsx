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

  const navLinks = [
    { key: "daily", href: "/", label: t.nav.daily },
    { key: "workbench", href: "/workbench/demo-session", label: t.nav.workbench },
    { key: "catalog", href: "/catalog-picker", label: t.nav.catalog },
    { key: "decks", href: "/decks-archive", label: t.nav.decks },
    { key: "journal", href: "/journal", label: t.nav.journal },
    { key: "pricing", href: "/pricing", label: locale === "vi" ? "Bảng Giá" : "Pricing" },
  ];

  return (
    <header suppressHydrationWarning className="w-full bg-white/95 backdrop-blur-md border-b border-outline-variant h-16 sticky top-0 z-50 transition-colors shadow-sm">
      <div suppressHydrationWarning className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand & Canonical Title */}
        <div suppressHydrationWarning className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-2xl group-hover:rotate-12 transition-transform duration-300">
              auto_awesome
            </span>
            <span className="font-serif font-bold text-xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
              {t.brand}
            </span>
          </Link>
          <span className="hidden xl:inline-block text-[11px] font-mono tracking-widest text-slate-400 pl-3 border-l border-slate-200 whitespace-nowrap uppercase">
            {t.brandSub}
          </span>
        </div>

        {/* Center Links (Clean Editorial Navigation) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-[13px] font-medium tracking-normal">
          {navLinks.map((link) => {
            const isActive = activeTab === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "text-primary font-semibold bg-emerald-50/80 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Utility Actions */}
        <div suppressHydrationWarning className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Interactive Language Switch (Segmented Control) */}
          <div suppressHydrationWarning className="flex items-center p-0.5 border border-slate-200 rounded-lg bg-slate-50 text-[11px] font-mono font-medium shrink-0">
            <button
              onClick={() => setLocale("en")}
              type="button"
              className={`px-2.5 py-1 rounded-md transition-all ${
                locale === "en"
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("vi")}
              type="button"
              className={`px-2.5 py-1 rounded-md transition-all ${
                locale === "vi"
                  ? "bg-primary text-white font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              VI
            </button>
          </div>

          {/* Amber Credit Badge linking to /pricing */}
          <Link
            href="/pricing"
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-lg text-xs font-mono font-semibold hover:bg-amber-100/80 transition-colors shrink-0 shadow-sm"
            title={locale === "vi" ? "Gói phí & Tinh thể" : "Crystals & Subscription"}
          >
            <span className="material-symbols-outlined text-[17px] text-amber-600">toll</span>
            <span className="whitespace-nowrap">{credits} CR</span>
            <span className="text-amber-500 hover:text-amber-700 font-bold ml-1 text-xs leading-none" title={locale === "vi" ? "Nạp thêm tinh thể" : "Refill credits"}>
              +
            </span>
          </Link>

          {/* Astrological Profile Pill linking to /settings/profile */}
          <Link
            href="/settings/profile"
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity shrink-0"
            title={locale === "vi" ? "Hồ sơ & Cài đặt" : "Seeker Profile & Settings"}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-serif font-bold text-xs shrink-0 shadow-sm">
              ♈
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">Aria</span>
              <span className="text-[10px] font-mono text-slate-500 leading-none mt-0.5">
                {locale === "vi" ? "Bạch Dương · Số 7" : "Aries · LP 7"}
              </span>
            </div>
          </Link>

          {/* Auth Button (Clean & Subtle) */}
          <Link
            href="/auth"
            className={`hidden md:inline-flex items-center justify-center p-1.5 rounded-lg transition-colors shrink-0 ${
              activeTab === "auth"
                ? "bg-primary text-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title={locale === "vi" ? "Tài khoản & Xác thực" : "Authentication & Account"}
          >
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
