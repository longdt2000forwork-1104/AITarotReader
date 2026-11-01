import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";

export default function JournalPatternLedgerPage() {
  return (
    <>
      <EditorialHeader activeTab="journal" />

      {/* WEB — ARCHIVE JOURNAL & PATTERN LEDGER (SCR-W04) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Top Analytics KPI Bar */}
        <section className="p-6 bg-[#FAF9F6] border-b border-outline-variant grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">TOTAL SESSIONS LOGGED</span>
            <div className="font-headline font-bold text-2xl text-on-surface">24 Readings</div>
            <div className="text-xs text-slate-500">Over past 30 days (100% verified)</div>
          </div>

          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">STALKER CARD // RECURRING THEME</span>
            <div className="font-headline font-bold text-xl text-primary flex items-center gap-2">
              <span>IX The Hermit</span>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                Drawn 5 times
              </span>
            </div>
            <div className="text-xs text-slate-500">Introspection & deep creative focus needed</div>
          </div>

          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500 uppercase">30-DAY ELEMENTAL RATIO</span>
              <span className="text-primary font-semibold">Fire & Air Heavy</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-amber-500 h-full w-[40%]" title="Fire 40%" />
              <div className="bg-blue-400 h-full w-[30%]" title="Air 30%" />
              <div className="bg-emerald-500 h-full w-[20%]" title="Earth 20%" />
              <div className="bg-cyan-500 h-full w-[10%]" title="Water 10%" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Fire 40%</span>
              <span>Air 30%</span>
              <span>Earth 20%</span>
              <span>Water 10%</span>
            </div>
          </div>
        </section>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* Left: Journal Entries List (40% / 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#F8FAFC] space-y-3">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                READINGS CHRONICLE // 24 ENTRIES
              </span>
              <span className="text-[10px] font-mono text-slate-400">NEWEST FIRST</span>
            </div>

            {[
              {
                id: "001",
                date: "Oct 31, 2026",
                spread: "3-Card Trajectory",
                cards: "Tower, Magician, Star",
                tags: ["FOCUSED", "INSPIRED"],
                active: true,
              },
              {
                id: "002",
                date: "Oct 28, 2026",
                spread: "1-Card Quick Spark",
                cards: "IX The Hermit",
                tags: ["SOLITUDE", "RESEARCH"],
                active: false,
              },
              {
                id: "003",
                date: "Oct 24, 2026",
                spread: "5-Card Creative Direction",
                cards: "Ace of Wands, 3 Pentacles...",
                tags: ["ROADMAP", "LAUNCH"],
                active: false,
              },
            ].map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  entry.active
                    ? "bg-white border-2 border-primary shadow-sm"
                    : "bg-white border-outline-variant hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>SESSION #{entry.id}</span>
                  <span>{entry.date}</span>
                </div>
                <h4 className="font-headline font-bold text-sm text-on-surface mt-1">{entry.spread}</h4>
                <div className="text-xs text-slate-500 mt-0.5">{entry.cards}</div>
                <div className="flex gap-1.5 mt-2">
                  {entry.tags.map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Reflection Editor & Detailed Synthesis (60% / 7 cols) */}
          <div className="lg:col-span-7 p-6 bg-white space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                JOURNAL DETAIL // SESSION #001 (OCT 31, 2026)
              </span>
              <h2 className="font-headline font-bold text-xl text-on-surface">
                Creative Re-alignment & Foundation Reset
              </h2>
            </div>

            {/* Reflection Input */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-slate-500 block uppercase">
                Personal Reflection & Empirical Evidence (Nghiệm Lý)
              </label>
              <textarea
                rows={5}
                defaultValue="The Tower reflected the abrupt pivot we made away from the complex legacy stack. The Magician immediately surfaced our core strengths: keeping the Next.js and Tailwind pipeline lean and disciplined. The Star gives us quiet confidence to ship."
                className="w-full p-4 text-xs border border-outline-variant rounded-lg bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
              <span className="font-mono text-[11px] text-slate-400">AUTOSAVED AT 17:15 · 2 TAGS ATTACHED</span>
              <button className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm">
                Save Reflection Entry
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

