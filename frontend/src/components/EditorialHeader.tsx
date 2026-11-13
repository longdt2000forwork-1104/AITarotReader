"use client";

import { useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { key: "daily", href: "/", label: t.nav.daily, icon: "today" },
    { key: "workbench", href: "/workbench/demo-session", label: t.nav.workbench, icon: "style" },
    { key: "catalog", href: "/catalog-picker", label: t.nav.catalog, icon: "menu_book" },
    { key: "decks", href: "/decks-archive", label: t.nav.decks, icon: "collections_bookmark" },
    { key: "journal", href: "/journal", label: t.nav.journal, icon: "auto_stories" },
    { key: "pricing", href: "/pricing", label: locale === "vi" ? "Bảng Giá" : "Pricing", icon: "toll" },
  ];

  return (
    <header suppressHydrationWarning className="w-full bg-[#FAF9F6]/90 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50 transition-colors shadow-sm">
      <div suppressHydrationWarning className="max-w-[1440px] mx-auto h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4 w-full overflow-hidden">
        {/* Brand & Canonical Title */}
        <div suppressHydrationWarning className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2.5 group transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:rotate-12 transition-transform duration-300">
              auto_awesome
            </span>
            <span className="font-headline font-bold text-lg sm:text-xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
              {t.brand}
            </span>
          </Link>
          <span className="hidden xl:inline-block text-[11px] font-mono tracking-widest text-slate-400 pl-3 border-l border-slate-200 whitespace-nowrap uppercase">
            {t.brandSub}
          </span>
        </div>

        {/* Center Links (Clean Editorial Navigation) */}
        <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-[13px] font-medium tracking-normal">
          {navLinks.map((link) => {
            const isActive = activeTab === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "text-primary font-semibold bg-emerald-50 border border-emerald-200/70"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Utility Actions */}
        <div suppressHydrationWarning className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Interactive Language Switch (Segmented Control) */}
          <div suppressHydrationWarning className="flex items-center p-0.5 border border-slate-200 rounded-lg bg-white text-[10px] sm:text-[11px] font-mono font-medium shrink-0">
            <button
              id="lang-switch-en"
              onClick={() => setLocale("en")}
              type="button"
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all ${
                locale === "en"
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              id="lang-switch-vi"
              onClick={() => setLocale("vi")}
              type="button"
              className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all ${
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
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-lg text-xs font-mono font-semibold hover:bg-amber-100/80 transition-colors shrink-0 shadow-sm"
            title={locale === "vi" ? "Gói phí & Tinh thể" : "Crystals & Subscription"}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-amber-600">toll</span>
            <span className="whitespace-nowrap">{credits} CR</span>
            <span className="hidden sm:inline-block text-amber-500 hover:text-amber-700 font-bold ml-0.5 text-xs leading-none" title={locale === "vi" ? "Nạp thêm tinh thể" : "Refill credits"}>
              +
            </span>
          </Link>

          {/* Astrological Profile Pill linking to /settings/profile */}
          <Link
            href="/settings/profile"
            className="hidden sm:flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity shrink-0"
            title={locale === "vi" ? "Hồ sơ & Cài đặt" : "Seeker Profile & Settings"}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-serif font-bold text-xs shrink-0 shadow-sm">
              ♈
            </div>
            <div className="hidden md:flex flex-col text-left">
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

          {/* Mobile / Tablet Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={locale === "vi" ? "Mở menu điều hướng" : "Toggle navigation menu"}
            className="lg:hidden inline-flex items-center justify-center p-1.5 rounded-lg border border-outline-variant bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-white/95 backdrop-blur-md px-4 py-3 space-y-1 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => {
              const isActive = activeTab === link.key;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-primary font-semibold border border-emerald-200/70"
                      : "text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-2 mt-2 border-t border-outline-variant flex items-center justify-between gap-2">
            <Link
              href="/settings/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>{locale === "vi" ? "Hồ sơ & Cài đặt" : "Profile & Settings"}</span>
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary hover:bg-emerald-50"
            >
              <span className="material-symbols-outlined text-[16px]">account_circle</span>
              <span>{locale === "vi" ? "Tài khoản" : "Account"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
