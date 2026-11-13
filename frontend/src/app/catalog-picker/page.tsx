"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditorialHeader from "@/components/EditorialHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { TAROT_CARDS, TarotCard } from "@/data/tarotCards";

export default function CatalogPickerPage() {
  const { locale, t } = useLanguage();
  const isVi = locale === "vi";

  const [cardsList, setCardsList] = useState<TarotCard[]>(TAROT_CARDS);
  const [selectedSuit, setSelectedSuit] = useState<"ALL" | "MAJOR" | "WANDS" | "CUPS" | "SWORDS" | "PENTACLES">("ALL");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

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

  return (
    <>
      <EditorialHeader activeTab="catalog" />

      {/* WEB — 78-CARD REFERENCE ENCYCLOPEDIA */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white pb-20 lg:pb-0">
        {/* Encyclopedia Header */}
        <section className="px-6 py-6 linen-texture border-b border-outline-variant">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block">
                {t.catalog.kicker}
              </span>
              <h1 className="font-headline font-bold text-2xl text-on-surface mt-0.5">
                {t.catalog.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/workbench/demo-session"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>{t.catalog.proceed}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Selected Card Inspection Drawer */}
          {selectedCard && (
            <div className="mt-4 p-4 bg-white border border-outline-variant rounded-lg shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.nameEn}
                  className="w-14 h-24 object-cover rounded border border-slate-200 shrink-0 shadow-xs"
                />
                <div>
                  <div className="font-mono text-[10px] font-semibold text-primary uppercase">
                    #{selectedCard.number} · {selectedCard.suit} · {selectedCard.element}
                  </div>
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    {isVi ? `${selectedCard.nameVi} (${selectedCard.nameEn})` : `${selectedCard.nameEn} (${selectedCard.nameVi})`}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    {isVi ? selectedCard.meaningUprightVi : selectedCard.meaningUprightEn}
                  </p>
                  <div className="text-[11px] font-mono text-slate-500 mt-1.5">
                    {isVi ? selectedCard.keywordsVi : selectedCard.keywordsEn}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="text-xs font-mono text-slate-400 hover:text-on-surface px-2.5 py-1 border border-slate-200 rounded self-end sm:self-center"
              >
                {isVi ? "Đóng ✕" : "Close ✕"}
              </button>
            </div>
          )}
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
            const isSelected = selectedCard?.id === card.id;
            const primaryName = isVi ? card.nameVi : card.nameEn;
            const secondaryName = isVi ? card.nameEn : card.nameVi;
            const keywords = isVi ? card.keywordsVi : card.keywordsEn;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`bg-white border rounded-lg p-2.5 text-center cursor-pointer flex flex-col justify-between group transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  isSelected
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
          {filteredCards.length === 0 && (
            <div className="col-span-full py-16 text-center flex flex-col items-center justify-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
              <p className="text-sm text-slate-500">
                {isVi ? "Không tìm thấy lá bài phù hợp với từ khóa." : "No tarot cards match your search."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedSuit("ALL");
                }}
                className="px-4 py-2 text-xs font-medium bg-white border border-outline-variant rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                {isVi ? "Đặt lại bộ lọc" : "Reset filters"}
              </button>
            </div>
          )}
        </section>
      </main>

      <MobileBottomNav activeTab="decks" />
    </>
  );
}
