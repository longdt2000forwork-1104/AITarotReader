import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";

export default function StudioBillingPage() {
  return (
    <>
      <EditorialHeader activeTab="ledger" />

      {/* WEB — PRINT EXPORT STUDIO & BILLING (SCR-W05) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Top Header Strip */}
        <section className="px-6 py-4 bg-[#FAF9F6] border-b border-outline-variant flex justify-between items-center">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block">
              PRODUCTION LAB // POSTER EXPORT & FINANCIAL LEDGER
            </span>
            <h1 className="font-headline font-bold text-xl text-on-surface">
              Editorial Print Studio & Credit Management
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg font-semibold">
              Balance: 120 CR
            </span>
          </div>
        </section>

        {/* 2 Big Zones: Left (Print Studio 65%) vs Right (Billing 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* LEFT: EDITORIAL PRINT STUDIO */}
          <div className="lg:col-span-8 p-6 lg:p-8 bg-[#FAF9F6] space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  SWISS EDITORIAL POSTER STUDIO
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export high-fidelity specimen cards with clean typography and zero AI artifact blur.
                </p>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center border border-outline-variant rounded-lg text-xs font-mono bg-white overflow-hidden">
                <button className="px-3 py-1.5 bg-slate-900 text-white font-semibold">9:16 Story Poster</button>
                <button className="px-3 py-1.5 text-slate-600 hover:text-on-surface">1:1 Square Feed</button>
              </div>
            </div>

            {/* Poster Preview Frame (9:16 aspect preview) */}
            <div className="max-w-sm mx-auto aspect-[9/16] bg-white border border-outline-variant rounded-xl p-6 shadow-md flex flex-col justify-between text-center relative">
              {/* Poster Header */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2">
                <span>AITAROT // SPECIMEN NO. 31</span>
                <span>OCT 31, 2026</span>
              </div>

              {/* Poster Body */}
              <div className="my-auto space-y-4">
                <div className="w-24 h-36 mx-auto bg-[#FAF9F6] border border-amber-300 rounded flex flex-col items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-amber-600">light_mode</span>
                  <span className="text-[9px] font-mono text-amber-700 font-bold mt-1">XIX SOL</span>
                </div>

                <div>
                  <div className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    THE SUN
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    “Build your next iteration in daylight.”
                  </h3>
                </div>

                <div className="flex justify-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                    FIRE 50%
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                    RWS 1909
                  </span>
                </div>
              </div>

              {/* Poster Footer */}
              <div className="pt-2 border-t border-slate-100 text-[9px] font-mono text-slate-400 flex justify-between">
                <span>aitarot.app</span>
                <span>Verified Canon</span>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex justify-center gap-3 pt-2">
              <button className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download High-Res PNG (300 DPI)</span>
              </button>
              <button className="px-4 py-2.5 bg-white border border-outline-variant text-on-surface text-xs font-medium rounded-lg hover:bg-slate-50 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-slate-500">content_copy</span>
                <span>Copy Shareable URL</span>
              </button>
            </div>
          </div>

          {/* RIGHT: BILLING & CREDIT LEDGER */}
          <div className="lg:col-span-4 p-6 lg:p-8 bg-white space-y-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                WALLET & PACKAGES
              </span>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Credit Packs & Subscriptions
              </h2>
            </div>

            {/* Pro Card */}
            <div className="p-4 bg-[#FAF9F6] border-2 border-primary rounded-lg space-y-2 relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-primary font-semibold">MEMBERSHIP</span>
                  <div className="font-headline font-bold text-base text-on-surface">
                    Archival Pro ($6.99/mo)
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                Unlimited AI clarifier follow-ups, 5 Tarot deck editions, high-res poster studio.
              </p>
            </div>

            {/* Pay-as-you-go Packs */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 block font-semibold">
                PAY-AS-YOU-GO TOP-UP
              </span>
              {[
                { cr: 50, price: "$1.99", rate: "$0.040/CR" },
                { cr: 170, price: "$4.99", rate: "$0.029/CR", best: true },
                { cr: 480, price: "$11.99", rate: "$0.025/CR" },
              ].map((pack, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-outline-variant rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-sm text-on-surface">+{pack.cr} CR</span>
                      {pack.best && (
                        <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                          BEST VALUE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{pack.rate}</div>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800">
                    {pack.price}
                  </button>
                </div>
              ))}
            </div>

            {/* Payment Method Badges */}
            <div className="pt-4 border-t border-outline-variant text-center space-y-2">
              <div className="text-[11px] font-mono text-slate-400">
                SUPPORTED PAYMENTS: STRIPE · GOOGLE PLAY · VIETQR / PAYOS
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

