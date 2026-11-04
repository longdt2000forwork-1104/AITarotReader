"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { TAROT_CARDS, TarotCard } from "@/data/tarotCards";
import { ReadingSessionDto } from "@/types/api";

export default function EditorialPortalPage() {
  const { t, locale } = useLanguage();
  const isVi = locale === "vi";

  const [dailySession, setDailySession] = useState<ReadingSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedrawing, setIsRedrawing] = useState(false);

  const getTodayDateKey = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const loadDailyCard = async (force: boolean = false) => {
    if (force) {
      setIsRedrawing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const todayKey = getTodayDateKey();

      // 1. Check local client cache for today's card if not force redrawing
      if (!force && typeof window !== "undefined") {
        const cached = localStorage.getItem("ai_tarot_daily_draw");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.dateKey === todayKey && parsed.session) {
              setDailySession(parsed.session);
              setIsLoading(false);
              return;
            }
          } catch {
            // ignore cache parse error
          }
        }
      }

      // 2. Fetch or trigger new draw via API
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
      console.warn("Failed to fetch daily tarot card:", err);
    } finally {
      setIsLoading(false);
      setIsRedrawing(false);
    }
  };

  useEffect(() => {
    loadDailyCard(false);
  }, [locale]);

  // Resolve current active card (fallback to card 19 The Sun)
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

  // Resolve Element mapping
  const getElementDetails = (element: string) => {
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

  const elementDetails = getElementDetails(card.element);

  // Resolve Arcana label
  const getArcanaLabel = (c: any) => {
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
  const rawKeywords: string = String((isVi ? card.keywordsVi : card.keywordsEn) || "");
  const keywordsList: string[] = rawKeywords
    .split(/[·,]/)
    .map((k: string) => k.trim())
    .filter(Boolean);

  return (
    <>
      <EditorialHeader activeTab="daily" />

      {/* MAIN EDITORIAL CANVASES (1280px+ Wide Responsive Layout) */}
      <main suppressHydrationWarning className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* 2-COLUMN HERO EDITORIAL GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] border-b border-outline-variant">
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
                <Link
                  href="/workbench/demo-session"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-6 py-3.5 rounded-lg transition-all active:scale-[0.98]"
                >
                  <span>{t.portal.openWorkbench}</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
                <Link
                  href="/catalog-picker"
                  className="inline-flex items-center gap-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-on-surface text-sm font-medium px-5 py-3.5 rounded-lg transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">edit_note</span>
                  <span>{t.portal.logPhysical}</span>
                </Link>
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
                  <span className={`w-1.5 h-1.5 rounded-full ${isRedrawing ? "bg-amber-500 animate-ping" : "bg-slate-400"}`} />
                  <span>{t.portal.specimenHeader}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadDailyCard(true)}
                    disabled={isLoading || isRedrawing}
                    className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 hover:bg-emerald-50/50 transition-colors disabled:opacity-50"
                    title={isVi ? "Bốc lại lá bài ngẫu nhiên cho hôm nay" : "Redraw a new random card"}
                  >
                    <span className={`material-symbols-outlined text-[13px] ${isRedrawing ? "animate-spin text-primary" : ""}`}>
                      autorenew
                    </span>
                    <span>{isRedrawing ? (isVi ? "Đang rút..." : "Drawing...") : (isVi ? "Rút lại" : "Redraw")}</span>
                  </button>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t.portal.drawnBadge}
                  </span>
                </div>
              </div>

              {/* Specimen Card + Table Display Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                {/* Tarot Card Visual Specimen Frame */}
                <div className="sm:col-span-5 bg-[#FAF9F6] border border-outline-variant rounded-lg p-3 text-center flex flex-col items-center justify-between min-h-[250px] shadow-sm relative overflow-hidden">
                  <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-200 pb-1">
                    <span>Rider-Waite 1909</span>
                    <span>{card.suit === "MAJOR" || (card as any).arcana === "MAJOR" || !card.suit ? (isVi ? "Bộ Ẩn Chính" : "Major Arcana") : card.suit}</span>
                  </div>

                  {/* Real Tarot Card Artwork */}
                  <div className="my-2 relative group cursor-pointer">
                    <img
                      src={card.image}
                      alt={`${card.number} ${isVi ? card.nameVi : card.nameEn}`}
                      className={`w-28 h-48 object-cover rounded border border-slate-200 shadow-md group-hover:scale-105 transition-all duration-300 ${
                        isReversed ? "rotate-180" : ""
                      } ${isRedrawing ? "opacity-40 blur-xs scale-95" : "opacity-100 scale-100"}`}
                    />
                    {isRedrawing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl animate-spin">
                          progress_activity
                        </span>
                      </div>
                    )}
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
                <blockquote className="font-headline italic text-sm md:text-[15px] text-on-surface leading-snug">
                  {isRedrawing ? (
                    <span className="text-slate-400 not-italic font-sans text-xs flex items-center gap-2 py-1">
                      <span className="material-symbols-outlined text-sm animate-spin text-primary">sync</span>
                      {isVi
                        ? "Gemini AI đang lắng nghe trường năng lượng và khởi tạo thông điệp ngày mới..."
                        : "Gemini AI is synthesizing today's mindful guidance..."}
                    </span>
                  ) : (
                    `“${aiMessage}”`
                  )}
                </blockquote>
              </div>
            </div>

            {/* Specimen Action Footer */}
            <div className="mt-8 pt-4 border-t border-outline-variant flex items-center justify-between">
              <Link
                href="/studio-billing"
                className="text-xs font-mono font-medium text-slate-600 hover:text-on-surface flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">file_download</span>
                <span>{t.portal.exportPoster}</span>
              </Link>
              <Link
                href={`/workbench/${dailySession?.id || "demo-session"}`}
                className="text-xs font-semibold text-primary hover:text-emerald-700 flex items-center gap-1 group transition-colors"
              >
                <span>{t.portal.viewReport}</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">
                  chevron_right
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: SPREAD ARCHITECTURE SPECIFICATION TABLE */}
        <section className="border-b border-outline-variant bg-white">
          <div className="px-6 lg:px-8 py-3 bg-[#F8FAFC] border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-sm">grid_view</span>
              <span className="font-mono text-xs uppercase tracking-widest text-slate-600 font-medium">
                {t.portal.spreadHeader}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{t.portal.spreadSub}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
            {/* Spread Card 1 */}
            <div className="p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-primary font-bold">01 PROTOCOL</span>
                  <span className="text-[11px] font-mono text-slate-400">1 CARD</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  {t.portal.protocol1Title}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  {t.portal.protocol1Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">{t.portal.rateFree}</span>
                <Link
                  href="/app/readings/draw"
                  className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <span>{t.portal.deploy}</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              </div>
            </div>

            {/* Spread Card 2 */}
            <div className="p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-primary font-bold">02 PROTOCOL</span>
                  <span className="text-[11px] font-mono text-slate-400">3 CARDS</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  {t.portal.protocol2Title}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  {t.portal.protocol2Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">{t.portal.rate10}</span>
                <Link
                  href="/workbench/demo-session"
                  className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <span>{t.portal.deploy}</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              </div>
            </div>

            {/* Spread Card 3 */}
            <div className="p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-primary font-bold">03 PROTOCOL</span>
                  <span className="text-[11px] font-mono text-slate-400">5 CARDS</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  {t.portal.protocol3Title}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  {t.portal.protocol3Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">{t.portal.rate15}</span>
                <Link
                  href="/workbench/demo-session"
                  className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <span>{t.portal.deploy}</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              </div>
            </div>

            {/* Spread Card 4 */}
            <div className="p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-primary font-bold">04 PROTOCOL</span>
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
                    25 CR / PRO
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  {t.portal.protocol4Title}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  {t.portal.protocol4Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">{t.portal.rate25}</span>
                <Link
                  href="/workbench/demo-session"
                  className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <span>{t.portal.deploy}</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              </div>
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
            <Link href="/decks-archive" className="hover:text-on-surface underline transition-colors">
              {t.portal.contactSheet}
            </Link>
          </div>
        </section>
      </main>

      <MobileBottomNav activeTab="home" />
    </>
  );
}
