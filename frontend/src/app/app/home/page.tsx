"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { MysticProfileDto, WalletBalanceDto } from "@/types/api";

export default function MobileDailyHomePage() {
  const { locale, setLocale, t } = useLanguage();
  const [profile, setProfile] = useState<MysticProfileDto | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [todayDateStr, setTodayDateStr] = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      const formatted = new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();
      setTodayDateStr(formatted);
    } catch {
      setTodayDateStr("TODAY");
    }
  }, [locale]);

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, walletRes] = await Promise.all([
          apiClient.profile.getMysticProfile(),
          apiClient.wallet.getBalance()
        ]);
        if (profRes.code === 200) setProfile(profRes.data);
        if (walletRes.code === 200) setWallet(walletRes.data);
      } catch (err) {
        console.error("Failed to load initial home data:", err);
      }
    }
    loadData();
  }, []);

  const handleClaimReward = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      const res = await apiClient.wallet.claimDailyReward();
      if (res.code === 200) {
        setWallet(res.data);
        setClaimToast(locale === "vi" ? "Đã nhận +10 Crystal phước lành ngày mới!" : "Claimed +10 Daily Crystal Blessing!");
        setTimeout(() => setClaimToast(null), 3500);
      }
    } catch {
      setClaimToast("Claim failed. Please try again.");
      setTimeout(() => setClaimToast(null), 3000);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Hairline App Bar */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-serif font-bold text-slate-800">
            ✦
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface leading-tight">
              Aria • {profile ? profile.sunSign : "Aries"}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Life Path {profile ? profile.lifePathNumber : "7"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Language Switcher */}
          <div className="flex items-center border border-outline-variant rounded text-[10px] font-mono overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-0.5 transition-colors ${
                locale === "en" ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-on-surface"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("vi")}
              className={`px-2 py-0.5 transition-colors ${
                locale === "vi" ? "bg-primary text-white font-bold" : "text-slate-500 hover:text-on-surface"
              }`}
            >
              VI
            </button>
          </div>

          <Link
            href="/app/billing"
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] border border-amber-200 rounded text-xs font-mono font-semibold"
          >
            <span className="material-symbols-outlined text-[13px]">toll</span>
            <span>{wallet ? wallet.balance : 85} CR</span>
          </Link>
        </div>
      </header>

      {/* Claim Toast Notification */}
      {claimToast && (
        <div className="mx-4 mt-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center justify-between animate-fade-in shadow-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <span>✨</span> {claimToast}
          </span>
          <button onClick={() => setClaimToast(null)} className="text-emerald-600 hover:text-emerald-900 text-sm">
            ×
          </button>
        </div>
      )}

      {/* Main Daily Content */}
      <main className="p-4 space-y-4">
        {/* Issue & Date Kicker */}
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
          <span>{locale === "vi" ? "THÁNH ĐỊA HÀNG NGÀY" : "DAILY SANCTUARY"}</span>
          <span suppressHydrationWarning>{mounted && todayDateStr ? todayDateStr : "TODAY"}</span>
        </div>

        {/* Drawn Card Specimen Card */}
        <div className="bg-white border border-outline-variant rounded-lg p-5 text-center shadow-sm space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2">
            <span>RWS // 19 • MAJOR</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              {locale === "vi" ? "XUÔI (UPRIGHT)" : "UPRIGHT"}
            </span>
          </div>

          {/* Card Real Art Preview */}
          <div className="w-32 h-52 mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-md relative group">
            <img
              src="/decks/rider-waite-1909/cards/19_the_sun.webp"
              alt="XIX The Sun"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          <div>
            <div className="font-mono text-xs font-semibold text-slate-400 uppercase">XIX</div>
            <h1 className="font-headline font-bold text-xl text-on-surface">
              {locale === "vi" ? "MẶT TRỜI (THE SUN)" : "THE SUN"}
            </h1>
            <p className="text-xs text-[#475569] mt-1 italic">
              {t.portal.cardDesc}
            </p>
          </div>

          {/* Tags */}
          <div className="flex justify-center gap-1.5 pt-2">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
              {t.portal.kwClarity.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
              {t.portal.kwMomentum.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
              {t.portal.kwBreakthrough.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Daily Synthesis Quote */}
        <div className="p-4 bg-white border border-outline-variant rounded-lg border-l-4 border-l-primary space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-primary font-semibold block">
              {t.portal.advisoryKicker}
            </span>
            <button
              onClick={handleClaimReward}
              disabled={isClaiming}
              className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold hover:bg-amber-100 transition-colors"
            >
              {isClaiming ? "Claiming..." : (locale === "vi" ? "+10 CR Phước lành" : "+10 CR Blessing")}
            </button>
          </div>
          <p className="font-headline italic text-sm text-on-surface leading-snug">
            {t.portal.advisoryQuote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/app/readings/new"
            className="w-full py-3 bg-primary text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-sm"
          >
            <span>{locale === "vi" ? "Bắt Đầu Trải Bài Mới (Bộ Bài Ảo) →" : "Begin New Reading (Virtual Deck) →"}</span>
          </Link>
          <Link
            href="/catalog-picker"
            className="w-full py-3 bg-white border border-outline-variant text-on-surface text-xs font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">edit_note</span>
            <span>{t.portal.logPhysical}</span>
          </Link>
        </div>
      </main>

      <MobileBottomNav activeTab="home" />
    </div>
  );
}
