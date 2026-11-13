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

  const isHomeActive = activeTab === "home";
  const isOracleActive = activeTab === "oracle";
  const isDecksActive = activeTab === "decks";
  const isJournalActive = activeTab === "journal";
  const isProfileActive = activeTab === "profile" || activeTab === "billing";

  const navItems = [
    {
      key: "home",
      href: "/app/home",
      icon: "spa",
      label: t.mobileNav.sanctuary,
      isActive: isHomeActive,
    },
    {
      key: "oracle",
      href: "/app/readings/new",
      icon: "style",
      label: t.mobileNav.oracle,
      isActive: isOracleActive,
    },
    {
      key: "decks",
      href: "/app/decks",
      icon: "menu_book",
      label: t.mobileNav.decks,
      isActive: isDecksActive,
    },
    {
      key: "journal",
      href: "/journal",
      icon: "auto_stories",
      label: t.mobileNav.journal,
      isActive: isJournalActive,
    },
    {
      key: "profile",
      href: "/app/profile",
      icon: "person",
      label: t.mobileNav.profile,
      isActive: isProfileActive,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 w-full max-w-[430px] sm:max-w-md mx-auto shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all"
    >
      <div className="flex items-center justify-around px-1 sm:px-2 py-1 sm:py-1.5 w-full">
        {navItems.map((item) => {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 select-none group min-w-0 ${
                item.isActive
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`w-8 sm:w-9 h-6 sm:h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  item.isActive
                    ? "bg-emerald-50 text-primary"
                    : "text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[19px] sm:text-[20px] leading-none">
                  {item.icon}
                </span>
              </div>
              <span
                className={`mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] leading-tight tracking-tight text-center truncate w-full px-0.5 transition-colors ${
                  item.isActive
                    ? "font-semibold text-primary"
                    : "font-normal text-slate-500 group-hover:text-slate-800"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
