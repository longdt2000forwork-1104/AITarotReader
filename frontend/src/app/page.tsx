"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/apiClient";
import { TAROT_CARDS } from "@/data/tarotCards";
import { ReadingSessionDto } from "@/types/api";
import { getAiGuidancePreview } from "@/utils/formatAiText";
import {
  READING_TOPICS,
  ReadingTopicId,
  TOPIC_DRAFT_STORAGE_KEY,
  getTopicConfig,
} from "@/data/readingTopics";

function EditorialPortalContent() {
  const { t, locale } = useLanguage();
  const { user, status: authStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVi = locale === "vi";

  const [dailySession, setDailySession] = useState<ReadingSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isGuidanceExpanded, setIsGuidanceExpanded] = useState(false);
  const autoFlipTriggeredRef = useRef(false);

  // Specific 3-card topic reading state
  const [selectedTopic, setSelectedTopic] = useState<ReadingTopicId>("LOVE");
  const [topicQuestion, setTopicQuestion] = useState("");
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedDraft = sessionStorage.getItem(TOPIC_DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed?.topic === "LOVE" || parsed?.topic === "FAMILY" || parsed?.topic === "CAREER") {
          setSelectedTopic(parsed.topic);
        }
        if (typeof parsed?.question === "string" && parsed.question.trim()) {
          setTopicQuestion(parsed.question);
        }
      }
    } catch {
      // ignore draft parse errors
    }
  }, []);

  const handleTopicReadingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingTopic) return;

    const trimmedQuestion = topicQuestion.trim();
    if (!trimmedQuestion) {
      setTopicError(
        isVi
          ? "Vui lòng nhập câu hỏi cụ thể để Tarot Reader rút 3 lá và luận giải chi tiết."
          : "Please enter a specific question so the Tarot Reader can draw 3 cards and interpret in depth."
      );
      return;
    }

    if (authStatus !== "authenticated") {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          TOPIC_DRAFT_STORAGE_KEY,
          JSON.stringify({ topic: selectedTopic, question: trimmedQuestion })
        );
      }
      router.push(`/auth?next=${encodeURIComponent("/#topic-reading")}`);
      return;
    }

    setIsSubmittingTopic(true);
    setTopicError(null);
    try {
      const res = await apiClient.readings.createTopicReading({
        topic: selectedTopic,
        question: trimmedQuestion,
        locale,
      });
      if (res.code >= 400 || !res.data?.id) {
        setTopicError(
          res.message ||
            (isVi
              ? "Không thể khởi tạo phiên trải bài 3 lá. Vui lòng thử lại."
              : "Unable to create your 3-card topic reading. Please try again.")
        );
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(TOPIC_DRAFT_STORAGE_KEY);
      }
      router.push(`/workbench/${res.data.id}`);
    } catch {
      setTopicError(
        isVi
          ? "Có lỗi kết nối khi rút bài theo câu hỏi. Vui lòng thử lại."
          : "Connection error while drawing your 3-card reading. Please try again."
      );
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const activeTopicConfig = getTopicConfig(selectedTopic);

  const cacheKey = user?.id ? `ai_tarot_daily_draw_${user.id}` : null;

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

  // Called ONLY when the authenticated user explicitly clicks to flip the face-down card
  const handleFlipCard = useCallback(async (force: boolean = false) => {
    if (authStatus !== "authenticated") {
      router.push(`/auth?next=${encodeURIComponent("/?flip=1")}`);
      return;
    }
    if (isFlipping) return;
    setIsFlipping(true);
    setIsGuidanceExpanded(false);
    try {
      const todayKey = getTodayDateKey();
      const res = await apiClient.readings.flipDailyDraw(locale, force);
      if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
        setDailySession(res.data);
        if (typeof window !== "undefined" && cacheKey) {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ dateKey: todayKey, session: res.data })
          );
        }
      }
    } catch (err) {
      console.warn("Failed to flip daily tarot card:", err);
    } finally {
      setIsFlipping(false);
    }
  }, [authStatus, cacheKey, isFlipping, locale, router]);

  useEffect(() => {
    if (authStatus === "loading") {
      setIsLoading(true);
      return;
    }
    if (authStatus === "unauthenticated" || !user) {
      setDailySession(null);
      setIsLoading(false);
      return;
    }

    const todayKey = getTodayDateKey();
    let hasSyncCache = false;
    if (typeof window !== "undefined" && cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.dateKey === todayKey && parsed.session?.drawnCards?.length > 0) {
            setDailySession(parsed.session);
            setIsLoading(false);
            hasSyncCache = true;
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      } catch {
        // ignore cache parse error
      }
    }

    let active = true;
    async function syncDaily() {
      if (!hasSyncCache) setIsLoading(true);
      try {
        const res = await apiClient.readings.checkDailyDraw(locale);
        if (!active) return;
        if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
          setDailySession(res.data);
          if (typeof window !== "undefined" && cacheKey) {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ dateKey: todayKey, session: res.data })
            );
          }
        } else {
          setDailySession(null);
          if (typeof window !== "undefined" && cacheKey) {
            localStorage.removeItem(cacheKey);
          }
          if (searchParams.get("flip") === "1" && !autoFlipTriggeredRef.current) {
            autoFlipTriggeredRef.current = true;
            router.replace("/");
            await handleFlipCard(false);
          }
        }
      } catch (err) {
        console.warn("Failed to check daily tarot card status:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    syncDaily();

    // Automatically reset to face-down at 00:00 midnight if page stays open
    let currentKey = todayKey;
    const interval = setInterval(() => {
      const newKey = getTodayDateKey();
      if (newKey !== currentKey) {
        currentKey = newKey;
        setDailySession(null);
        if (typeof window !== "undefined" && cacheKey) {
          localStorage.removeItem(cacheKey);
        }
      }
    }, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [authStatus, user, cacheKey, locale, searchParams, router, handleFlipCard]);

  // Resolve current active card (only when drawnCardData is available from today's draw)
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
  const guidance = getAiGuidancePreview(aiMessage, 220);

  // Resolve Element mapping
  const getElementDetails = (element?: string) => {
    switch (element?.toLowerCase()) {
      case "fire":
        return { label: isVi ? "Hỏa 🔥" : "Fire 🔥", ratio: isVi ? "52% Năng Động" : "52% Kinetic" };
      case "water":
        return { label: isVi ? "Thủy 💧" : "Water 💧", ratio: isVi ? "48% Trực Giác" : "48% Intuitive" };
      case "air":
        return { label: isVi ? "Khí 💨" : "Air 💨", ratio: isVi ? "45% Trí Tuệ" : "45% Intellect" };
      case "earth":
        return { label: isVi ? "Thổ 🌿" : "Earth 🌿", ratio: isVi ? "55% Thực Tại" : "55% Grounded" };
      default:
        return { label: isVi ? "Hỏa ☀️" : "Fire ☀️", ratio: t.portal.elementFireRatio };
    }
  };

  const elementDetails = getElementDetails(card?.element);

  // Resolve Arcana label
  const getArcanaLabel = (c: any) => {
    if (!c) return "";
    if (c.suit === "MAJOR" || c.arcana === "MAJOR" || !c.suit) {
      return isVi ? `Ẩn Chính ${c.number ?? ""} (Major Arcana)` : `Major Arcana · ${c.number ?? ""}`;
    }
    const suitName = isVi
      ? c.suit === "WANDS"
        ? "Bộ Gậy (Wands)"
        : c.suit === "CUPS"
        ? "Bộ Ly (Cups)"
        : c.suit === "SWORDS"
        ? "Bộ Kiếm (Swords)"
        : "Bộ Tiền (Pentacles)"
      : `Suit of ${c.suit ? (c.suit.charAt(0) + c.suit.slice(1).toLowerCase()) : ""}`;
    return suitName;
  };

  // Keywords tags
  const rawKeywords: string = card ? String((isVi ? card.keywordsVi : card.keywordsEn) || "") : "";
  const keywordsList: string[] = rawKeywords
    ? rawKeywords
        .split(/[·,]/)
        .map((k: string) => k.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <EditorialHeader activeTab="daily" />

      {/* MAIN EDITORIAL CANVASES (1280px+ Wide Responsive Layout) */}
      <main suppressHydrationWarning className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* 2-COLUMN HERO EDITORIAL GRID */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[580px] border-b border-outline-variant">
          {/* LEFT EDITORIAL SECTION (60% on desktop) */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 bg-[#FAF9F6] border-b lg:border-b-0 lg:border-r border-outline-variant flex flex-col justify-between">
            <div>
              {/* Kicker Tag */}
              <div className="flex items-center gap-2.5 mb-6">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {t.portal.kicker}
                </span>
              </div>

              {/* Editorial Headline */}
              <h1 className="font-headline font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.12] tracking-tight text-on-surface max-w-2xl">
                {t.portal.heroTitle}
              </h1>

              {/* Lead Paragraph */}
              <p className="font-body text-[#475569] text-base lg:text-[17px] leading-relaxed max-w-xl mt-5">
                {t.portal.heroDesc}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {dailySession?.id ? (
                  <Link
                    href={`/workbench/${dailySession.id}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-6 py-3.5 rounded-lg transition-all active:scale-[0.98]"
                  >
                    <span>
                      {isVi ? "Rút Thêm Lá Bổ Sung & Hỏi Đáp AI" : "Draw Clarifiers & Open Workbench"}
                    </span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFlipCard(false)}
                    disabled={isFlipping || isLoading}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-6 py-3.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <span>
                      {isFlipping
                        ? isVi
                          ? "Đang lật bài hôm nay..."
                          : "Flipping today's card..."
                        : isVi
                        ? "Lật Mở Lá Bài Hôm Nay"
                        : "Flip Today's Card"}
                    </span>
                    <span className="material-symbols-outlined text-base">touch_app</span>
                  </button>
                )}
                <a
                  href="#topic-reading"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-on-surface border border-outline-variant text-sm font-medium px-5 py-3.5 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-base text-primary">style</span>
                  <span>{isVi ? "Rút 3 Lá Theo Câu Hỏi" : "3-Card Topic Reading"}</span>
                </a>
              </div>
            </div>

            {/* 3-Column Key Metrics Strip */}
            <div className="mt-14 pt-8 border-t border-outline-variant grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  {t.portal.metric1Label}
                </div>
                <div className="font-headline font-bold text-lg text-on-surface">{t.portal.metric1Val}</div>
                <div className="text-xs text-ink-muted">{t.portal.metric1Sub}</div>
              </div>
              <div className="space-y-1 sm:border-l sm:border-outline-variant sm:pl-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  {t.portal.metric2Label}
                </div>
                <div className="font-headline font-bold text-lg text-on-surface">{t.portal.metric2Val}</div>
                <div className="text-xs text-ink-muted">{t.portal.metric2Sub}</div>
              </div>
              <div className="space-y-1 sm:border-l sm:border-outline-variant sm:pl-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  {t.portal.metric3Label}
                </div>
                <div className="font-headline font-bold text-lg text-on-surface">{t.portal.metric3Val}</div>
                <div className="text-xs text-ink-muted">{t.portal.metric3Sub}</div>
              </div>
            </div>
          </div>

          {/* RIGHT SPECIMEN & DAILY DRAW COLUMN (40% on desktop) */}
          <div className="lg:col-span-5 p-8 lg:p-10 bg-white flex flex-col justify-between">
            <div>
              {/* Specimen Header Strip */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isFlipping || isLoading ? "bg-amber-500 animate-ping" : card ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span>{t.portal.specimenHeader}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading && !card ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 animate-pulse">
                      {isVi ? "ĐANG KIỂM TRA..." : "CHECKING..."}
                    </span>
                  ) : card ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t.portal.drawnBadge}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {isVi ? "BÀI ĐANG ÚP · CHƯA LẬT" : "FACE DOWN · UNFLIPPED"}
                    </span>
                  )}
                </div>
              </div>

              {/* Specimen Card + Table Display Grid */}
              {isLoading && !card ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start animate-pulse">
                  <div className="sm:col-span-5 bg-[#FAF9F6] border border-outline-variant rounded-lg p-3 text-center flex flex-col items-center justify-between min-h-[250px] shadow-sm">
                    <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-200 pb-1">
                      <span>Rider-Waite 1909</span>
                      <span className="w-12 h-2.5 bg-slate-200 rounded" />
                    </div>
                    <div className="my-2 w-28 h-48 rounded-lg border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-2">
                      <span className="material-symbols-outlined text-slate-400 text-2xl animate-spin mb-1">
                        progress_activity
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {isVi ? "Đang tải..." : "Loading..."}
                      </span>
                    </div>
                    <div className="w-full pt-2 border-t border-slate-200 flex flex-col items-center gap-1">
                      <div className="h-2.5 w-16 bg-slate-200 rounded" />
                      <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="sm:col-span-7 flex flex-col justify-between h-full pt-1">
                    <div>
                      <div className="h-6 w-44 bg-slate-200 rounded mb-2" />
                      <div className="h-3 w-full bg-slate-100 rounded mb-1.5" />
                      <div className="h-3 w-3/4 bg-slate-100 rounded" />
                    </div>
                    <div className="mt-4 border border-outline-variant rounded-lg divide-y divide-outline-variant text-xs">
                      <div className="p-2.5 flex items-center justify-between bg-surface-subtle">
                        <span className="text-slate-400 font-mono text-[11px]">{t.portal.primaryElement}</span>
                        <div className="h-3.5 w-20 bg-slate-200 rounded" />
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-slate-400 font-mono text-[11px]">{t.portal.arcanaClass}</span>
                        <div className="h-3.5 w-28 bg-slate-200 rounded" />
                      </div>
                      <div className="p-2.5 flex flex-col gap-1.5 bg-white">
                        <span className="text-slate-400 font-mono text-[11px]">{t.portal.coreKeywords}</span>
                        <div className="flex gap-1.5 mt-0.5">
                          <div className="h-5 w-16 bg-slate-100 rounded" />
                          <div className="h-5 w-20 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : !card ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                  {/* Interactive Face-Down Tarot Card */}
                  <div className="sm:col-span-5 bg-[#FAF9F6] border border-outline-variant rounded-lg p-3 text-center flex flex-col items-center justify-between min-h-[250px] shadow-sm relative overflow-hidden">
                    <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-200 pb-1">
                      <span>Rider-Waite 1909</span>
                      <span>{isVi ? "78 Lá" : "78 Cards"}</span>
                    </div>

                    {/* Mystical Face-Down Card Back (Click to Flip & Call API) */}
                    <button
                      type="button"
                      onClick={() => handleFlipCard(false)}
                      disabled={isFlipping || isLoading}
                      className="my-2 relative w-28 h-48 rounded-lg border-2 border-amber-500/70 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] shadow-lg flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:scale-105 hover:border-amber-400 hover:shadow-xl transition-all duration-300 disabled:opacity-75"
                      title={isVi ? "Chạm để lật lá bài hôm nay" : "Click to flip today's card"}
                    >
                      {/* Inner Ornate Sacred Geometry Frame */}
                      <div className="w-24 h-44 border border-amber-400/40 rounded flex flex-col items-center justify-between p-2.5 relative">
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
                            <div className="w-11 h-11 rounded-full border border-amber-400/50 bg-amber-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                              <span className="material-symbols-outlined text-amber-300 text-xl">
                                auto_awesome
                              </span>
                            </div>
                            <span className="text-[9px] font-mono font-semibold tracking-widest text-amber-200/90 uppercase mt-1">
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

                    <div className="w-full pt-2 border-t border-slate-200 flex flex-col items-center">
                      <div className="font-mono text-[10px] font-semibold text-amber-700 uppercase tracking-widest">
                        {isVi ? "BÀI ĐANG ÚP" : "FACE DOWN"}
                      </div>
                      <div className="text-[11px] font-medium text-slate-600">
                        {isVi ? "Chưa rút cho hôm nay" : "Not drawn yet today"}
                      </div>
                    </div>
                  </div>

                  {/* Unflipped Prompt & Locked Metadata Table */}
                  <div className="sm:col-span-7 flex flex-col justify-between h-full pt-1">
                    <div>
                      <h2 className="font-headline text-lg font-bold text-on-surface leading-snug">
                        {isVi ? "Lá Bài Hôm Nay Đang Úp" : "Today's Card is Face Down"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {isVi
                          ? "Lá bài định hướng của ngày hôm nay chưa được rút khỏi bộ bài. Hãy tĩnh tâm và nhấn lật bài để rút lá bài dành riêng cho bạn."
                          : "Today's daily card has not been drawn from the deck yet. Center your mind and flip the card to draw your guidance for today."}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFlipCard(false)}
                        disabled={isFlipping || isLoading}
                        className="mt-3 inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <span className={`material-symbols-outlined text-sm ${isFlipping ? "animate-spin" : ""}`}>
                          {isFlipping ? "progress_activity" : "touch_app"}
                        </span>
                        <span>
                          {isFlipping
                            ? isVi
                              ? "Đang rút & lật lá bài..."
                              : "Drawing & flipping card..."
                            : isVi
                            ? "Lật Mở Lá Bài Hôm Nay"
                            : "Flip Today's Card"}
                        </span>
                      </button>
                    </div>

                    {/* Metadata Table Matrix (Unrevealed State) */}
                    <div className="mt-4 border border-outline-variant rounded-lg divide-y divide-outline-variant text-xs">
                      <div className="p-2.5 flex items-center justify-between bg-surface-subtle">
                        <span className="text-slate-500 font-mono text-[11px]">{t.portal.primaryElement}</span>
                        <span className="text-slate-400 font-mono text-[11px] italic">
                          {isVi ? "Ẩn · Lật bài để mở" : "Hidden · Flip to reveal"}
                        </span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-slate-500 font-mono text-[11px]">{t.portal.arcanaClass}</span>
                        <span className="text-slate-400 font-mono text-[11px] italic">
                          {isVi ? "78 Lá Rider-Waite" : "78 Rider-Waite Cards"}
                        </span>
                      </div>
                      <div className="p-2.5 flex flex-col gap-1 bg-white">
                        <span className="text-slate-500 font-mono text-[11px]">{t.portal.coreKeywords}</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200/70 rounded text-[11px] text-amber-800 font-medium">
                            {isVi ? "Chờ lật bài" : "Awaiting Flip"}
                          </span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] text-slate-600 font-medium">
                            {isVi ? "Reset 00:00 mỗi ngày" : "Resets 00:00 daily"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                  {/* Tarot Card Visual Specimen Frame (Flipped / Face Up) */}
                  <div className="sm:col-span-5 bg-[#FAF9F6] border border-outline-variant rounded-lg p-3 text-center flex flex-col items-center justify-between min-h-[250px] shadow-sm relative overflow-hidden">
                    <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-200 pb-1">
                      <span>Rider-Waite 1909</span>
                      <span>{card.suit === "MAJOR" || (card as any).arcana === "MAJOR" || !card.suit ? (isVi ? "Bộ Ẩn Chính" : "Major Arcana") : card.suit}</span>
                    </div>

                    {/* Real Tarot Card Artwork */}
                    <div className="my-2 relative group">
                      <img
                        src={card.image}
                        alt={`${card.number} ${isVi ? card.nameVi : card.nameEn}`}
                        className={`w-28 h-48 object-cover rounded border border-slate-200 shadow-md transition-all duration-300 ${
                          isReversed ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <div className="w-full pt-2 border-t border-slate-200">
                      <div className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                        {card.number}
                      </div>
                      <div className="font-headline font-bold text-sm tracking-tight text-on-surface uppercase line-clamp-1">
                        {isVi ? card.nameVi : card.nameEn}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-medium ${
                          isReversed ? "text-amber-700" : "text-emerald-600"
                        }`}
                      >
                        {isReversed
                          ? isVi
                            ? "Ngược (Reversed)"
                            : "Reversed"
                          : isVi
                          ? "Xuôi (Upright)"
                          : "Upright"}
                      </div>
                    </div>
                  </div>

                  {/* Elemental & Archetype Specimen Table */}
                  <div className="sm:col-span-7 flex flex-col justify-between h-full pt-1">
                    <div>
                      <h2 className="font-headline text-lg font-bold text-on-surface leading-snug">
                        {card.number} — {isVi ? card.nameVi : card.nameEn}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {isReversed
                          ? isVi
                            ? card.meaningUprightVi
                            : card.meaningUprightEn
                          : isVi
                          ? card.meaningUprightVi
                          : card.meaningUprightEn}
                      </p>
                    </div>

                    {/* Metadata Table Matrix */}
                    <div className="mt-4 border border-outline-variant rounded-lg divide-y divide-outline-variant text-xs">
                      <div className="p-2.5 flex items-center justify-between bg-surface-subtle">
                        <span className="text-slate-500 font-mono text-[11px]">{t.portal.primaryElement}</span>
                        <span className="font-medium text-on-surface flex items-center gap-1.5">
                          <span>{elementDetails.label}</span>
                          <span className="text-emerald-600 font-mono text-[10px] bg-emerald-50 px-1 rounded">
                            {elementDetails.ratio}
                          </span>
                        </span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-slate-500 font-mono text-[11px]">{t.portal.arcanaClass}</span>
                        <span className="font-medium text-on-surface truncate max-w-[160px]">
                          {getArcanaLabel(card)}
                        </span>
                      </div>
                      <div className="p-2.5 flex flex-col gap-1 bg-white">
                        <span className="text-slate-500 font-mono text-[11px]">{t.portal.coreKeywords}</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {keywordsList.map((kw: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700 font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Synthesis Pullquote Note (Powered by Gemini AI) */}
              <div className="mt-6 p-4 rounded-lg bg-[#FAF9F6] border-l-2 border-primary border-y border-r border-outline-variant relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {isVi ? "THÔNG ĐIỆP KHẢI HUYỀN · GEMINI AI" : "SYNTHESIS ADVISORY · GEMINI AI"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    <span className="material-symbols-outlined text-[11px]">neurology</span>
                    <span>AI Guidance</span>
                  </span>
                </div>
                <blockquote className="font-headline text-sm md:text-[15px] text-on-surface leading-relaxed">
                  {isLoading && !dailySession ? (
                    <span className="text-slate-400 font-sans text-xs flex items-center gap-2 py-1">
                      <span className="material-symbols-outlined text-sm animate-spin text-primary">sync</span>
                      {isVi
                        ? "Đang đồng bộ trạng thái lá bài hôm nay..."
                        : "Syncing today's card status..."}
                    </span>
                  ) : isFlipping ? (
                    <span className="text-slate-400 font-sans text-xs flex items-center gap-2 py-1">
                      <span className="material-symbols-outlined text-sm animate-spin text-primary">sync</span>
                      {isVi
                        ? "Gemini AI đang rút lá bài từ cơ sở dữ liệu và khởi tạo thông điệp ngày mới..."
                        : "Gemini AI is drawing your card and synthesizing today's mindful guidance..."}
                    </span>
                  ) : !dailySession ? (
                    <span className="text-slate-500 font-sans text-xs block py-1">
                      {isVi
                        ? "Lá bài hôm nay đang ở trạng thái úp. Hãy chạm vào lá bài phía trên để rút bài từ cơ sở dữ liệu và mở thông điệp định hướng cho ngày hôm nay."
                        : "Today's card is currently face down. Tap the card above to draw from the database and reveal your daily synthesis."}
                    </span>
                  ) : guidance.isLong && !isGuidanceExpanded ? (
                    <p>{guidance.previewText}</p>
                  ) : (
                    <div className="space-y-2.5">
                      {guidance.paragraphs.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </blockquote>
                {dailySession && !isLoading && !isFlipping && guidance.isLong && (
                  <button
                    type="button"
                    onClick={() => setIsGuidanceExpanded((prev) => !prev)}
                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-mono font-semibold text-primary hover:text-emerald-700 transition-colors"
                  >
                    <span>
                      {isGuidanceExpanded
                        ? isVi
                          ? "Thu gọn"
                          : "Show less"
                        : isVi
                        ? "Xem thêm"
                        : "Read more"}
                    </span>
                    <span className="material-symbols-outlined text-sm">
                      {isGuidanceExpanded ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Specimen Action Footer */}
            {dailySession?.id && (
              <div className="mt-8 pt-4 border-t border-outline-variant flex items-center justify-end">
                <Link
                  href={`/workbench/${dailySession.id}`}
                  className="text-xs font-semibold text-primary hover:text-emerald-700 flex items-center gap-1 group transition-colors"
                >
                  <span>{t.portal.viewReport}</span>
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">
                    chevron_right
                  </span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* SPECIFIC 3-CARD TOPIC READING SECTION (LOVE · FAMILY · CAREER) */}
        <section id="topic-reading" className="border-b border-outline-variant bg-white grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-8 md:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-outline-variant">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                {isVi
                  ? "TAROT READER KINH NGHIỆM · 3 LÁ KHỞI ĐẦU + LÀM RÕ TỐI ĐA 10 LÁ"
                  : "SEASONED TAROT READER · 3 CARDS + CLARIFIERS UP TO 10 CARDS"}
              </span>
            </div>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface">
              {isVi ? "Rút 3 Lá Bài Cho Câu Hỏi Cụ Thể" : "3-Card Spread for Your Specific Question"}
            </h2>
            <p className="text-sm text-[#475569] mt-2 leading-relaxed max-w-2xl">
              {isVi
                ? "Chọn một trong ba chủ đề Tình cảm, Gia đình hoặc Công việc và đặt câu hỏi của bạn. Hệ thống sẽ rút 3 lá bài kết nối mạch năng lượng, luận giải chi tiết từ góc nhìn của một Tarot Reader nhiều kinh nghiệm và cho phép rút thêm lá làm rõ (tổng tối đa 10 lá)."
                : "Choose Love, Family, or Career and share your specific question. We draw 3 cards, deliver an in-depth reading from an experienced Tarot Reader perspective, and let you draw additional clarifiers up to 10 cards total."}
            </p>

            {/* Topic Selector */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {READING_TOPICS.map((topicItem) => {
                const isActive = selectedTopic === topicItem.id;
                return (
                  <button
                    key={topicItem.id}
                    type="button"
                    onClick={() => {
                      setSelectedTopic(topicItem.id);
                      if (topicError) setTopicError(null);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? "border-primary bg-emerald-50/70 shadow-xs ring-1 ring-primary/30"
                        : "border-outline-variant bg-[#FAF9F6] hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`material-symbols-outlined text-xl ${
                          isActive ? "text-primary" : "text-slate-500"
                        }`}
                      >
                        {topicItem.icon}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isActive ? "bg-primary text-white" : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {isVi ? "3 LÁ" : "3 CARDS"}
                      </span>
                    </div>
                    <div className="font-headline font-bold text-base text-on-surface">
                      {isVi ? topicItem.labelVi : topicItem.labelEn}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      {isVi ? topicItem.descVi : topicItem.descEn}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Question Form */}
            <form onSubmit={handleTopicReadingSubmit} className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="web-topic-question" className="text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold">
                    {isVi
                      ? `Câu hỏi cụ thể về ${activeTopicConfig.labelVi}`
                      : `Your ${activeTopicConfig.labelEn} Question`}
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {topicQuestion.length}/500
                  </span>
                </div>
                <textarea
                  id="web-topic-question"
                  rows={3}
                  maxLength={500}
                  value={topicQuestion}
                  onChange={(e) => {
                    setTopicQuestion(e.target.value);
                    if (topicError) setTopicError(null);
                  }}
                  placeholder={isVi ? activeTopicConfig.placeholderVi : activeTopicConfig.placeholderEn}
                  className="w-full px-3.5 py-2.5 text-sm border border-outline-variant rounded-xl bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Sample Question Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {isVi ? "Gợi ý nhanh:" : "Quick prompts:"}
                </span>
                {(isVi ? activeTopicConfig.sampleQuestionsVi : activeTopicConfig.sampleQuestionsEn).map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopicQuestion(sample);
                      if (topicError) setTopicError(null);
                    }}
                    className="text-left text-xs px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-emerald-50 border border-outline-variant hover:border-primary/40 text-slate-700 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {topicError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {topicError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500 font-mono">
                  {isVi
                    ? "Mỗi lượt rút 3 lá · Vào Workbench để rút thêm lá làm rõ (tối đa 10 lá)"
                    : "Draws 3 cards · Continue in Workbench for clarifiers (max 10 cards)"}
                </span>
                <button
                  type="submit"
                  disabled={isSubmittingTopic}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-6 py-3 rounded-lg shadow-xs transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-base ${isSubmittingTopic ? "animate-spin" : ""}`}>
                    {isSubmittingTopic ? "progress_activity" : "auto_awesome"}
                  </span>
                  <span>
                    {isSubmittingTopic
                      ? isVi
                        ? "Tarot Reader đang rút 3 lá & luận giải..."
                        : "Drawing 3 cards & reading..."
                      : isVi
                      ? "Rút 3 Lá & Luận Giải Chi Tiết"
                      : "Draw 3 Cards & Get Deep Reading"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Preview Column: 3-Card Spread Blueprint */}
          <div className="lg:col-span-5 p-8 md:p-10 bg-[#FAF9F6] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  {isVi ? "CẤU TRÚC 3 LÁ · BÀN TRẢI CHỦ ĐỀ" : "3-CARD SPREAD ARCHITECTURE"}
                </span>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isVi ? activeTopicConfig.labelVi : activeTopicConfig.labelEn}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {(isVi ? activeTopicConfig.positionsVi : activeTopicConfig.positionsEn).map((posTitle, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-outline-variant rounded-xl p-3 text-center flex flex-col items-center justify-between min-h-[210px] shadow-2xs"
                  >
                    <span className="font-mono text-[10px] text-primary font-bold">0{idx + 1}</span>
                    <div className="my-2 w-14 h-24 rounded-md border border-amber-500/60 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-amber-300 text-base">
                        {isSubmittingTopic ? "progress_activity" : "auto_awesome"}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-800 leading-tight line-clamp-2">
                      {posTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-white border border-outline-variant rounded-xl space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                {isVi ? "PHƯƠNG PHÁP LUẬN GIẢI CHUYÊN SÂU" : "EXPERIENCED READER METHODOLOGY"}
              </div>
              <p>
                {isVi
                  ? "Mỗi trải bài phân tích sự tương tác giữa 3 vị trí theo nguyên tố, chiều Xuôi/Ngược và tâm lý thực tế sau câu hỏi của bạn. Sau khi mở bài, bạn vẫn có thể rút thêm tối đa 7 lá làm rõ (tổng 10 lá) và hỏi đáp trực tiếp trong ngày."
                  : "Each spread reads elemental interactions, upright/reversed polarity, and real-world nuance around your question. Once opened, you can draw up to 7 clarifier cards (10 total) and ask follow-up questions today."}
              </p>
            </div>
          </div>
        </section>

        {/* ARCHIVE CURATION STRIP */}
        <section className="p-6 lg:px-8 bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span>{t.portal.archiveFooter}</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">{t.portal.archiveFooterSub}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/catalog-picker" className="hover:text-on-surface underline transition-colors">
              {t.portal.browseManual}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default function EditorialPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <EditorialPortalContent />
    </Suspense>
  );
}
