import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";

export default function ReadingWorkbenchPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <EditorialHeader activeTab="workbench" />

      {/* 3-COLUMN SPLIT-PANE READING WORKBENCH */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-slate-500 hover:text-on-surface flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Daily Portal</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
              SESSION #{params.id || "001"} · 3-CARD TRAJECTORY
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-400">READER: IDEA SPARK</span>
            <button className="px-3 py-1 bg-white border border-outline-variant rounded text-xs font-medium text-on-surface hover:bg-slate-50 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">share</span>
              <span>Export Share Card</span>
            </button>
          </div>
        </div>

        {/* 3 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-120px)] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* LEFT COLUMN: HISTORY & SPREAD PARAMETERS (25% / 3 cols) */}
          <div className="lg:col-span-3 p-6 bg-[#F8FAFC] flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2">
                  01 // SPREAD SPECIFICATION
                </span>
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  Situation · Action · Outcome
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Active Deck: Sunlit Botanical Herbarium (ED-02)
                </p>
              </div>

              {/* Elemental Balance Gauge */}
              <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Elemental Balance</span>
                  <span className="text-primary font-semibold">Fire Dominated</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full w-[45%]" title="Fire 45%" />
                  <div className="bg-blue-400 h-full w-[25%]" title="Air 25%" />
                  <div className="bg-emerald-500 h-full w-[20%]" title="Earth 20%" />
                  <div className="bg-cyan-500 h-full w-[10%]" title="Water 10%" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Fire 45%</span>
                  <span>Air 25%</span>
                  <span>Earth 20%</span>
                  <span>Water 10%</span>
                </div>
              </div>

              {/* Reader Persona Switcher */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block">
                  02 // ANALYTICAL VOICE
                </span>
                <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant bg-white text-xs">
                  <div className="p-2.5 flex items-center justify-between text-slate-500 hover:bg-slate-50 cursor-pointer">
                    <span>Classic Mystic</span>
                    <span className="text-[10px] font-mono text-slate-400">Esoteric</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between bg-emerald-50/50 text-primary font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Idea Spark</span>
                    </span>
                    <span className="text-[10px] font-mono text-primary">Creative Focus</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-slate-500 hover:bg-slate-50 cursor-pointer">
                    <span>Gentle Friend</span>
                    <span className="text-[10px] font-mono text-slate-400">Compassionate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <div className="font-mono text-[11px] text-slate-400">
                CLIENT CONTEXT: ARIES · LIFE PATH 7
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: TACTILE SPREAD BOARD (40% / 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#FAF9F6] flex flex-col justify-between linen-texture">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  SPREAD CANVAS // 3-CARD DRAWN MATRIX
                </span>
                <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ALL REVEALED
                </span>
              </div>

              {/* Card Grid in Linen table */}
              <div className="grid grid-cols-3 gap-3">
                {/* Position 1 */}
                <div className="bg-white border border-outline-variant rounded-lg p-3 text-center flex flex-col justify-between shadow-sm min-h-[260px]">
                  <div className="text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-1">
                    01 SITUATION
                  </div>
                  <div className="my-auto py-2">
                    <div className="w-16 h-22 mx-auto rounded border border-amber-200 bg-amber-50/40 flex items-center justify-center p-2">
                      <span className="material-symbols-outlined text-3xl text-amber-700">bolt</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-1.5">
                    <div className="font-mono text-[9px] text-slate-400">XVI</div>
                    <div className="font-headline font-bold text-xs text-on-surface">THE TOWER</div>
                    <div className="text-[9px] font-mono text-emerald-600">Upright</div>
                  </div>
                </div>

                {/* Position 2 (Active Focus) */}
                <div className="bg-white border-2 border-primary rounded-lg p-3 text-center flex flex-col justify-between shadow-sm min-h-[260px] relative -translate-y-1">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-mono px-2 py-0.5 rounded-full uppercase">
                    Core Action
                  </div>
                  <div className="text-[10px] font-mono text-primary font-semibold border-b border-emerald-100 pb-1 mt-1">
                    02 ACTION
                  </div>
                  <div className="my-auto py-2">
                    <div className="w-16 h-22 mx-auto rounded border border-emerald-200 bg-emerald-50/40 flex items-center justify-center p-2">
                      <span className="material-symbols-outlined text-3xl text-primary">psychology</span>
                    </div>
                  </div>
                  <div className="border-t border-emerald-100 pt-1.5">
                    <div className="font-mono text-[9px] text-slate-400">I</div>
                    <div className="font-headline font-bold text-xs text-on-surface">THE MAGICIAN</div>
                    <div className="text-[9px] font-mono text-emerald-600">Upright</div>
                  </div>
                </div>

                {/* Position 3 */}
                <div className="bg-white border border-outline-variant rounded-lg p-3 text-center flex flex-col justify-between shadow-sm min-h-[260px]">
                  <div className="text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-1">
                    03 OUTCOME
                  </div>
                  <div className="my-auto py-2">
                    <div className="w-16 h-22 mx-auto rounded border border-blue-200 bg-blue-50/40 flex items-center justify-center p-2">
                      <span className="material-symbols-outlined text-3xl text-blue-600">star</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-1.5">
                    <div className="font-mono text-[9px] text-slate-400">XVII</div>
                    <div className="font-headline font-bold text-xs text-on-surface">THE STAR</div>
                    <div className="text-[9px] font-mono text-emerald-600">Upright</div>
                  </div>
                </div>
              </div>

              {/* Clarifier Slot */}
              <div className="mt-6 p-4 bg-white border border-dashed border-outline-variant rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-700">Need More Depth?</div>
                  <div className="text-[11px] text-slate-500">
                    Draw 1 Clarifier card for Position 02 (The Magician)
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover flex items-center gap-1">
                  <span>+ Draw Clarifier</span>
                  <span className="text-[10px] font-mono opacity-80">(5 CR)</span>
                </button>
              </div>
            </div>

            <div className="pt-4 text-center text-[11px] font-mono text-slate-400">
              CLICK ON ANY CARD TO INSPECT CANONICAL MEANINGS
            </div>
          </div>

          {/* RIGHT COLUMN: AI SYNTHESIS REPORT & CLARIFIER CHAT (35% / 4 cols) */}
          <div className="lg:col-span-4 p-6 bg-white flex flex-col justify-between">
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-240px)] pr-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1">
                  STREAMING SYNTHESIS // REPORT
                </span>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  Synthesis: Creative Re-alignment
                </h3>
              </div>

              {/* Section 1: Core Synthesis */}
              <div className="space-y-2 border-b border-outline-variant pb-4">
                <div className="font-mono text-xs font-semibold uppercase text-primary tracking-wider">
                  01 // Core Dialectic
                </div>
                <p className="font-body text-xs text-[#475569] leading-relaxed">
                  The sudden disruption of <strong>The Tower</strong> in your current phase has stripped away false
                  assumptions. Rather than recovering the old foundation, <strong>The Magician</strong> indicates all
                  tools needed for your new direction already rest on your worktable.
                </p>
              </div>

              {/* Section 2: Actionable Checklist */}
              <div className="space-y-2 border-b border-outline-variant pb-4">
                <div className="font-mono text-xs font-semibold uppercase text-primary tracking-wider">
                  02 // Tactical Next Steps
                </div>
                <ul className="text-xs text-[#475569] space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    <span>Audit current work-in-progress and archive non-essential features.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    <span>Focus intensely on the singular primary capability this week.</span>
                  </li>
                </ul>
              </div>

              {/* Section 3: Synthesis Pullquote */}
              <div className="p-3.5 rounded-lg bg-[#FAF9F6] border-l-2 border-primary border-y border-r border-outline-variant">
                <blockquote className="font-headline italic text-xs text-on-surface">
                  “Action is the only cure for existential dread. Build the next iteration in daylight.”
                </blockquote>
              </div>
            </div>

            {/* Bottom Clarifier Input Bar */}
            <div className="pt-4 border-t border-outline-variant">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span>Follow-up Clarifier (2/3 remaining)</span>
                <span className="text-primary font-semibold">FREE FOR PRO</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a tactical follow-up question..."
                  className="flex-1 px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-subtle focus:bg-white focus:outline-none focus:border-primary"
                />
                <button className="px-3.5 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

