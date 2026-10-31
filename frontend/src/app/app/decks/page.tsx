import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MobileDecksGalleryPage() {
  const decks = [
    {
      id: "ED-01",
      name: "Rider-Waite-Smith 1909",
      desc: "Original Pamela Colman Smith hand-drawn linework & watercolor.",
      status: "DEFAULT · FREE",
      badge: "CANONICAL",
      active: false,
    },
    {
      id: "ED-02",
      name: "Sunlit Botanical Herbarium",
      desc: "Warm Alabaster press, medicinal flora, golden woodcut engraving.",
      status: "ACTIVE SELECTION",
      badge: "ACTIVE",
      active: true,
    },
    {
      id: "ED-03",
      name: "Swiss Geometric Construct",
      desc: "Minimalist Bauhaus typography, vector grids, chromatic modernism.",
      status: "PRO (150 CR)",
      badge: "PRO",
      active: false,
    },
    {
      id: "ED-04",
      name: "Marseille 1760 Heritage",
      desc: "Nicolas Conver woodblock archive, pure primary heraldic inks.",
      status: "PRO (150 CR)",
      badge: "PRO",
      active: false,
    },
    {
      id: "ED-05",
      name: "Kyoto Sumi-e Ink Wash",
      desc: "Atmospheric Japanese calligraphy ink, gold leaf dusting.",
      status: "PRO (200 CR)",
      badge: "PRO",
      active: false,
    },
  ];

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Sanctuary</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface">5 DECK EDITIONS</span>
        <span className="text-xs font-mono text-primary font-semibold">ALL 78 CARDS</span>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Active Hero Deck */}
        <div className="bg-white border-2 border-primary rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-100 pb-2">
            <span className="text-primary font-bold">ACTIVE SELECTION // ED-02</span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              IN USE
            </span>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-20 h-28 bg-[#FAF9F6] border border-amber-200 rounded flex flex-col items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-3xl text-emerald-600">spa</span>
              <span className="text-[8px] font-mono text-emerald-700 font-bold mt-1">HERBARIUM</span>
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="font-headline font-bold text-base text-on-surface">
                Sunlit Botanical Herbarium
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed">
                78 cards printed on warm alabaster stock with medicinal herbs and gold foil accents.
              </p>
              <div className="text-[10px] font-mono text-emerald-700 font-semibold pt-1">
                78 Plates Generated & Verified
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              href="/catalog-picker"
              className="flex-1 py-2 text-center text-xs font-medium border border-outline-variant rounded-lg hover:bg-slate-50"
            >
              Browse 78 Plates
            </Link>
            <button className="flex-1 py-2 text-center text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover">
              Selected ✓
            </button>
          </div>
        </div>

        {/* Other 4 Editions */}
        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            AVAILABLE EDITIONS (SWITCH FREELY)
          </span>

          {decks
            .filter((d) => !d.active)
            .map((deck) => (
              <div
                key={deck.id}
                className="p-4 bg-white border border-outline-variant rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1 max-w-[240px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-primary font-semibold">{deck.id}</span>
                    <h3 className="font-headline font-bold text-sm text-on-surface">{deck.name}</h3>
                  </div>
                  <p className="text-[11px] text-[#475569]">{deck.desc}</p>
                  <span className="text-[10px] font-mono text-slate-400 block">{deck.status}</span>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium border border-outline-variant rounded-lg hover:bg-slate-50 text-on-surface">
                  Switch
                </button>
              </div>
            ))}
        </div>
      </main>

      <MobileBottomNav activeTab="journal" />
    </div>
  );
}

