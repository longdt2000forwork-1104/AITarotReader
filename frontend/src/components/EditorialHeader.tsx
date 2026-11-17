"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface EditorialHeaderProps {
  activeTab?: "daily" | "workbench" | "catalog" | "decks" | "journal" | "ledger" | "pricing" | "auth" | "settings";
  credits?: number;
}

export default function EditorialHeader({
  activeTab = "daily",
  credits,
}: EditorialHeaderProps) {
  const { locale, setLocale, t } = useLanguage();
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const isVi = locale === "vi";

  const navLinks = [
    { key: "daily", href: "/", label: t.nav.daily },
    { key: "catalog", href: "/catalog-picker", label: t.nav.catalog },
    { key: "journal", href: "/journal", label: t.nav.journal },
    { key: "pricing", href: "/pricing", label: isVi ? "Bảng Giá" : "Pricing" },
  ];

  const displayCredits = credits ?? user?.crystalBalance ?? 0;
  const displayName = user?.fullName || user?.email?.split("@")[0] || (isVi ? "Người Tìm Kiếm" : "Seeker");
  const initial = displayName.trim().charAt(0).toUpperCase() || "S";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header suppressHydrationWarning className="w-full bg-white/95 backdrop-blur-md border-b border-outline-variant h-16 sticky top-0 z-50 transition-colors shadow-sm">
      <div suppressHydrationWarning className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand & Canonical Title */}
        <div suppressHydrationWarning className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 group transition-colors">
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

        {/* Center Links */}
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
          {/* Language Switch */}
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

          {status === "authenticated" && user ? (
            <>
              {/* Credit Badge */}
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-lg text-xs font-mono font-semibold hover:bg-amber-100/80 transition-colors shrink-0 shadow-sm"
                title={isVi ? "Gói phí & Tinh thể" : "Crystals & Subscription"}
              >
                <span className="material-symbols-outlined text-[16px] text-amber-600">toll</span>
                <span className="whitespace-nowrap">{displayCredits} CR</span>
                <span className="text-amber-500 font-bold ml-0.5 text-xs leading-none">+</span>
              </Link>

              {/* Authenticated User Profile Pill */}
              <Link
                href="/settings/profile"
                className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity shrink-0"
                title={isVi ? "Hồ sơ & Cài đặt" : "Seeker Profile & Settings"}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-primary font-serif font-bold text-xs shrink-0 shadow-sm">
                    {initial}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left max-w-[140px]">
                  <span className="text-xs font-semibold text-slate-800 leading-tight truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 leading-none truncate">
                    {user.tier === "PRO" ? "ARCHIVAL PRO" : user.email}
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0"
                title={isVi ? "Đăng xuất" : "Sign out"}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden md:inline">{isVi ? "Đăng xuất" : "Sign Out"}</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                activeTab === "auth"
                  ? "bg-primary text-white"
                  : "bg-slate-900 hover:bg-primary text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>{isVi ? "Đăng Nhập" : "Sign In"}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
