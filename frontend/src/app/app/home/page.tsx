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
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
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
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  };

  // Check if today's card has already been flipped in Supabase (never draws a card)
  const checkTodayDailyStatus = async (hasSyncCache: boolean = false) => {
    if (!hasSyncCache) {
      setIsLoading(true);
    }
    try {
      const todayKey = getTodayDateKey();
      const res = await apiClient.readings.checkDailyDraw(locale);
      if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
        setDailySession(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "ai_tarot_daily_draw",
            JSON.stringify({ dateKey: todayKey, session: res.data })
          );
        }
      } else {
        setDailySession(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("ai_tarot_daily_draw");
        }
      }
    } catch (err) {
      console.warn("Failed to check daily draw status in app/home:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Called ONLY when user explicitly taps to flip the face-down card
  const handleFlipCard = async (force: boolean = false) => {
    if (isFlipping) return;
    setIsFlipping(true);
    try {
      const todayKey = getTodayDateKey();
      const res = await apiClient.readings.flipDailyDraw(locale, force);
      if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
        setDailySession(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "ai_tarot_daily_draw",
            JSON.stringify({ dateKey: todayKey, session: res.data })
          );
        }
      }
    } catch (err) {
      console.warn("Failed to flip daily draw in app/home:", err);
    } finally {
      setIsFlipping(false);
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
    const todayKey = getTodayDateKey();
    let hasSyncCache = false;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("ai_tarot_daily_draw");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.dateKey === todayKey && parsed.session?.drawnCards?.length > 0) {
            setDailySession(parsed.session);
            setIsLoading(false);
            hasSyncCache = true;
          } else {
            localStorage.removeItem("ai_tarot_daily_draw");
          }
        }
      } catch {
        // ignore
      }
    }

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
    checkTodayDailyStatus(hasSyncCache);

    // Automatically reset to face-down at 00:00 midnight if page stays open
    let currentKey = todayKey;
    const interval = setInterval(() => {
      const newKey = getTodayDateKey();
      if (newKey !== currentKey) {
        currentKey = newKey;
        setDailySession(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("ai_tarot_daily_draw");
        }
      }
    }, 15000);

    return () => clearInterval(interval);
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

  // Card resolution (only when drawn card exists from today's session)
  const drawnCardData = dailySession?.drawnCards?.[0];
  const apiCard = drawnCardData?.card as any;
  const staticCard = apiCard ? (TAROT_CARDS.find((c) => c.id === Number(apiCard?.id)) || null) : null;

  const card = (apiCard || staticCard)
    ? {
        ...(staticCard || {}),
        ...(apiCard || {}),
        image: apiCard?.imageUrl || apiCard?.image || staticCard?.image || "",
        keywordsVi: apiCard?.keywordsUprightVi || apiCard?.keywordsVi || staticCard?.keywordsVi || "",
        keywordsEn: apiCard?.keywordsUprightEn || apiCard?.keywordsEn || staticCard?.keywordsEn || "",
        meaningUprightVi: apiCard?.summaryVi || apiCard?.meaningUprightVi || staticCard?.meaningUprightVi || "",
        meaningUprightEn: apiCard?.summaryEn || apiCard?.meaningUprightEn || staticCard?.meaningUprightEn || "",
      }
    : null;
  const isReversed = Boolean(drawnCardData?.isReversed);
  const aiMessage = dailySession?.aiInterpretation || dailySession?.aiSynthesisResult || t.portal.advisoryQuote;

  const rawKeywords: string = card ? String((isVi ? card.keywordsVi : card.keywordsEn) || "") : "";
  const keywordsList: string[] = rawKeywords
    ? rawKeywords
        .split(/[·,]/)
        .map((k: string) => k.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="w-full max-w-[430px] sm:max-w-md mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20 overflow-x-hidden">
      {/* Top Hairline App Bar */}
      <header className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40 w-full gap-2">
        <Link
          href="/app/profile"
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 max-w-[58%] sm:max-w-[62%] group hover:opacity-90 transition-opacity"
          title={isVi ? "Mở Hồ Sơ Cá Nhân" : "Open Seeker Profile"}
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 group-hover:border-primary flex items-center justify-center text-xs font-serif font-bold text-slate-800 transition-colors shrink-0 shadow-2xs">
            ✦
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="text-xs font-bold text-on-surface group-hover:text-primary leading-tight transition-colors truncate">
              Aria • {sunSignDisplay}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
              {isVi ? "Đường Đời " : "LP "} {profile ? profile.lifePathNumber : "7"}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Language Switcher */}
          <div className="flex items-center border border-outline-variant rounded-md text-[10px] font-mono overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 transition-colors ${
                !isVi ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-on-surface"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("vi")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 transition-colors ${
                isVi ? "bg-primary text-white font-bold" : "text-slate-500 hover:text-on-surface"
              }`}
            >
              VI
            </button>
          </div>

          <Link
            href="/app/billing"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-[#FEF3C7] text-[#B45309] border border-amber-200 rounded-md text-xs font-mono font-semibold hover:bg-amber-100 transition-colors shadow-2xs shrink-0"
            title={isVi ? "Ví Crystal & Nạp thêm" : "Crystal Balance"}
          >
            <span className="material-symbols-outlined text-[14px] sm:text-[15px]">toll</span>
            <span className="whitespace-nowrap">{wallet ? wallet.balance : 85} CR</span>
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
        {isLoading && !card ? (
          <div className="bg-white border border-outline-variant rounded-lg p-5 text-center shadow-sm space-y-3 relative overflow-hidden animate-pulse">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2">
              <span>Rider-Waite 1909</span>
              <span className="w-20 h-3 bg-slate-200 rounded" />
            </div>
            <div className="w-32 h-52 mx-auto rounded-lg border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-3">
              <span className="material-symbols-outlined text-slate-400 text-2xl animate-spin mb-1">
                progress_activity
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">
                {isVi ? "Đang tải..." : "Loading..."}
              </span>
            </div>
            <div className="space-y-1.5 flex flex-col items-center">
              <div className="h-3 w-12 bg-slate-200 rounded" />
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
          </div>
        ) : !card ? (
          <div className="bg-white border border-outline-variant rounded-lg p-5 text-center shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2">
              <span>Rider-Waite 1909 · 78 {isVi ? "Lá" : "Cards"}</span>
              <span className="px-2 py-0.5 rounded font-semibold border text-[10px] text-amber-800 bg-amber-50 border-amber-200">
                {isVi ? "BÀI ĐANG ÚP · CHƯA LẬT" : "FACE DOWN · UNFLIPPED"}
              </span>
            </div>

            {/* Interactive Mystical Face-Down Card Back */}
            <button
              type="button"
              onClick={() => handleFlipCard(false)}
              disabled={isFlipping}
              className="w-32 h-52 mx-auto rounded-lg overflow-hidden border-2 border-amber-500/70 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] shadow-lg flex flex-col items-center justify-center p-2.5 cursor-pointer hover:scale-105 hover:border-amber-400 transition-all duration-300 disabled:opacity-75"
            >
              <div className="w-full h-full border border-amber-400/40 rounded flex flex-col items-center justify-between p-2">
                <div className="w-full flex justify-between text-[9px] text-amber-400/70 font-serif">
                  <span>✦</span>
                  <span>✦</span>
                </div>

                {isFlipping ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-3xl animate-spin">
                      progress_activity
                    </span>
                    <span className="text-[9px] font-mono tracking-wider text-amber-200 uppercase">
                      {isVi ? "Đang lật bài..." : "Flipping..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="w-11 h-11 rounded-full border border-amber-400/50 bg-amber-500/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-300 text-xl">
                        auto_awesome
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold tracking-widest text-amber-200 uppercase mt-1">
                      {isVi ? "CHẠM ĐỂ LẬT" : "TAP TO FLIP"}
                    </span>
                  </div>
                )}

                <div className="w-full flex justify-between text-[9px] text-amber-400/70 font-serif">
                  <span>✦</span>
                  <span>✦</span>
                </div>
              </div>
            </button>

            <div>
              <div className="font-mono text-xs font-semibold text-amber-700 uppercase">
                {isVi ? "CHƯA LẬT BÀI HÔM NAY" : "TODAY'S CARD UNFLIPPED"}
              </div>
              <h1 className="font-headline font-bold text-lg text-on-surface mt-0.5">
                {isVi ? "Chạm Vào Bài Để Mở Năng Lượng" : "Tap the Card to Reveal Energy"}
              </h1>
              <p className="text-xs text-[#475569] mt-1">
                {isVi
                  ? "Lá bài định hướng ngày hôm nay sẽ chỉ được rút từ cơ sở dữ liệu khi bạn chủ động lật mở."
                  : "Today's daily card is only drawn from the database when you actively flip it."}
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleFlipCard(false)}
                disabled={isFlipping}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-sm ${isFlipping ? "animate-spin" : ""}`}>
                  {isFlipping ? "progress_activity" : "touch_app"}
                </span>
                <span>
                  {isFlipping
                    ? isVi
                      ? "Đang rút & lật bài..."
                      : "Flipping card..."
                    : isVi
                    ? "Lật Bài Hôm Nay"
                    : "Flip Today's Card"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-outline-variant rounded-lg p-5 text-center shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2">
              <span>Rider-Waite 1909 · {card.suit === "MAJOR" || (card as any).arcana === "MAJOR" || !card.suit ? (isVi ? "Bộ Ẩn Chính" : "Major Arcana") : card.suit}</span>
              <div className="flex items-center gap-1.5">
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
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isReversed ? "rotate-180" : ""
                }`}
              />
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
        )}

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
            {isLoading && !dailySession ? (
              <span className="text-slate-400 not-italic font-sans text-xs flex items-center gap-1.5 py-1">
                <span className="material-symbols-outlined text-xs animate-spin text-primary">sync</span>
                {isVi ? "Đang đồng bộ trạng thái lá bài..." : "Syncing daily card status..."}
              </span>
            ) : isFlipping ? (
              <span className="text-slate-400 not-italic font-sans text-xs flex items-center gap-1.5 py-1">
                <span className="material-symbols-outlined text-xs animate-spin text-primary">sync</span>
                {isVi ? "Đang rút bài và thỉnh thông điệp từ Gemini AI..." : "Drawing card & synthesizing with Gemini AI..."}
              </span>
            ) : !dailySession ? (
              <span className="text-slate-500 not-italic font-sans text-xs block py-1">
                {isVi
                  ? "Lá bài hôm nay vẫn đang úp. Hãy chạm lật bài phía trên để rút lá bài từ cơ sở dữ liệu và mở thông điệp ngày mới."
                  : "Today's card is still face down. Flip the card above to draw from the database and reveal your daily message."}
              </span>
            ) : (
              `“${aiMessage}”`
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/app/readings/new"
            className="w-full py-3.5 bg-primary text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 hover:bg-primary-hover shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            <span>{isVi ? "Bắt Đầu Trải Bài Mới (3 Lá)" : "Begin New Reading (3-Card)"}</span>
          </Link>
          <Link
            href={`/app/readings/${dailySession?.id || "demo-session"}`}
            className="w-full py-3 bg-white border border-outline-variant text-on-surface text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-base text-primary">space_dashboard</span>
            <span>{isVi ? "Mở Bàn Trải Bài & Hỏi Đáp AI (Workbench)" : "Open Reading Workbench & AI Chat"}</span>
          </Link>
        </div>
      </main>

      {/* Global Mobile Bottom Navigation */}
      <MobileBottomNav activeTab="home" />
    </div>
  );
}
