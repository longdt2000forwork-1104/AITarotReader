"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface MobileBottomNavProps {
  activeTab?: "home" | "oracle" | "journal" | "decks" | "billing" | "profile";
}

export default function MobileBottomNav({
  activeTab = "home",
}: MobileBottomNavProps) {
  const { t } = useLanguage();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 bg-surface/95 backdrop-blur-md border-t border-outline-variant max-w-screen-md mx-auto shadow-sm">
      <Link
        href="/app/home"
        className={`flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === "home" ? "text-primary font-semibold" : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">spa</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">{t.mobileNav.sanctuary}</span>
      </Link>
      <Link
        href="/app/readings/new"
        className={`flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === "oracle" ? "text-primary font-semibold" : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">style</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">{t.mobileNav.oracle}</span>
      </Link>
      <Link
        href="/app/decks"
        className={`flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === "decks" || activeTab === "journal" ? "text-primary font-semibold" : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">menu_book</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">{t.mobileNav.decks}</span>
      </Link>
      <Link
        href="/app/profile"
        className={`flex flex-col items-center justify-center py-1 transition-colors ${
          activeTab === "profile" ? "text-primary font-semibold" : "text-on-surface-variant font-normal hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-xl">person</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">{t.mobileNav.profile}</span>
      </Link>
    </nav>
  );
}
