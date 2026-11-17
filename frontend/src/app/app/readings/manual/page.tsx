"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { TAROT_CARDS, TarotCard } from "@/data/tarotCards";

export default function MobileCatalogPickerPage() {
  const { locale, setLocale, t } = useLanguage();
  const isVi = locale === "vi";

  const [cardsList, setCardsList] = useState<TarotCard[]>(TAROT_CARDS);
  const [selectedSuit, setSelectedSuit] = useState<"ALL" | "MAJOR" | "WANDS" | "CUPS" | "SWORDS" | "PENTACLES">("ALL");
  const [search, setSearch] = useState("");
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

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

  const suitsList: Array<{ id: "ALL" | "MAJOR" | "WANDS" | "CUPS" | "SWORDS" | "PENTACLES"; label: string }> = [
    { id: "ALL", label: isVi ? "Tất cả (78)" : "All (78)" },
    { id: "MAJOR", label: isVi ? "Ẩn Chính" : "Major" },
    { id: "WANDS", label: isVi ? "Gậy" : "Wands" },
    { id: "CUPS", label: isVi ? "Cốc" : "Cups" },
    { id: "SWORDS", label: isVi ? "Kiếm" : "Swords" },
    { id: "PENTACLES", label: isVi ? "Tiền" : "Pentacles" },
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
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#FAF9F6] flex flex-col border-x border-outline-variant pb-24">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{isVi ? "Trang Chủ" : "Home"}</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface uppercase">
          {isVi ? "TRA CỨU 78 LÁ BÀI" : "78-CARD CATALOG"}
        </span>

        {/* Language Switcher */}
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
      </header>

      <main className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined text-base text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        {/* Suit Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {suitsList.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSuit(s.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors ${
                selectedSuit === s.id
                  ? "bg-primary text-white font-semibold"
                  : "bg-white border border-outline-variant text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Count Info */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>
            {isVi ? `Hiển thị ${filteredCards.length} lá bài` : `Showing ${filteredCards.length} cards`}
          </span>
          <Link href="/app/home" className="text-primary font-semibold hover:underline">
            {isVi ? "Về Lật Bài Hôm Nay →" : "Daily Card →"}
          </Link>
        </div>

        {/* 3-column Compact Card Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {filteredCards.map((card) => {
            const name = isVi ? card.nameVi : card.nameEn;
            return (
              <button
                type="button"
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="bg-white border border-outline-variant hover:border-primary rounded-lg p-2 text-center flex flex-col justify-between shadow-2xs transition-all group"
              >
                <div className="aspect-[3/5] w-full rounded overflow-hidden border border-slate-100 bg-[#FAF9F6] mb-1.5">
                  <img
                    src={card.image}
                    alt={name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="font-mono text-[9px] text-slate-400">{card.number}</div>
                <div className="font-headline font-bold text-[10px] text-slate-900 line-clamp-1">
                  {name}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Card Meaning Inspection Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[390px] w-full p-5 shadow-xl border border-outline-variant relative space-y-3">
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-lg leading-none"
            >
              ×
            </button>
            <div className="flex gap-3.5 items-start">
              <img
                src={selectedCard.image}
                alt={isVi ? selectedCard.nameVi : selectedCard.nameEn}
                className="w-20 h-34 object-cover rounded border border-slate-200 shadow-sm shrink-0"
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-[10px] font-mono text-primary uppercase font-bold">
                  {selectedCard.suit === "MAJOR" ? (isVi ? "Bộ Ẩn Chính" : "Major Arcana") : selectedCard.suit}
                </div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  {selectedCard.number} — {isVi ? selectedCard.nameVi : selectedCard.nameEn}
                </h3>
                <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                  {isVi ? selectedCard.keywordsVi : selectedCard.keywordsEn}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {isVi ? selectedCard.meaningUprightVi : selectedCard.meaningUprightEn}
            </p>
          </div>
        </div>
      )}

      <MobileBottomNav activeTab="catalog" />
    </div>
  );
}
