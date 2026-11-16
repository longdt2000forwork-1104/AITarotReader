"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface MobileBottomNavProps {
  activeTab?: "home" | "oracle" | "catalog" | "journal" | "decks" | "billing" | "profile" | "auth";
}

export default function MobileBottomNav({
  activeTab = "home",
}: MobileBottomNavProps) {
  const { locale } = useLanguage();
  const isVi = locale === "vi";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 gap-1 items-center px-2 py-2 bg-white/95 backdrop-blur-md border-t border-x border-outline-variant max-w-[430px] mx-auto shadow-sm">
      <Link
        href="/app/home"
        className={`flex flex-col items-center justify-center py-1 px-1 min-w-0 transition-colors ${
          activeTab === "home" || activeTab === "oracle"
            ? "text-primary font-semibold"
            : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">spa</span>
        <span className="font-label text-[10px] leading-tight tracking-normal truncate max-w-full mt-0.5">
          {isVi ? "Trang Chủ" : "Home"}
        </span>
      </Link>

      <Link
        href="/app/readings/manual"
        className={`flex flex-col items-center justify-center py-1 px-1 min-w-0 transition-colors ${
          activeTab === "catalog"
            ? "text-primary font-semibold"
            : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">grid_view</span>
        <span className="font-label text-[10px] leading-tight tracking-normal truncate max-w-full mt-0.5">
          {isVi ? "78 Lá" : "78 Cards"}
        </span>
      </Link>

      <Link
        href="/app/journal"
        className={`flex flex-col items-center justify-center py-1 px-1 min-w-0 transition-colors ${
          activeTab === "journal"
            ? "text-primary font-semibold"
            : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">calendar_month</span>
        <span className="font-label text-[10px] leading-tight tracking-normal truncate max-w-full mt-0.5">
          {isVi ? "Nhật Ký" : "Journal"}
        </span>
      </Link>

      <Link
        href="/app/profile"
        className={`flex flex-col items-center justify-center py-1 px-1 min-w-0 transition-colors ${
          activeTab === "profile" || activeTab === "billing" || activeTab === "auth"
            ? "text-primary font-semibold"
            : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">person</span>
        <span className="font-label text-[10px] leading-tight tracking-normal truncate max-w-full mt-0.5">
          {isVi ? "Hồ Sơ" : "Profile"}
        </span>
      </Link>
    </nav>
  );
}
