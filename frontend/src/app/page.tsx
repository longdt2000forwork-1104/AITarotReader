import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function EditorialPortalPage() {
  return (
    <>
      <EditorialHeader activeTab="daily" />

      {/* MAIN EDITORIAL CANVASES (1280px+ Wide Responsive Layout) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* 2-COLUMN HERO EDITORIAL GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] border-b border-outline-variant">
          {/* LEFT EDITORIAL SECTION (60% on desktop) */}
          <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 bg-[#FAF9F6] border-b lg:border-b-0 lg:border-r border-outline-variant flex flex-col justify-between">
            <div>
              {/* Kicker Tag */}
              <div className="flex items-center gap-2.5 mb-6">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  ISSUE NO. 31 · BILINGUAL TAROT SYNTHESIS ENGINE
                </span>
              </div>

              {/* Editorial Headline */}
              <h1 className="font-headline font-bold text-3xl sm:text-4xl lg:text-[46px] leading-[1.12] tracking-tight text-on-surface max-w-2xl">
                Structured Tarot Synthesis for Creative Direction & Daily Clarity.
              </h1>

              {/* Lead Paragraph */}
              <p className="font-body text-[#475569] text-base lg:text-[17px] leading-relaxed max-w-xl mt-5">
                Combine the tactile ritual of the 78-card Rider-Waite-Smith tradition with holistic AI synthesis. Draw
                virtually or log your physical desk spread with elemental balance verification.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/workbench/demo-session"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-6 py-3.5 rounded-lg transition-all active:scale-[0.98]"
                >
                  <span>Open Reading Workbench</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
                <Link
                  href="/catalog-picker"
                  className="inline-flex items-center gap-2 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-on-surface text-sm font-medium px-5 py-3.5 rounded-lg transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">edit_note</span>
                  <span>Log Physical Deck Spread</span>
                </Link>
              </div>
            </div>

            {/* 3-Column Key Metrics Strip */}
            <div className="mt-14 pt-8 border-t border-outline-variant grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Inventory</div>
                <div className="font-headline font-bold text-lg text-on-surface">78 Cards (EN/VI)</div>
                <div className="text-xs text-ink-muted">Full RWS Canonical System</div>
              </div>
              <div className="space-y-1 sm:border-l sm:border-outline-variant sm:pl-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Synthesis Tone</div>
                <div className="font-headline font-bold text-lg text-on-surface">3 Reader Personas</div>
                <div className="text-xs text-ink-muted">Classic Mystic · Spark · Gentle</div>
              </div>
              <div className="space-y-1 sm:border-l sm:border-outline-variant sm:pl-6">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Methodology</div>
                <div className="font-headline font-bold text-lg text-on-surface">Clarifier & Journal</div>
                <div className="text-xs text-ink-muted">Tactical Action Experiments</div>
              </div>
            </div>
          </div>

          {/* RIGHT SPECIMEN & DAILY DRAW COLUMN (40% on desktop) */}
          <div className="lg:col-span-5 p-8 lg:p-10 bg-white flex flex-col justify-between">
            <div>
              {/* Specimen Header Strip */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="font-mono text-[11px] tracking-widest text-slate-500 uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>TODAY'S DRAWN SPECIMEN · DAILY FOCUS</span>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  DRAWN ✓
                </span>
              </div>

              {/* Specimen Card + Table Display Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                {/* Tarot Card Visual Specimen Frame */}
                <div className="sm:col-span-5 bg-[#FAF9F6] border border-outline-variant rounded-lg p-3 text-center flex flex-col items-center justify-between min-h-[240px] shadow-sm">
                  <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-200 pb-1">
                    <span>RWS // 19</span>
                    <span>MAJOR</span>
                  </div>
                  {/* Clean Linework Sun Emblem */}
                  <div className="my-4 w-24 h-24 rounded-full border border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center relative">
                    <span className="material-symbols-outlined text-4xl text-amber-600">light_mode</span>
                    <div className="absolute -top-1 font-mono text-[9px] text-amber-700 font-semibold">SOL</div>
                  </div>
                  <div className="w-full pt-2 border-t border-slate-200">
                    <div className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                      XIX
                    </div>
                    <div className="font-headline font-bold text-sm tracking-tight text-on-surface">THE SUN</div>
                    <div className="text-[10px] font-mono text-emerald-600 font-medium">Upright (Xuôi)</div>
                  </div>
                </div>

                {/* Elemental & Archetype Specimen Table */}
                <div className="sm:col-span-7 flex flex-col justify-between h-full pt-1">
                  <div>
                    <h2 className="font-headline text-lg font-bold text-on-surface leading-snug">
                      XIX — The Sun (Mặt Trời)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Solar consciousness, unclouded intellect, creative fruition.
                    </p>
                  </div>

                  {/* Metadata Table Matrix */}
                  <div className="mt-4 border border-outline-variant rounded-lg divide-y divide-outline-variant text-xs">
                    <div className="p-2.5 flex items-center justify-between bg-surface-subtle">
                      <span className="text-slate-500 font-mono text-[11px]">Primary Element</span>
                      <span className="font-medium text-on-surface flex items-center gap-1.5">
                        <span>Fire ☀️</span>
                        <span className="text-emerald-600 font-mono text-[10px] bg-emerald-50 px-1 rounded">
                          50% Active
                        </span>
                      </span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-mono text-[11px]">Arcana Class</span>
                      <span className="font-medium text-on-surface">Major Arcana XIX</span>
                    </div>
                    <div className="p-2.5 flex flex-col gap-1 bg-white">
                      <span className="text-slate-500 font-mono text-[11px]">Core Keywords</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700">Clarity</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700">Momentum</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] text-slate-700">
                          Breakthrough
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Synthesis Pullquote Note */}
              <div className="mt-6 p-4 rounded-lg bg-[#FAF9F6] border-l-2 border-primary border-y border-r border-outline-variant">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Synthesis Advisory // Focus
                </span>
                <blockquote className="font-headline italic text-sm md:text-[15px] text-on-surface leading-snug">
                  “Focus on consolidating your core idea in daylight. Share your draft early today before self-doubt clouds the horizon.”
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
                <span>Export 9:16 Specimen Print</span>
              </Link>
              <Link
                href="/workbench/demo-session"
                className="text-xs font-semibold text-primary hover:text-emerald-700 flex items-center gap-1 group transition-colors"
              >
                <span>View Full Synthesis Report</span>
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
                SPREAD ARCHITECTURES // CHOOSE PROTOCOL
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">4 ACTIVE BLUEPRINTS AVAILABLE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
            {/* Spread Card 1 */}
            <div className="p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-slate-400">01 PROTOCOL</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded">
                    FREE
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  1-Card Quick Spark
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  Single daily focus & clarity pulse. Ideal for morning alignment, micro-calibration, or quick sanity checks before meetings.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">Rate: 0 CR</span>
                <Link
                  href="/app/readings/new?spread=1"
                  className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <span>Select</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              </div>
            </div>

            {/* Spread Card 2 (Active Highlighted Protocol) */}
            <div className="p-6 lg:p-7 flex flex-col justify-between bg-emerald-50/20 relative group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-primary">02 PROTOCOL · RECOMMENDED</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded">
                    10 CR
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  3-Card Trajectory
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  Situation · Action · Outcome dialectic with elemental synthesis and counter-shadow clarifiers for tactical direction.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/80 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-emerald-700">Rate: 10 CR</span>
                <Link
                  href="/app/readings/new?spread=2"
                  className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <span>Deploy</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Spread Card 3 */}
            <div className="p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-slate-400">03 PROTOCOL</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded">
                    15 CR
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  5-Card Creative Direction
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  Core · Obstacle · Hidden Resource · Step · Integration blueprint tailored for project roadmaps and artistic blockages.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">Rate: 15 CR</span>
                <Link
                  href="/app/readings/new?spread=3"
                  className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <span>Select</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              </div>
            </div>

            {/* Spread Card 4 */}
            <div className="p-6 lg:p-7 flex flex-col justify-between hover:bg-slate-50/60 transition-colors group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-slate-400">04 PROTOCOL</span>
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
                    25 CR / PRO
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                  10-Card Celtic Cross
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mt-2.5">
                  Deep holistic blueprint uncovering root forces, unconscious currents, external perceptions, and cumulative outcomes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-500">Rate: 25 CR</span>
                <Link
                  href="/app/readings/new?spread=4"
                  className="text-xs font-medium text-on-surface hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <span>Select</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ARCHIVE CURATION STRIP */}
        <section className="p-6 lg:px-8 bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span>ARCHIVE COMPLIANCE: RWS 1909 PUBLIC DOMAIN SPECIFICATION</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">5 EDITIONS EN/VI CATALOG</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/catalog-picker" className="hover:text-on-surface underline transition-colors">
              Browse 78-Card Manual Catalog
            </Link>
            <Link href="/decks-archive" className="hover:text-on-surface underline transition-colors">
              5 Decks Contact Sheet
            </Link>
          </div>
        </section>
      </main>

      <MobileBottomNav activeTab="home" />
    </>
  );
}

