import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";

export default function CatalogPickerPage() {
  const suits = [
    { label: "ALL 78 CARDS", count: 78, active: true },
    { label: "MAJOR ARCANA", count: 22, active: false },
    { label: "WANDS (LỬA)", count: 14, active: false },
    { label: "CUPS (NƯỚC)", count: 14, active: false },
    { label: "SWORDS (KHÍ)", count: 14, active: false },
    { label: "PENTACLES (ĐẤT)", count: 14, active: false },
  ];

  return (
    <>
      <EditorialHeader activeTab="catalog" />

      {/* WEB — 78-CARD REFERENCE & MANUAL INPUT (SCR-W03) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Pinned Assignment Bar for 3 Cards */}
        <section className="px-6 py-4 bg-[#FAF9F6] border-b border-outline-variant">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block">
                MANUAL INPUT MODE // DESK LOGGING
              </span>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Assign Real-World Drawn Cards to Spread Slots
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500">Spread: 3-Card Trajectory</span>
              <button className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm">
                Proceed to Synthesis →
              </button>
            </div>
          </div>

          {/* 3 Slot Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-white border-2 border-primary rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary font-semibold uppercase">01 Situation</span>
                <div className="text-xs font-bold text-on-surface mt-0.5">XIX The Sun (Upright)</div>
              </div>
              <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Set ✓</span>
            </div>
            <div className="p-3 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">02 Action [Selecting]</span>
                <div className="text-xs text-slate-500 mt-0.5">Click card below to assign...</div>
              </div>
              <span className="text-xs font-mono text-slate-400">[Slot 2]</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between opacity-60">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">03 Outcome</span>
                <div className="text-xs text-slate-400 mt-0.5">Empty slot</div>
              </div>
              <span className="text-xs font-mono text-slate-400">[Slot 3]</span>
            </div>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="px-6 py-3 bg-white border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {suits.map((suit, index) => (
              <button
                key={index}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                  suit.active
                    ? "bg-primary text-white font-semibold"
                    : "bg-surface-variant text-on-surface-variant hover:text-on-surface hover:bg-slate-200"
                }`}
              >
                {suit.label} ({suit.count})
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Search by card name, number, keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-subtle focus:bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </section>

        {/* 78-Card Specimen Grid (Sample preview) */}
        <section className="p-6 bg-[#FAF9F6] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { num: "00", name: "The Fool", suit: "Major", elem: "Air", vi: "Kẻ Khờ" },
            { num: "01", name: "The Magician", suit: "Major", elem: "Air", vi: "Phù Thủy" },
            { num: "02", name: "The High Priestess", suit: "Major", elem: "Water", vi: "Nữ Tư Tế" },
            { num: "03", name: "The Empress", suit: "Major", elem: "Earth", vi: "Hoàng Hậu" },
            { num: "04", name: "The Emperor", suit: "Major", elem: "Fire", vi: "Hoàng Đế" },
            { num: "05", name: "The Hierophant", suit: "Major", elem: "Earth", vi: "Giáo Hoàng" },
            { num: "06", name: "The Lovers", suit: "Major", elem: "Air", vi: "Tình Nhân" },
            { num: "07", name: "The Chariot", suit: "Major", elem: "Water", vi: "Cỗ Xe" },
            { num: "08", name: "Strength", suit: "Major", elem: "Fire", vi: "Sức Mạnh" },
            { num: "09", name: "The Hermit", suit: "Major", elem: "Earth", vi: "Ẩn Sĩ" },
            { num: "10", name: "Wheel of Fortune", suit: "Major", elem: "Fire", vi: "Bánh Xe Số Phận" },
            { num: "19", name: "The Sun", suit: "Major", elem: "Fire", vi: "Mặt Trời" },
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white border border-outline-variant hover:border-primary hover:shadow-md transition-all rounded-lg p-3 text-center cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-slate-100 pb-1">
                <span>#{card.num}</span>
                <span className="uppercase">{card.elem}</span>
              </div>
              <div className="py-6">
                <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">
                  style
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <div className="font-headline font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                  {card.name}
                </div>
                <div className="text-[10px] text-slate-500">{card.vi}</div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

