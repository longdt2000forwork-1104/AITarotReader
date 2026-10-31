"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { TAROT_CARDS, TarotCard, getCardById } from "@/data/tarotCards";

export default function PhysicalDeckManualPickerPage() {
  const router = useRouter();
  const { locale } = useLanguage();

  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3>(2);
  const [selectedCards, setSelectedCards] = useState<{
    1: { id: number; name: string; isReversed: boolean; image: string } | null;
    2: { id: number; name: string; isReversed: boolean; image: string } | null;
    3: { id: number; name: string; isReversed: boolean; image: string } | null;
  }>({
    1: {
      id: 1,
      name: "I. The Magician",
      isReversed: false,
      image: "/decks/rider-waite-1909/cards/01_the_magician.webp",
    },
    2: null,
    3: null,
  });

  const [search, setSearch] = useState("");
  const [suitFilter, setSuitFilter] = useState<string>("ALL");
  const [isReversed, setIsReversed] = useState(false);
  const [highlightedCard, setHighlightedCard] = useState<TarotCard | null>(null);

  const filteredCards = TAROT_CARDS.filter((card) => {
    const matchesSuit = suitFilter === "ALL" || card.suit === suitFilter;
    const matchesSearch =
      card.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      card.nameVi.toLowerCase().includes(search.toLowerCase()) ||
      card.number.toLowerCase().includes(search.toLowerCase()) ||
      card.keywordsEn.toLowerCase().includes(search.toLowerCase()) ||
      card.keywordsVi.toLowerCase().includes(search.toLowerCase());
    return matchesSuit && matchesSearch;
  });

  const handleSelectCard = (card: TarotCard) => {
    setHighlightedCard(card);
    setSelectedCards((prev) => ({
      ...prev,
      [activeSlot]: {
        id: card.id,
        name: `${card.number}. ${locale === "vi" ? card.nameVi : card.nameEn}`,
        isReversed: isReversed,
        image: card.image,
      },
    }));

    // Auto advance target slot
    if (activeSlot === 1) setActiveSlot(2);
    else if (activeSlot === 2) setActiveSlot(3);
  };

  const allAssigned = selectedCards[1] && selectedCards[2] && selectedCards[3];

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[420px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-32 border-x border-[#E2E8F0] shadow-sm">
        {/* 1. Header Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
          <Link
            href="/app/readings/new"
            className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold hover:text-slate-900 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back</span>
          </Link>
          <div className="text-center px-1">
            <h1 className="font-headline font-bold text-sm tracking-tight text-slate-900">
              {locale === "vi" ? "Bộ Bài Vật Lý · Nhập Thủ Công" : "Physical Deck Manual Picker"}
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              Rider-Waite 1909 Canon (78 Cards)
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              78 Cards
            </span>
          </div>
        </header>

        {/* 2. Pinned 3-Slot Assignment Matrix */}
        <section className="sticky top-[49px] z-30 bg-[#F8FAFC] border-b border-[#E2E8F0] p-3 grid grid-cols-3 gap-2 shadow-2xs">
          {/* Slot 1 */}
          <button
            type="button"
            onClick={() => setActiveSlot(1)}
            className={`p-2 rounded-lg text-left flex flex-col justify-between transition-all min-h-[82px] ${
              activeSlot === 1
                ? "bg-[#ECFDF5] border-[1.5px] border-primary shadow-xs"
                : "bg-white border border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[9px] uppercase font-bold ${activeSlot === 1 ? "text-primary" : "text-slate-500"}`}>
                01 · SITUATION
              </span>
              {selectedCards[1] && (
                <span className="material-symbols-outlined text-primary text-[12px]">check</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 my-1">
              {selectedCards[1]?.image ? (
                <img
                  src={selectedCards[1].image}
                  alt={selectedCards[1].name}
                  className="w-5 h-8 object-cover rounded shrink-0 border border-slate-200"
                />
              ) : null}
              <p className="font-headline font-bold text-xs text-slate-900 truncate">
                {selectedCards[1]?.name || "Empty"}
              </p>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">
              {selectedCards[1] ? (selectedCards[1].isReversed ? "Reversed ↓" : "Upright ↑") : "Waiting..."}
            </span>
          </button>

          {/* Slot 2 */}
          <button
            type="button"
            onClick={() => setActiveSlot(2)}
            className={`p-2 rounded-lg text-left flex flex-col justify-between transition-all min-h-[82px] ${
              activeSlot === 2
                ? "bg-[#ECFDF5] border-[1.5px] border-primary shadow-xs ring-1 ring-emerald-200"
                : "bg-white border border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[9px] uppercase font-bold ${activeSlot === 2 ? "text-primary" : "text-slate-500"}`}>
                02 · ACTION
              </span>
              {selectedCards[2] ? (
                <span className="material-symbols-outlined text-primary text-[12px]">check</span>
              ) : activeSlot === 2 ? (
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 my-1">
              {selectedCards[2]?.image ? (
                <img
                  src={selectedCards[2].image}
                  alt={selectedCards[2].name}
                  className="w-5 h-8 object-cover rounded shrink-0 border border-slate-200"
                />
              ) : null}
              <p className="font-headline font-bold text-xs text-slate-900 truncate">
                {selectedCards[2]?.name || (activeSlot === 2 ? "Selecting..." : "Empty")}
              </p>
            </div>
            <span className="text-[9px] text-primary font-mono font-semibold">
              {selectedCards[2] ? (selectedCards[2].isReversed ? "Reversed ↓" : "Upright ↑") : activeSlot === 2 ? "ACTIVE" : "Waiting..."}
            </span>
          </button>

          {/* Slot 3 */}
          <button
            type="button"
            onClick={() => setActiveSlot(3)}
            className={`p-2 rounded-lg text-left flex flex-col justify-between transition-all min-h-[82px] ${
              activeSlot === 3
                ? "bg-[#ECFDF5] border-[1.5px] border-primary shadow-xs"
                : "bg-white border border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[9px] uppercase font-bold ${activeSlot === 3 ? "text-primary" : "text-slate-500"}`}>
                03 · OUTCOME
              </span>
              {selectedCards[3] && (
                <span className="material-symbols-outlined text-primary text-[12px]">check</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 my-1">
              {selectedCards[3]?.image ? (
                <img
                  src={selectedCards[3].image}
                  alt={selectedCards[3].name}
                  className="w-5 h-8 object-cover rounded shrink-0 border border-slate-200"
                />
              ) : null}
              <p className="font-headline font-bold text-xs text-slate-900 truncate">
                {selectedCards[3]?.name || "Empty"}
              </p>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">
              {selectedCards[3] ? (selectedCards[3].isReversed ? "Reversed ↓" : "Upright ↑") : "Waiting..."}
            </span>
          </button>
        </section>

        {/* 3. Search & Suit Filter Bar */}
        <section className="p-3 bg-white border-b border-[#E2E8F0] space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search card by name, roman numeral, keywords..."
              className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
            {["ALL", "MAJOR", "WANDS", "CUPS", "SWORDS", "PENTACLES"].map((suit) => (
              <button
                key={suit}
                type="button"
                onClick={() => setSuitFilter(suit)}
                className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                  suitFilter === suit
                    ? "bg-slate-900 text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {suit}
              </button>
            ))}
          </div>
        </section>

        {/* 4. 3-Column Tarot Card Grid with Real Images */}
        <main className="p-3 grid grid-cols-3 gap-2 flex-1 overflow-y-auto">
          {filteredCards.map((card) => {
            const isAssigned = Object.values(selectedCards).some((c) => c?.id === card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectCard(card)}
                className={`p-2 bg-white rounded-lg border text-left flex flex-col justify-between transition-all hover:border-primary shadow-2xs group ${
                  isAssigned ? "border-primary bg-emerald-50/20 ring-1 ring-primary" : "border-[#E2E8F0]"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 pb-1">
                    <span>{card.number}</span>
                    <span className="text-[8px] bg-slate-100 px-1 py-0.2 rounded text-slate-500">
                      {card.suit.slice(0, 3)}
                    </span>
                  </div>
                  {/* Real Card Image */}
                  <div className="w-full aspect-[2/3] my-1 rounded overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={card.image}
                      alt={card.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <div className="font-headline font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                    {locale === "vi" ? card.nameVi : card.nameEn}
                  </div>
                </div>
                <div className="mt-1 text-[8px] text-slate-500 font-mono truncate">
                  {card.keywordsVi}
                </div>
              </button>
            );
          })}
        </main>

        {/* 5. Sticky Bottom Action Dock */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t border-[#E2E8F0] p-3 shadow-lg z-40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-700">Card Orientation:</span>
              <button
                type="button"
                onClick={() => setIsReversed(!isReversed)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                  isReversed
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-emerald-50 text-emerald-900 border-emerald-300"
                }`}
              >
                {isReversed ? "Reversed (Ngược) ↓" : "Upright (Xuôi) ↑"}
              </button>
            </div>
            <span className="text-xs font-mono text-slate-500">Cost: 10 CR</span>
          </div>

          <button
            type="button"
            disabled={!allAssigned}
            onClick={() => router.push("/app/readings/demo-session")}
            className={`w-full py-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
              allAssigned
                ? "bg-primary text-white hover:bg-primary-hover shadow-md cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <span>{allAssigned ? "Analyze Physical Spread (10 CR) →" : "Assign All 3 Cards To Continue"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
