import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MobileBillingPage() {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Sanctuary</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface">LEDGER & CREDITS</span>
        <span className="text-xs font-mono text-amber-700 font-semibold">45 CR</span>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="p-5 bg-white border border-outline-variant rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">CURRENT CRYSTAL BALANCE</span>
            <div className="text-2xl font-headline font-bold text-on-surface flex items-center gap-2 mt-0.5">
              <span>45 Credits</span>
              <span className="text-xs font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                PRO ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Daily free allowance refilled every midnight.</div>
          </div>
          <button className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100">
            +5 CR Daily Free
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className="p-5 bg-white border-2 border-primary rounded-lg space-y-3 relative shadow-sm">
          <div className="absolute top-0 right-4 -translate-y-1/2 bg-primary text-white text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold">
            RECOMMENDED
          </div>
          <div>
            <span className="text-[10px] font-mono text-primary font-semibold">SUBSCRIPTION PLAN</span>
            <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
              Archival Pro Membership ($6.99/mo)
            </h3>
            <p className="text-xs text-[#475569] mt-1">
              Unlimited follow-up questions, all 5 Tarot deck editions unlocked, high-res PDF/poster exports.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">check</span>
              <span>150 Monthly Bonus Credits</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">check</span>
              <span>Access to Swiss Geometric & Sumi-e decks</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">check</span>
              <span>Priority low-latency streaming</span>
            </li>
          </ul>
          <button className="w-full py-3 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm">
            Upgrade to Archival Pro ($6.99)
          </button>
        </div>

        {/* Credit Packs */}
        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            PAY-AS-YOU-GO CREDIT PACKS
          </span>
          <div className="space-y-2">
            {[
              { credits: 50, price: "$1.99", per: "$0.040 / credit" },
              { credits: 170, price: "$4.99", per: "$0.029 / credit", popular: true },
              { credits: 480, price: "$11.99", per: "$0.025 / credit" },
            ].map((pack, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border border-outline-variant rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-sm text-on-surface">+{pack.credits} Credits</span>
                    {pack.popular && (
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                        BEST VALUE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{pack.per}</div>
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold border border-outline-variant rounded-lg hover:bg-slate-50 text-on-surface">
                  {pack.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MobileBottomNav activeTab="profile" />
    </div>
  );
}

