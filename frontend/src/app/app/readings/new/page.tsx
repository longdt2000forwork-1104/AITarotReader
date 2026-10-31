import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MobileSpreadConfigPage() {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Back</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface">NEW READING CONFIG</span>
        <span className="text-xs font-mono text-primary font-semibold">STEP 1/4</span>
      </header>

      {/* 4-Step Form */}
      <main className="p-4 space-y-6">
        {/* Step 1: Spread Architecture */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              01 // SPREAD ARCHITECTURE
            </span>
            <span className="text-[10px] font-mono text-primary">SELECT 1 PROTOCOL</span>
          </div>
          <div className="space-y-2">
            {[
              { id: 1, name: "1-Card Quick Spark", cr: "FREE", desc: "Daily focus or quick clarity pulse" },
              { id: 2, name: "3-Card Trajectory", cr: "10 CR", desc: "Situation · Action · Outcome dialectic", active: true },
              { id: 3, name: "5-Card Creative Direction", cr: "15 CR", desc: "Core · Obstacle · Resource · Action · Integration" },
              { id: 4, name: "10-Card Celtic Cross", cr: "25 CR", desc: "Deep analytical subconscious blueprint" },
            ].map((spread) => (
              <div
                key={spread.id}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  spread.active
                    ? "bg-white border-2 border-primary shadow-sm"
                    : "bg-white border-outline-variant hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-sm text-on-surface">{spread.name}</span>
                    {spread.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#475569] mt-0.5">{spread.desc}</p>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    spread.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {spread.cr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Deck Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              02 // TAROT DECK EDITION
            </span>
            <Link href="/app/decks" className="text-[10px] font-mono text-primary hover:underline">
              Browse All 5 Decks →
            </Link>
          </div>
          <div className="p-3.5 bg-white border border-outline-variant rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-14 bg-[#FAF9F6] border border-amber-200 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-emerald-600">nature</span>
              </div>
              <div>
                <div className="font-headline font-bold text-xs text-on-surface">ED-02 Sunlit Botanical Herbarium</div>
                <div className="text-[10px] text-slate-500 font-mono">78 Cards · Botanical Press Inks</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-primary font-semibold">Active ✓</span>
          </div>
        </div>

        {/* Step 3: Reader Persona */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            03 // READER VOICE & SYNTHESIS TONE
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "Classic Mystic", sub: "Esoteric" },
              { name: "Idea Spark", sub: "Tactical", active: true },
              { name: "Gentle Friend", sub: "Empathic" },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-center cursor-pointer ${
                  p.active
                    ? "bg-emerald-50/50 border-2 border-primary text-primary"
                    : "bg-white border-outline-variant text-slate-600"
                }`}
              >
                <div className="font-headline font-bold text-xs">{p.name}</div>
                <div className="text-[9px] font-mono opacity-80 mt-0.5">{p.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Intention Input */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            04 // INTENTION / QUESTION (OPTIONAL)
          </span>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="What project, creative direction, or obstacle are you seeking clarity on?"
            className="w-full p-3 text-xs border border-outline-variant rounded-lg bg-surface-subtle focus:bg-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Launch CTA */}
        <Link
          href="/app/readings/draw"
          className="w-full py-3.5 bg-primary text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-sm"
        >
          <span>Draw Cards (Tactile Fan) →</span>
        </Link>
      </main>

      <MobileBottomNav activeTab="oracle" />
    </div>
  );
}

