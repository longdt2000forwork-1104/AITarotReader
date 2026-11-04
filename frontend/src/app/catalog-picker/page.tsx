"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { TAROT_CARDS, TarotCard } from "@/data/tarotCards";

export default function CatalogPickerPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const isVi = locale === "vi";

  const [cardsList, setCardsList] = useState<TarotCard[]>(TAROT_CARDS);
  const [selectedSuit, setSelectedSuit] = useState<"ALL" | "MAJOR" | "WANDS" | "CUPS" | "SWORDS" | "PENTACLES">("ALL");
  const [search, setSearch] = useState("");
  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slots, setSlots] = useState<{
    1: TarotCard | null;
    2: TarotCard | null;
    3: TarotCard | null;
  }>({
    1: null,
    2: null,
    3: null,
  });

  // Load cards directly from Supabase backend
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await apiClient.tarot.getCards();
        if (res.data && res.data.length > 0) {
          const mapped: TarotCard[] = res.data.map((c) => {
            const staticMatch = TAROT_CARDS.find((sc) => sc.id === c.id);
            return {
              id: c.id,
              slug: c.slug || staticMatch?.slug || `card_${c.id}`,
              number: staticMatch?.number || String(c.cardOrder ?? c.id),
              nameEn: c.nameEn,
              nameVi: c.nameVi,
              suit: (staticMatch?.suit || (c.arcana === "MAJOR" ? "MAJOR" : c.suit) || "MAJOR") as any,
              element: (c.element || staticMatch?.element || "Fire") as any,
              image: c.imageUrl || staticMatch?.image || "/decks/rider-waite-1909/cards/00_the_fool.webp",
              meaningUprightVi: c.meaningUprightVi || staticMatch?.meaningUprightVi || "",
              meaningUprightEn: c.meaningUprightEn || staticMatch?.meaningUprightEn || "",
              keywordsVi: c.keywordsUprightVi || staticMatch?.keywordsVi || "",
              keywordsEn: c.keywordsUprightEn || staticMatch?.keywordsEn || "",
            };
          });
          setCardsList(mapped);
        }
      } catch (err) {
        console.warn("Using local card catalog fallback:", err);
      }
    }
    loadCatalog();
  }, []);

  const suitsList: Array<{ id: "ALL" | "MAJOR" | "WANDS" | "CUPS" | "SWORDS" | "PENTACLES"; label: string; count: number }> = [
    { id: "ALL", label: t.catalog.allCards, count: 78 },
    { id: "MAJOR", label: t.catalog.majorArcana, count: 22 },
    { id: "WANDS", label: t.catalog.wands, count: 14 },
    { id: "CUPS", label: t.catalog.cups, count: 14 },
    { id: "SWORDS", label: t.catalog.swords, count: 14 },
    { id: "PENTACLES", label: t.catalog.pentacles, count: 14 },
  ];

  const filteredCards = cardsList.filter((card) => {
    const matchSuit = selectedSuit === "ALL" || card.suit === selectedSuit;
    const matchSearch =
      card.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      card.nameVi.toLowerCase().includes(search.toLowerCase()) ||
      card.number.toLowerCase().includes(search.toLowerCase()) ||
      card.keywordsEn.toLowerCase().includes(search.toLowerCase()) ||
      card.keywordsVi.toLowerCase().includes(search.toLowerCase());
    return matchSuit && matchSearch;
  });

  const handleCardClick = (card: TarotCard) => {
    setSlots((prev) => ({
      ...prev,
      [activeSlot]: card,
    }));
    if (activeSlot === 1) setActiveSlot(2);
    else if (activeSlot === 2) setActiveSlot(3);
  };

  const handleProceedToWorkbench = async () => {
    setIsSubmitting(true);
    try {
      const selectedCards = [slots[1], slots[2], slots[3]].filter(Boolean);
      const cardsPayload = selectedCards.map((c, idx) => ({
        cardId: c!.id,
        positionIndex: idx,
        positionNameEn: idx === 0 ? "Situation" : idx === 1 ? "Action" : "Outcome",
        positionNameVi: idx === 0 ? "Hiện Trạng" : idx === 1 ? "Hành Động" : "Kết Quả",
        isReversed: false,
        isClarifier: false,
      }));

      const res = await apiClient.readings.create({
        spreadId: "S-02",
        deckId: "ED-01",
        inputMode: "MANUAL",
        persona: "IDEA_SPARK",
        question: isVi ? "Ghi chép trải bài thủ công 3 lá từ bộ bài vật lý" : "Manual 3-card spread observation",
        cards: cardsPayload,
      });

      if (res.data?.id) {
        router.push(`/workbench/${res.data.id}`);
        return;
      }
    } catch (err) {
      console.error("Failed to create manual reading session:", err);
    } finally {
      setIsSubmitting(false);
    }
    router.push("/workbench/demo-session");
  };

  return (
    <>
      <EditorialHeader activeTab="catalog" />

      {/* WEB — 78-CARD REFERENCE & MANUAL INPUT (SCR-W03) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Pinned Assignment Bar for 3 Cards */}
        <section className="px-6 py-4 bg-[#FAF9F6] border-b border-outline-variant sticky top-[57px] z-30 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block">
                {t.catalog.kicker}
              </span>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                {t.catalog.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500">{t.catalog.spreadLabel}</span>
              <button
                type="button"
                onClick={handleProceedToWorkbench}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? (isVi ? "Đang tạo phiên..." : "Creating...") : t.catalog.proceed}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* 3 Slot Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {/* Slot 1 */}
            <div
              onClick={() => setActiveSlot(1)}
              className={`p-3 bg-white rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                activeSlot === 1
                  ? "border-2 border-primary shadow-sm bg-emerald-50/10"
                  : "border border-outline-variant hover:border-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {slots[1] ? (
                  <img
                    src={slots[1].image}
                    alt={slots[1].nameEn}
                    className="w-9 h-14 object-cover rounded border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-14 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </div>
                )}
                <div>
                  <span className={`text-[10px] font-mono font-semibold uppercase ${activeSlot === 1 ? "text-primary" : "text-slate-400"}`}>
                    {t.catalog.slot1} {activeSlot === 1 ? "[ACTIVE]" : ""}
                  </span>
                  <div className="text-xs font-bold text-on-surface mt-0.5 truncate max-w-[150px]">
                    {slots[1] ? `${slots[1].number}. ${locale === "vi" ? slots[1].nameVi : slots[1].nameEn}` : t.catalog.clickToSet}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {slots[1] ? (locale === "vi" ? slots[1].nameEn : slots[1].nameVi) : t.catalog.emptySlot}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${slots[1] ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-slate-400"}`}>
                {slots[1] ? t.catalog.setDone : "[Slot 1]"}
              </span>
            </div>

            {/* Slot 2 */}
            <div
              onClick={() => setActiveSlot(2)}
              className={`p-3 bg-white rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                activeSlot === 2
                  ? "border-2 border-primary shadow-sm bg-emerald-50/10"
                  : "border border-outline-variant hover:border-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {slots[2] ? (
                  <img
                    src={slots[2].image}
                    alt={slots[2].nameEn}
                    className="w-9 h-14 object-cover rounded border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-14 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </div>
                )}
                <div>
                  <span className={`text-[10px] font-mono font-semibold uppercase ${activeSlot === 2 ? "text-primary" : "text-slate-400"}`}>
                    {t.catalog.slot2} {activeSlot === 2 ? "[ACTIVE]" : ""}
                  </span>
                  <div className="text-xs font-bold text-on-surface mt-0.5 truncate max-w-[150px]">
                    {slots[2] ? `${slots[2].number}. ${locale === "vi" ? slots[2].nameVi : slots[2].nameEn}` : t.catalog.clickToSet}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {slots[2] ? (locale === "vi" ? slots[2].nameEn : slots[2].nameVi) : t.catalog.emptySlot}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${slots[2] ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-slate-400"}`}>
                {slots[2] ? t.catalog.setDone : "[Slot 2]"}
              </span>
            </div>

            {/* Slot 3 */}
            <div
              onClick={() => setActiveSlot(3)}
              className={`p-3 bg-white rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                activeSlot === 3
                  ? "border-2 border-primary shadow-sm bg-emerald-50/10"
                  : "border border-outline-variant hover:border-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {slots[3] ? (
                  <img
                    src={slots[3].image}
                    alt={slots[3].nameEn}
                    className="w-9 h-14 object-cover rounded border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-14 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </div>
                )}
                <div>
                  <span className={`text-[10px] font-mono font-semibold uppercase ${activeSlot === 3 ? "text-primary" : "text-slate-400"}`}>
                    {t.catalog.slot3} {activeSlot === 3 ? "[ACTIVE]" : ""}
                  </span>
                  <div className="text-xs font-bold text-on-surface mt-0.5 truncate max-w-[150px]">
                    {slots[3] ? `${slots[3].number}. ${locale === "vi" ? slots[3].nameVi : slots[3].nameEn}` : t.catalog.clickToSet}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {slots[3] ? (locale === "vi" ? slots[3].nameEn : slots[3].nameVi) : t.catalog.emptySlot}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${slots[3] ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-slate-400"}`}>
                {slots[3] ? t.catalog.setDone : "[Slot 3]"}
              </span>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="px-6 py-3.5 bg-white border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Suits Tab */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
            {suitsList.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedSuit(st.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedSuit === st.id
                    ? "bg-slate-900 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{st.label}</span>
                <span className="ml-1 opacity-60">({st.count})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.catalog.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-subtle border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </section>

        {/* 78-Card Contact Sheet Visual Grid */}
        <section className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 bg-[#FAF9F6]">
          {filteredCards.map((card) => {
            const isAssigned =
              slots[1]?.id === card.id ||
              slots[2]?.id === card.id ||
              slots[3]?.id === card.id;

            const primaryName = isVi ? card.nameVi : card.nameEn;
            const secondaryName = isVi ? card.nameEn : card.nameVi;
            const keywords = isVi ? card.keywordsVi : card.keywordsEn;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`bg-white border rounded-lg p-2.5 text-center cursor-pointer flex flex-col justify-between group transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  isAssigned
                    ? "border-primary ring-2 ring-emerald-200 bg-emerald-50/15"
                    : "border-outline-variant hover:border-primary"
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-slate-100 pb-1">
                  <span>#{card.number}</span>
                  <span className="uppercase text-[8px] bg-slate-100 px-1 py-0.2 rounded font-bold text-slate-600">
                    {card.element}
                  </span>
                </div>

                {/* Real Card Art Image */}
                <div className="py-2 flex items-center justify-center">
                  <div className="w-24 h-38 overflow-hidden rounded border border-slate-200 bg-slate-50 relative shadow-2xs group-hover:shadow-sm">
                    <img
                      src={card.image}
                      alt={card.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1.5">
                  <div className="font-headline font-bold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                    {primaryName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{secondaryName}</div>
                  <div className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
                    {keywords}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}
