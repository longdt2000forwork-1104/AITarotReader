import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MobileTactileDrawPage() {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20 linen-texture">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/readings/new" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">close</span>
          <span>Cancel</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface">3-CARD TRAJECTORY DRAW</span>
        <span className="text-xs font-mono text-primary font-semibold">CARD 2/3</span>
      </header>

      {/* Main Draw Surface */}
      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Pinned 3 Slots */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-white border border-outline-variant rounded-lg text-center shadow-sm">
            <span className="text-[9px] font-mono text-slate-400 block">01 SITUATION</span>
            <div className="text-xs font-headline font-bold text-on-surface mt-1 truncate">XVI Tower</div>
            <span className="text-[8px] font-mono text-emerald-600">Drawn ✓</span>
          </div>

          <div className="p-2.5 bg-white border-2 border-primary rounded-lg text-center shadow-sm -translate-y-0.5">
            <span className="text-[9px] font-mono text-primary font-semibold block">02 ACTION</span>
            <div className="text-xs font-headline font-bold text-primary mt-1">SELECTING...</div>
            <span className="text-[8px] font-mono text-primary">Pick from fan</span>
          </div>

          <div className="p-2.5 bg-white border border-dashed border-slate-300 rounded-lg text-center opacity-60">
            <span className="text-[9px] font-mono text-slate-400 block">03 OUTCOME</span>
            <div className="text-xs font-headline text-slate-400 mt-1">Pending</div>
            <span className="text-[8px] font-mono text-slate-400">Card 3</span>
          </div>
        </div>

        {/* Center Tactile Deck Fan Area */}
        <div className="my-auto py-8 text-center space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Draw Card 2: Your Core Action
            </h2>
            <p className="text-xs text-[#475569] max-w-xs mx-auto">
              Focus on what direct initiative or agency you can take this week. Slide or tap to reveal.
            </p>
          </div>

          {/* Horizontal Card Back Fan Simulation */}
          <div className="relative h-56 flex items-center justify-center overflow-hidden py-4">
            {[-30, -20, -10, 0, 10, 20, 30].map((deg, idx) => {
              const isSelected = deg === 0;
              return (
                <div
                  key={idx}
                  style={{
                    transform: `rotate(${deg}deg) translateY(${isSelected ? "-16px" : "0px"})`,
                    zIndex: 10 + Math.abs(10 - Math.abs(deg)),
                  }}
                  className={`w-28 h-44 rounded-lg bg-white border transition-all cursor-pointer shadow-md flex flex-col justify-between p-2.5 absolute ${
                    isSelected ? "border-2 border-primary shadow-lg ring-2 ring-emerald-100" : "border-outline-variant"
                  }`}
                >
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                    <span>ED-02</span>
                    <span>78 CANON</span>
                  </div>
                  {/* Botanical Back pattern */}
                  <div className="my-auto border border-emerald-100 bg-emerald-50/30 rounded p-2 text-center">
                    <span className="material-symbols-outlined text-2xl text-emerald-700">spa</span>
                  </div>
                  <div className="text-[8px] font-mono text-center text-slate-400">
                    {isSelected ? "TAP TO REVEAL" : `#${idx + 24}`}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
            HAPTIC VIBRATION ACTIVE · SHUFFLED WITH SEED
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/workbench/demo-session"
            className="w-full py-3.5 bg-primary text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-sm"
          >
            <span>Confirm Card #27 & Complete Reading →</span>
          </Link>
        </div>
      </main>

      <MobileBottomNav activeTab="oracle" />
    </div>
  );
}

