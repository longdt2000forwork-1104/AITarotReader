"use client";

import { useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { TAROT_CARDS, TarotCard } from "@/data/tarotCards";

export default function CatalogPickerPage() {
  const [selectedSuit, setSelectedSuit] = useState<"ALL" | "MAJOR" | "WANDS" | "CUPS" | "SWORDS" | "PENTACLES">("ALL");
  const [search, setSearch] = useState("");
  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3>(2);
  const [slots, setSlots] = useState<{
    1: TarotCard | null;
    2: TarotCard | null;
    3: TarotCard | null;
  }>({
    1: TAROT_CARDS.find((c) => c.id === 19) || null, // XIX The Sun default
    2: null,
    3: null,
  });

  const suitsList: Array<{ id: "ALL" | "MAJOR" | "WANDS" | "CUPS" | "SWORDS" | "PENTACLES"; label: string; count: number }> = [
    { id: "ALL", label: "ALL 78 CARDS", count: 78 },
    { id: "MAJOR", label: "MAJOR ARCANA", count: 22 },
    { id: "WANDS", label: "WANDS (HỎA)", count: 14 },
    { id: "CUPS", label: "CUPS (THỦY)", count: 14 },
    { id: "SWORDS", label: "SWORDS (KHÍ)", count: 14 },
    { id: "PENTACLES", label: "PENTACLES (ĐỊA)", count: 14 },
  ];

  const filteredCards = TAROT_CARDS.filter((card) => {
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
                MANUAL INPUT MODE // DESK LOGGING · RIDER-WAITE 1909
              </span>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Assign Real-World Drawn Cards to Spread Slots
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500">Spread: 3-Card Trajectory</span>
              <Link
                href="/workbench/custom-draw"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm flex items-center gap-1.5"
              >
                <span>Proceed to Synthesis</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* 3 Slot Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {/* Slot 1 */}
            <div
              onClick={() => setActiveSlot(1)}
              className={`p-3 bg-white rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                activeSlot === 1
                  ? "border-2 border-primary shadow-sm"
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
                    01 Situation {activeSlot === 1 ? "[ACTIVE]" : ""}
                  </span>
                  <div className="text-xs font-bold text-on-surface mt-0.5 truncate max-w-[150px]">
                    {slots[1] ? `${slots[1].number}. ${slots[1].nameEn}` : "Click card to set"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {slots[1] ? slots[1].nameVi : "Empty slot"}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${slots[1] ? "text-emerald-700 bg-emerald-50" : "text-slate-400"}`}>
                {slots[1] ? "Set ✓" : "[Slot 1]"}
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
                    02 Action {activeSlot === 2 ? "[Selecting]" : ""}
                  </span>
                  <div className="text-xs font-bold text-on-surface mt-0.5 truncate max-w-[150px]">
                    {slots[2] ? `${slots[2].number}. ${slots[2].nameEn}` : "Click card to set"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {slots[2] ? slots[2].nameVi : "Empty slot"}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${slots[2] ? "text-emerald-700 bg-emerald-50" : "text-slate-400"}`}>
                {slots[2] ? "Set ✓" : "[Slot 2]"}
              </span>
            </div>

            {/* Slot 3 */}
            <div
              onClick={() => setActiveSlot(3)}
              className={`p-3 bg-white rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                activeSlot === 3
                  ? "border-2 border-primary shadow-sm"
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
                    03 Outcome {activeSlot === 3 ? "[ACTIVE]" : ""}
                  </span>
                  <div className="text-xs font-bold text-on-surface mt-0.5 truncate max-w-[150px]">
                    {slots[3] ? `${slots[3].number}. ${slots[3].nameEn}` : "Click card to set"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {slots[3] ? slots[3].nameVi : "Empty slot"}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${slots[3] ? "text-emerald-700 bg-emerald-50" : "text-slate-400"}`}>
                {slots[3] ? "Set ✓" : "[Slot 3]"}
              </span>
            </div>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="px-6 py-3 bg-white border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {suitsList.map((suit) => (
              <button
                key={suit.id}
                onClick={() => setSelectedSuit(suit.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                  selectedSuit === suit.id
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "bg-surface-variant text-on-surface-variant hover:text-on-surface hover:bg-slate-200"
                }`}
              >
                {suit.label} ({suit.count})
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by card name, number, keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-subtle focus:bg-white focus:outline-none focus:border-primary font-body"
            />
          </div>
        </section>

        {/* 78-Card Specimen Grid */}
        <section className="p-6 bg-[#FAF9F6] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredCards.map((card) => {
            const isAssigned = Object.values(slots).some((s) => s?.id === card.id);
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
                    {card.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{card.nameVi}</div>
                  <div className="text-[8px] font-mono text-slate-400 truncate mt-0.5">
                    {card.keywordsVi}
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
