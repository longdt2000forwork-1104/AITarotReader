"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { MysticProfileDto, WalletBalanceDto, ReadingSessionDto } from "@/types/api";
import { TAROT_CARDS, TarotCard } from "@/data/tarotCards";

export default function MobileDailyHomePage() {
  const { locale, setLocale, t } = useLanguage();
  const isVi = locale === "vi";

  const [profile, setProfile] = useState<MysticProfileDto | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);
  const [dailySession, setDailySession] = useState<ReadingSessionDto | null>(null);
  const [isRedrawing, setIsRedrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [todayDateStr, setTodayDateStr] = useState("");

  const zodiacMap: Record<string, string> = {
    Aries: "Bạch Dương",
    Taurus: "Kim Ngưu",
    Gemini: "Song Tử",
    Cancer: "Cự Giải",
    Leo: "Sư Tử",
    Virgo: "Xử Nữ",
    Libra: "Thiên Bình",
    Scorpio: "Bọ Cạp",
    Sagittarius: "Nhân Mã",
    Capricorn: "Ma Kết",
    Aquarius: "Bảo Bình",
    Pisces: "Song Ngư",
  };

  const getTodayDateKey = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const loadDailyCard = async (force: boolean = false) => {
    if (force) setIsRedrawing(true);
    try {
      const todayKey = getTodayDateKey();
      if (!force && typeof window !== "undefined") {
        const cached = localStorage.getItem("ai_tarot_daily_draw");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.dateKey === todayKey && parsed.session) {
              setDailySession(parsed.session);
              return;
            }
          } catch {
            // ignore parse err
          }
        }
      }

      const res = await apiClient.readings.getDailyDraw(locale, force);
      if (res.data) {
        setDailySession(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "ai_tarot_daily_draw",
            JSON.stringify({ dateKey: todayKey, session: res.data })
          );
        }
      }
    } catch (err) {
      console.warn("Failed to load daily draw in app/home:", err);
    } finally {
      setIsRedrawing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const formatted = new Date().toLocaleDateString(isVi ? "vi-VN" : "en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();
      setTodayDateStr(formatted);
    } catch {
      setTodayDateStr(isVi ? "HÔM NAY" : "TODAY");
    }
  }, [isVi]);

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
    loadDailyCard(false);
  }, [locale]);

  const handleClaimReward = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      const res = await apiClient.wallet.claimDailyReward();
      if (res.code === 200) {
        setWallet(res.data);
        setClaimToast(isVi ? "Đã nhận +10 Crystal phước lành ngày mới!" : "Claimed +10 Daily Crystal Blessing!");
        setTimeout(() => setClaimToast(null), 3500);
      }
    } catch {
      setClaimToast(isVi ? "Nhận thất bại. Vui lòng thử lại." : "Claim failed. Please try again.");
      setTimeout(() => setClaimToast(null), 3000);
    } finally {
      setIsClaiming(false);
    }
  };

  const sunSignDisplay = profile?.sunSign
    ? isVi
      ? zodiacMap[profile.sunSign] || profile.sunSign
      : profile.sunSign
    : isVi
    ? "Bạch Dương"
    : "Aries";

  // Card resolution
  const defaultCard = TAROT_CARDS.find((c) => c.id === 19) || TAROT_CARDS[0];
  const drawnCardData = dailySession?.drawnCards?.[0];
  const apiCard = drawnCardData?.card as any;
  const staticCard = TAROT_CARDS.find((c) => c.id === Number(apiCard?.id)) || defaultCard;

  const card = {
    ...staticCard,
    ...(apiCard || {}),
    image: apiCard?.imageUrl || apiCard?.image || staticCard.image,
    keywordsVi: apiCard?.keywordsUprightVi || apiCard?.keywordsVi || staticCard.keywordsVi || "",
    keywordsEn: apiCard?.keywordsUprightEn || apiCard?.keywordsEn || staticCard.keywordsEn || "",
    meaningUprightVi: apiCard?.summaryVi || apiCard?.meaningUprightVi || staticCard.meaningUprightVi || "",
    meaningUprightEn: apiCard?.summaryEn || apiCard?.meaningUprightEn || staticCard.meaningUprightEn || "",
  };
  const isReversed = Boolean(drawnCardData?.isReversed);
  const aiMessage = dailySession?.aiInterpretation || dailySession?.aiSynthesisResult || t.portal.advisoryQuote;

  const rawKeywords: string = String((isVi ? card.keywordsVi : card.keywordsEn) || "");
  const keywordsList: string[] = rawKeywords
    .split(/[·,]/)
    .map((k: string) => k.trim())
    .filter(Boolean);

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
              Aria • {sunSignDisplay}
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {isVi ? "Số Đường Đời " : "Life Path "} {profile ? profile.lifePathNumber : "7"}
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
                !isVi ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-on-surface"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("vi")}
              className={`px-2 py-0.5 transition-colors ${
                isVi ? "bg-primary text-white font-bold" : "text-slate-500 hover:text-on-surface"
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

      {/* Claim Toast */}
      {claimToast && (
        <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center justify-between animate-fade-in shadow-xs">
          <span>{claimToast}</span>
          <button onClick={() => setClaimToast(null)} className="text-emerald-600 hover:text-emerald-900 text-sm">
            ×
          </button>
        </div>
      )}

      {/* Main Daily Content */}
      <main className="p-4 space-y-4">
        {/* Issue & Date Kicker */}
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
          <span>{isVi ? "THÁNH ĐỊA HÀNG NGÀY" : "DAILY SANCTUARY"}</span>
          <span suppressHydrationWarning>{mounted && todayDateStr ? todayDateStr : (isVi ? "HÔM NAY" : "TODAY")}</span>
        </div>

        {/* Drawn Card Specimen Card */}
        <div className="bg-white border border-outline-variant rounded-lg p-5 text-center shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2">
            <span>Rider-Waite 1909 · {card.suit === "MAJOR" || (card as any).arcana === "MAJOR" || !card.suit ? (isVi ? "Bộ Ẩn Chính" : "Major Arcana") : card.suit}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadDailyCard(true)}
                disabled={isRedrawing}
                className="text-[10px] font-mono text-slate-500 hover:text-primary flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 disabled:opacity-50"
                title={isVi ? "Rút lại lá bài khác" : "Redraw card"}
              >
                <span className={`material-symbols-outlined text-[11px] ${isRedrawing ? "animate-spin text-primary" : ""}`}>
                  autorenew
                </span>
                <span>{isRedrawing ? "..." : (isVi ? "Đổi" : "New")}</span>
              </button>
              <span className={`px-2 py-0.5 rounded font-semibold border text-[10px] ${
                isReversed ? "text-amber-800 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}>
                {isReversed ? (isVi ? "NGƯỢC (REVERSED)" : "REVERSED") : (isVi ? "XUÔI (UPRIGHT)" : "UPRIGHT")}
              </span>
            </div>
          </div>

          {/* Card Real Art Preview */}
          <div className="w-32 h-52 mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-md relative group">
            <img
              src={card.image}
              alt={`${card.number} ${isVi ? card.nameVi : card.nameEn}`}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                isReversed ? "rotate-180" : ""
              } ${isRedrawing ? "opacity-40 blur-xs" : "opacity-100"}`}
            />
            {isRedrawing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl animate-spin">
                  progress_activity
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="font-mono text-xs font-semibold text-slate-400 uppercase">{card.number}</div>
            <h1 className="font-headline font-bold text-xl text-on-surface">
              {isVi ? card.nameVi.toUpperCase() : card.nameEn.toUpperCase()}
            </h1>
            <p className="text-xs text-[#475569] mt-1 line-clamp-2">
              {isReversed
                ? (isVi ? card.meaningUprightVi : card.meaningUprightEn)
                : (isVi ? card.meaningUprightVi : card.meaningUprightEn)}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {keywordsList.slice(0, 3).map((kw: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                {kw.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Daily Synthesis Quote (Gemini AI) */}
        <div className="p-4 bg-white border border-outline-variant rounded-lg border-l-4 border-l-primary space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-primary font-semibold block">
              {isVi ? "THÔNG ĐIỆP GEMINI AI" : "GEMINI AI GUIDANCE"}
            </span>
            <button
              onClick={handleClaimReward}
              disabled={isClaiming}
              className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold hover:bg-amber-100 transition-colors"
            >
              {isClaiming ? (isVi ? "Đang nhận..." : "Claiming...") : (isVi ? "+10 CR Phước lành" : "+10 CR Blessing")}
            </button>
          </div>
          <p className="font-headline italic text-sm text-on-surface leading-snug">
            {isRedrawing ? (
              <span className="text-slate-400 not-italic font-sans text-xs flex items-center gap-1.5 py-1">
                <span className="material-symbols-outlined text-xs animate-spin text-primary">sync</span>
                {isVi ? "Đang thỉnh thông điệp từ Gemini AI..." : "Synthesizing with Gemini AI..."}
              </span>
            ) : (
              `“${aiMessage}”`
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/app/readings/new"
            className="w-full py-3 bg-primary text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>{isVi ? "Bắt Đầu Trải Bài Mới (3 Lá)" : "Begin New Reading (3-Card)"}</span>
          </Link>
          <Link
            href="/app/readings/manual"
            className="w-full py-2.5 bg-white border border-outline-variant text-on-surface text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">menu_book</span>
            <span>{isVi ? "Nhập Bài Đã Rút Ngoài Đời" : "Log Physical Spread"}</span>
          </Link>
        </div>
      </main>

      {/* Global Mobile Bottom Navigation */}
      <MobileBottomNav activeTab="home" />
    </div>
  );
}
