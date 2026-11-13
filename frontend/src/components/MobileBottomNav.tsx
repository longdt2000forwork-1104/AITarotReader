"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface MobileBottomNavProps {
  activeTab?: "home" | "oracle" | "journal" | "decks" | "billing" | "profile";
}

export default function MobileBottomNav({
  activeTab = "home",
}: MobileBottomNavProps) {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  const items = [
    { key: "home", href: "/", icon: "today", label: isVi ? "Hôm Nay" : "Daily" },
    { key: "oracle", href: "/workbench/demo-session", icon: "style", label: t.mobileNav.oracle },
    { key: "decks", href: "/catalog-picker", icon: "menu_book", label: isVi ? "78 Lá" : "Catalog" },
    { key: "journal", href: "/journal", icon: "auto_stories", label: isVi ? "Nhật Ký" : "Journal" },
    { key: "profile", href: "/settings/profile", icon: "person", label: t.mobileNav.profile },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-outline-variant shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
    >
      <div className="max-w-[520px] mx-auto flex justify-around items-center px-2 py-1.5">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-primary font-semibold bg-emerald-50/70"
                  : "text-on-surface-variant font-normal hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-label text-[10px] tracking-wide mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
