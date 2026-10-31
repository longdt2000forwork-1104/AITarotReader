import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MobileDailyHomePage() {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Hairline App Bar */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-serif font-bold text-slate-800">
            ♈
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface leading-tight">Aria · Aries</div>
            <div className="text-[10px] font-mono text-slate-400">Life Path 7</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-outline-variant rounded text-[10px] font-mono overflow-hidden">
            <span className="px-1.5 py-0.5 bg-slate-900 text-white font-semibold">EN</span>
            <span className="px-1.5 py-0.5 text-slate-500">VI</span>
          </div>

          <Link
            href="/app/billing"
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#FEF3C7] text-[#B45309] border border-amber-200 rounded text-xs font-mono font-semibold"
          >
            <span className="material-symbols-outlined text-[13px]">toll</span>
            <span>45 CR</span>
          </Link>
        </div>
      </header>

      {/* Main Daily Content */}
      <main className="p-4 space-y-4">
        {/* Issue & Date Kicker */}
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
          <span>DAILY SANCTUARY</span>
          <span>SAT OCT 31 · 2026</span>
        </div>

        {/* Drawn Card Specimen Card */}
        <div className="bg-white border border-outline-variant rounded-lg p-5 text-center shadow-sm space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2">
            <span>RWS // 19 · MAJOR</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              UPRIGHT
            </span>
          </div>

          {/* Card Icon Art Preview */}
          <div className="w-28 h-40 mx-auto rounded border border-amber-200 bg-[#FAF9F6] flex flex-col items-center justify-center p-3 relative shadow-inner">
            <span className="material-symbols-outlined text-5xl text-amber-600">light_mode</span>
            <span className="text-[9px] font-mono text-amber-700 font-bold mt-2">SOLAR FIRE</span>
          </div>

          <div>
            <div className="font-mono text-xs font-semibold text-slate-400 uppercase">XIX</div>
            <h1 className="font-headline font-bold text-xl text-on-surface">THE SUN (MẶT TRỜI)</h1>
            <p className="text-xs text-[#475569] mt-1 italic">
              “Solar consciousness, unclouded intellect, creative fruition.”
            </p>
          </div>

          {/* Tags */}
          <div className="flex justify-center gap-1.5 pt-2">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">CLARITY</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">MOMENTUM</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">BREAKTHROUGH</span>
          </div>
        </div>

        {/* Daily Synthesis Quote */}
        <div className="p-4 bg-white border border-outline-variant rounded-lg border-l-4 border-l-primary space-y-1">
          <span className="font-mono text-[10px] uppercase text-primary font-semibold block">
            TODAY'S INTENTION // ADVISORY
          </span>
          <p className="font-headline italic text-sm text-on-surface leading-snug">
            “Consolidate your main project in daylight. Share your draft early before hesitation sets in.”
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/app/readings/new"
            className="w-full py-3 bg-primary text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-sm"
          >
            <span>Begin New Reading (Virtual Deck)</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
          <Link
            href="/catalog-picker"
            className="w-full py-3 bg-white border border-outline-variant text-on-surface text-xs font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">edit_note</span>
            <span>Log Physical Deck Draw (No Camera)</span>
          </Link>
        </div>
      </main>

      <MobileBottomNav activeTab="home" />
    </div>
  );
}

