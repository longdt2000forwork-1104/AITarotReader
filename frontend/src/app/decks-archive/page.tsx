import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";

export default function DecksArchivePage() {
  const decks = [
    {
      id: "ED-01",
      name: "Rider-Waite-Smith 1909",
      desc: "Original Pamela Colman Smith hand-drawn linework & watercolor restore.",
      status: "DEFAULT · FREE",
      badge: "CANONICAL",
      active: true,
    },
    {
      id: "ED-02",
      name: "Sunlit Botanical Herbarium",
      desc: "Warm Alabaster press, medicinal flora, golden woodcut botanical engraving.",
      status: "UNLOCKED · ACTIVE",
      badge: "FEATURED",
      active: false,
    },
    {
      id: "ED-03",
      name: "Swiss Geometric Construct",
      desc: "Minimalist Bauhaus typography, precise vector grids, chromatic modernism.",
      status: "PRO EXCLUSIVE",
      badge: "MODERN",
      active: false,
    },
    {
      id: "ED-04",
      name: "Marseille 1760 Heritage",
      desc: "Nicolas Conver woodblock archive, pure primary heraldic inks, French tradition.",
      status: "PRO EXCLUSIVE",
      badge: "HISTORICAL",
      active: false,
    },
    {
      id: "ED-05",
      name: "Kyoto Sumi-e Ink Wash",
      desc: "Atmospheric Japanese calligraphy ink, negative space, gold leaf dusting.",
      status: "PRO EXCLUSIVE",
      badge: "EASTERN",
      active: false,
    },
  ];

  return (
    <>
      <EditorialHeader activeTab="decks" />

      {/* WEB — CURATED DECK EDITIONS & 78-CARD CONTACT SHEET (SCR-W06) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Header Strip */}
        <section className="p-6 lg:p-8 bg-[#FAF9F6] border-b border-outline-variant">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                ARCHIVAL COLLECTION // 5 CANONICAL EDITIONS (78 CARDS EACH)
              </span>
              <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
                Curated Tarot Editions & 78-Card Contact Sheet
              </h1>
              <p className="font-body text-xs text-[#475569] mt-1 max-w-2xl">
                Every deck contains the full 78-card canon (22 Major Arcana + 56 Minor Arcana). Switch between historical,
                botanical, and minimalist art styles seamlessly without changing card interpretations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">Active Deck: ED-02 Botanical</span>
              <button className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm">
                Set as Default Deck
              </button>
            </div>
          </div>
        </section>

        {/* 5-Deck Style Comparison Strip for Single Card (XVII The Star) */}
        <section className="p-6 bg-white border-b border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              CROSS-EDITION VISUAL COMPARISON // XVII THE STAR (NGÔI SAO)
            </span>
            <span className="text-[11px] font-mono text-primary">COMPARE ALL 5 ART STYLES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {decks.map((deck, idx) => (
              <div
                key={deck.id}
                className="bg-[#FAF9F6] border border-outline-variant rounded-lg p-3 flex flex-col justify-between hover:border-primary transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 pb-1 border-b border-slate-200">
                    <span>{deck.id}</span>
                    <span className="text-primary font-semibold">{deck.badge}</span>
                  </div>
                  <div className="w-full aspect-[2/3] bg-white border border-slate-200 rounded flex flex-col items-center justify-center p-3 relative group-hover:shadow-sm">
                    <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">
                      star
                    </span>
                    <span className="text-[10px] font-headline font-bold text-on-surface mt-2 text-center">
                      XVII THE STAR
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <div className="font-headline font-bold text-xs text-on-surface truncate">{deck.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{deck.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 Decks Selection Table */}
        <section className="p-6 bg-[#FAF9F6]">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-4">
            SELECT DECK EDITION TO EXPLORE CONTACT SHEET
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="p-5 bg-white border border-outline-variant rounded-lg space-y-3 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] font-semibold text-primary">{deck.id}</span>
                    <h3 className="font-headline font-bold text-base text-on-surface">{deck.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    78 CARDS
                  </span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">{deck.desc}</p>
                <div className="pt-3 border-t border-outline-variant flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-500">{deck.status}</span>
                  <button className="text-primary font-semibold hover:underline">View 78 Cards →</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

