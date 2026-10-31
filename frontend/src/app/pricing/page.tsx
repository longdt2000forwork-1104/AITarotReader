"use client";

import { useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";

export default function PricingPlansStorePage() {
  const { locale } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    title: string;
    priceUsd: string;
    priceVnd: string;
    credits: number;
    type: "plan" | "pack";
  }>({
    id: "PRO_PASS",
    title: "Archival Pro Pass (Annual)",
    priceUsd: "$49.00",
    priceVnd: "1.090.000 ₫",
    credits: 600,
    type: "plan",
  });

  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "stripe">("vietqr");
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(45);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleClaimDaily = () => {
    if (!claimedDaily) {
      setCurrentBalance(currentBalance + 5);
      setClaimedDaily(true);
    }
  };

  const handleCompleteOrder = () => {
    setTransferSuccess(true);
    setTimeout(() => {
      setCurrentBalance((prev) => prev + selectedProduct.credits);
    }, 1200);
  };

  const creditPacks = [
    {
      id: "PACK_50",
      title: "Initiate Pouch",
      credits: 50,
      priceUsd: "$2.99",
      priceVnd: "75.000 ₫",
      desc: "5 spreads of 3 cards or 2 deep Celtic crosses.",
      badge: "STARTER",
    },
    {
      id: "PACK_170",
      title: "Scholar Pouch",
      credits: 170,
      priceUsd: "$7.99",
      priceVnd: "199.000 ₫",
      desc: "Includes +20 bonus CR. 17 spreads & deep clarifiers.",
      badge: "POPULAR · +15% VALUE",
    },
    {
      id: "PACK_480",
      title: "Archivist Chest",
      credits: 480,
      priceUsd: "$19.99",
      priceVnd: "499.000 ₫",
      desc: "Includes +80 bonus CR. Perfect for monthly intensive inquiry.",
      badge: "RECOMMENDED",
    },
    {
      id: "PACK_1250",
      title: "Temple Vault",
      credits: 1250,
      priceUsd: "$44.99",
      priceVnd: "1.099.000 ₫",
      desc: "Includes +250 bonus CR. Full unlock across all 5 decks.",
      badge: "BEST VALUE · +25% BONUS",
    },
  ];

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] antialiased min-h-screen flex flex-col font-body selection:bg-emerald-100 selection:text-emerald-900">
      <EditorialHeader activeTab="pricing" credits={currentBalance} />

      {/* Main Container */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto border-x border-[#E2E8F0] bg-white">
        {/* ZONE 1: LEFT RAIL NAVIGATION */}
        <aside className="hidden lg:flex w-[240px] shrink-0 bg-white border-r border-[#E2E8F0] flex-col justify-between p-4 min-h-[calc(100vh-64px)]">
          <div>
            <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
              <div className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">
                ✦ AITAROT // STORE
              </div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mt-0.5">
                Pricing & Ledger · SCR-W09
              </div>
              <div className="mt-3 inline-flex items-center space-x-1.5 px-2 py-1 bg-amber-50 border border-amber-200/80 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span className="text-[10px] font-mono text-amber-800 font-semibold">HERMETIC CREDITS STORE</span>
              </div>
            </div>

            <nav className="space-y-1 text-xs font-mono">
              <Link
                href="/"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">spa</span>
                  <span>Daily Index</span>
                </span>
                <span className="text-[10px] text-slate-400">24h</span>
              </Link>
              <Link
                href="/workbench/demo-session"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">style</span>
                  <span>Workbench</span>
                </span>
              </Link>
              <Link
                href="/decks-archive"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">collections_bookmark</span>
                  <span>5 Decks Archive</span>
                </span>
                <span className="text-[10px] text-primary bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">5 ED</span>
              </Link>
              <Link
                href="/journal"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">menu_book</span>
                  <span>Archive Journal</span>
                </span>
                <span className="text-[10px] text-slate-400">42</span>
              </Link>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 text-primary font-semibold border-l-2 border-primary pl-2.5">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-primary">store</span>
                  <span>Pricing & Store</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <Link
                href="/settings/profile"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">person</span>
                  <span>Seeker Profile</span>
                </span>
              </Link>
            </nav>
          </div>

          {/* Bottom Wallet Status Box */}
          <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl">
            <div className="flex items-center justify-between mb-1 text-[11px] font-mono uppercase text-slate-500">
              <span>Available Balance</span>
              <span className="material-symbols-outlined text-amber-600 text-base">toll</span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-headline font-bold text-2xl text-slate-900">{currentBalance}</span>
              <span className="text-xs font-mono font-bold text-primary">CR</span>
              <span className="text-[10px] text-slate-400 font-mono ml-auto">Free Seeker</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-600 font-medium">+5 CR Daily Login</span>
              <button
                type="button"
                onClick={handleClaimDaily}
                disabled={claimedDaily}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold transition-colors ${
                  claimedDaily
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-emerald-700"
                }`}
              >
                {claimedDaily ? "Claimed" : "Claim"}
              </button>
            </div>
          </div>
        </aside>

        {/* ZONE 2: CENTER MAIN STORE CANVAS */}
        <main className="flex-1 bg-[#FAF9F6] border-r border-[#E2E8F0] overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[760px] mx-auto space-y-8">
            {/* Header & Billing Cycle Toggle */}
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-primary uppercase tracking-wider mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>HYBRID MEMBERSHIP & CREDIT STORE (FR-6.1 – FR-6.3)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="font-headline text-3xl md:text-4xl text-slate-900 font-bold tracking-tight">
                    Sanctuary Passes & Resonances
                  </h1>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed max-w-lg">
                    Choose predictable daily archival allowances with Archival Pro, or acquire non-expiring credit pouches for disciplined tactical inquiries.
                  </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="inline-flex p-1 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono shrink-0 shadow-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("monthly");
                      setSelectedProduct({
                        id: "PRO_MONTHLY",
                        title: "Archival Pro Pass (Monthly)",
                        priceUsd: "$6.99",
                        priceVnd: "149.000 ₫",
                        credits: 50,
                        type: "plan",
                      });
                    }}
                    className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                      billingCycle === "monthly"
                        ? "bg-primary text-white font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("annual");
                      setSelectedProduct({
                        id: "PRO_PASS",
                        title: "Archival Pro Pass (Annual)",
                        priceUsd: "$49.00",
                        priceVnd: "1.090.000 ₫",
                        credits: 600,
                        type: "plan",
                      });
                    }}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 ${
                      billingCycle === "annual"
                        ? "bg-primary text-white font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                      Save 30%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 01: MEMBERSHIP TIER COMPARISON */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                  01 // MEMBERSHIP TIER COMPARISON
                </h2>
                <span className="text-[11px] font-mono text-slate-400">Recurring Hermetic Protocol</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Seeker Tier */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tier 01 • Baseline</span>
                        <h3 className="font-headline text-xl font-bold text-slate-900">Free Seeker Tier</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono font-medium">
                        CURRENT BASELINE
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline space-x-1">
                        <span className="font-headline text-3xl font-bold text-slate-900">$0</span>
                        <span className="text-xs font-mono text-slate-500">/ Forever</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Essential tools for single daily reflections and basic inquiry.</p>
                    </div>

                    <div className="border-t border-[#E2E8F0] pt-4 space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check</span>
                        <span><strong>1 Free Daily Card Draw</strong> every midnight (0 CR cost)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check</span>
                        <span><strong>1 Basic 3-Card Spread</strong> per calendar day</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check</span>
                        <span>3 Free 78-Card Decks unlocked (ED-01..03)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check</span>
                        <span>Last 10 Journal Entries encrypted locally</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-mono font-medium cursor-not-allowed uppercase"
                    >
                      Active Baseline
                    </button>
                  </div>
                </div>

                {/* Archival Pro Membership */}
                <div
                  onClick={() =>
                    setSelectedProduct({
                      id: billingCycle === "annual" ? "PRO_PASS_ANNUAL" : "PRO_PASS_MONTHLY",
                      title: billingCycle === "annual" ? "Archival Pro Pass (Annual)" : "Archival Pro Pass (Monthly)",
                      priceUsd: billingCycle === "annual" ? "$49.00" : "$6.99",
                      priceVnd: billingCycle === "annual" ? "1.090.000 ₫" : "149.000 ₫",
                      credits: billingCycle === "annual" ? 600 : 50,
                      type: "plan",
                    })
                  }
                  className={`bg-white rounded-xl p-5 relative shadow-sm flex flex-col justify-between cursor-pointer transition-all border-2 ${
                    selectedProduct.type === "plan" ? "border-primary bg-emerald-50/20 ring-1 ring-primary/20" : "border-primary hover:shadow-md"
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-primary text-white px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold shadow-xs">
                    MOST POPULAR • FULL SANCTUARY ACCESS
                  </div>

                  <div>
                    <div className="flex items-start justify-between mb-3 mt-1">
                      <div>
                        <span className="text-[10px] font-mono text-primary uppercase tracking-wider font-semibold">Tier 02 • Unlimited Craft</span>
                        <h3 className="font-headline text-xl font-bold text-slate-900">Archival Pro Pass</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                        {billingCycle === "annual" ? "4.08 USD/mo" : "MONTHLY"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-headline text-3xl font-bold text-slate-900">
                          {billingCycle === "annual" ? "$49" : "$6.99"}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {billingCycle === "annual" ? "/ Year (1.090.000 ₫)" : "/ Month (149.000 ₫)"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Comprehensive esoteric synthesis with zero daily draw caps.</p>
                    </div>

                    <div className="border-t border-[#E2E8F0] pt-4 space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>
                        <span><strong>Unlimited Spreads & Inquiries</strong> (No crystal burn on daily readings)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>
                        <span><strong>All 5 Curated 78-Card Editions Unlocked</strong> (Marseille, Kyoto Sumi-e)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>
                        <span><strong>Watermark-Free 300 DPI Exports</strong> for printing & sharing</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">check_circle</span>
                        <span><strong>Full Cloud Encryption & Unlimited Journal</strong> syncing across Web & Android</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      className="w-full py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      {selectedProduct.type === "plan" ? "Selected for Checkout ✓" : "Choose Archival Pro"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 02: NON-EXPIRING CREDIT POUCHES */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                    02 // NON-EXPIRING RESONANCE POUCHES (CREDITS)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Credits never expire. Top up and deploy on complex spreads (5-card, 10-card), clarifiers, or poster prints.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-primary font-bold">1 CR ≈ 1.500 ₫</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {creditPacks.map((pack) => {
                  const isSelected = selectedProduct.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() =>
                        setSelectedProduct({
                          id: pack.id,
                          title: `${pack.title} (${pack.credits} CR)`,
                          priceUsd: pack.priceUsd,
                          priceVnd: pack.priceVnd,
                          credits: pack.credits,
                          type: "pack",
                        })
                      }
                      className={`p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? "border-primary bg-emerald-50/20 ring-1 ring-primary"
                          : "border-[#E2E8F0] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-primary uppercase">
                            {pack.badge}
                          </span>
                          <h3 className="font-headline font-bold text-base text-slate-900">{pack.title}</h3>
                        </div>
                        <div className="text-right">
                          <span className="font-headline font-bold text-lg text-slate-900 block leading-tight">
                            {pack.priceUsd}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{pack.priceVnd}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 my-2">
                        <span className="font-headline font-bold text-2xl text-slate-900">{pack.credits}</span>
                        <span className="text-xs font-mono font-bold text-primary">CR</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{pack.desc}</p>

                      <button
                        type="button"
                        className={`w-full py-1.5 rounded-lg text-xs font-mono font-semibold uppercase transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-[#FAF9F6] border border-[#E2E8F0] text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select Pouch"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 03: UNIT ECONOMICS & TRANSPARENT FEE LEDGER */}
            <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                  03 // TRANSPARENT CREDIT COST SCHEDULE (FR-6.1)
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Zero Hidden Deductions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[10px] font-mono uppercase text-slate-400">
                      <th className="py-2">Protocol Action</th>
                      <th className="py-2">Free Seeker Rate</th>
                      <th className="py-2">Archival Pro Pass</th>
                      <th className="py-2 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-slate-700 font-mono">
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">1-Card Quick Spark</td>
                      <td className="py-2.5 text-primary font-bold">0 CR (Free Daily)</td>
                      <td className="py-2.5 text-primary font-bold">0 CR (Unlimited)</td>
                      <td className="py-2.5 text-right text-slate-500">Daily focus alignment</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">3-Card Trajectory</td>
                      <td className="py-2.5">10 CR (1 Free/day)</td>
                      <td className="py-2.5 text-primary font-bold">0 CR</td>
                      <td className="py-2.5 text-right text-slate-500">Situation · Action · Outcome</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">5-Card Creative Direction</td>
                      <td className="py-2.5">15 CR</td>
                      <td className="py-2.5 text-primary font-bold">0 CR</td>
                      <td className="py-2.5 text-right text-slate-500">Project obstacle & breakthrough</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">10-Card Celtic Cross</td>
                      <td className="py-2.5">25 CR</td>
                      <td className="py-2.5 text-primary font-bold">0 CR</td>
                      <td className="py-2.5 text-right text-slate-500">Deep holistic life blueprint</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">+1 Clarifier Card</td>
                      <td className="py-2.5">5 CR</td>
                      <td className="py-2.5 text-primary font-bold">0 CR</td>
                      <td className="py-2.5 text-right text-slate-500">Unlocks hidden counter-shadow</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">Follow-up AI Question</td>
                      <td className="py-2.5">3 CR</td>
                      <td className="py-2.5 text-primary font-bold">0 CR (Up to 3/session)</td>
                      <td className="py-2.5 text-right text-slate-500">Multi-turn dialectic inquiry</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-900">9:16 Specimen Poster (300 DPI)</td>
                      <td className="py-2.5">2 CR</td>
                      <td className="py-2.5 text-primary font-bold">0 CR (Watermark-free)</td>
                      <td className="py-2.5 text-right text-slate-500">Printable artboard export</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>

        {/* ZONE 3: RIGHT CHECKOUT TERMINAL */}
        <aside className="w-full lg:w-[400px] shrink-0 bg-white p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="border-b border-[#E2E8F0] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-1">
                CHECKOUT TERMINAL // PAYOS & STRIPE
              </span>
              <h2 className="font-headline font-bold text-xl text-slate-900">Order Summary</h2>
            </div>

            {/* Selected Item Summary Card */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{selectedProduct.title}</span>
                <span className="font-headline font-bold text-lg text-slate-900">{selectedProduct.priceUsd}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                <span>VND Equivalent:</span>
                <span className="font-bold text-slate-900">{selectedProduct.priceVnd}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-primary font-semibold">
                <span>Credit Resonances:</span>
                <span>+{selectedProduct.credits} CR</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                Choose Payment Instrument
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vietqr")}
                  className={`p-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === "vietqr"
                      ? "border-primary bg-emerald-50 text-slate-900"
                      : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">qr_code_2</span>
                  <span>VietQR / PayOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`p-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === "stripe"
                      ? "border-primary bg-emerald-50 text-slate-900"
                      : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">credit_card</span>
                  <span>Stripe / Card</span>
                </button>
              </div>
            </div>

            {/* VietQR Display Stage */}
            {paymentMethod === "vietqr" ? (
              <div className="p-4 bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl text-center space-y-3">
                <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold">
                  Scan with any Vietnam Banking App (Napb)
                </div>

                {/* QR Code Graphic Frame */}
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-center">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Stylized QR Matrix */}
                    <rect x="10" y="10" width="25" height="25" fill="#0F172A" />
                    <rect x="15" y="15" width="15" height="15" fill="#FFFFFF" />
                    <rect x="18" y="18" width="9" height="9" fill="#059669" />

                    <rect x="65" y="10" width="25" height="25" fill="#0F172A" />
                    <rect x="70" y="15" width="15" height="15" fill="#FFFFFF" />
                    <rect x="73" y="18" width="9" height="9" fill="#059669" />

                    <rect x="10" y="65" width="25" height="25" fill="#0F172A" />
                    <rect x="15" y="70" width="15" height="15" fill="#FFFFFF" />
                    <rect x="18" y="73" width="9" height="9" fill="#059669" />

                    <rect x="42" y="12" width="6" height="6" fill="#0F172A" />
                    <rect x="52" y="18" width="6" height="6" fill="#0F172A" />
                    <rect x="42" y="28" width="8" height="8" fill="#059669" />
                    <rect x="52" y="38" width="6" height="6" fill="#0F172A" />
                    <rect x="40" y="48" width="12" height="6" fill="#0F172A" />
                    <rect x="60" y="48" width="6" height="12" fill="#0F172A" />
                    <rect x="70" y="52" width="8" height="8" fill="#059669" />
                    <rect x="42" y="68" width="8" height="8" fill="#0F172A" />
                    <rect x="55" y="72" width="12" height="6" fill="#059669" />
                    <rect x="75" y="72" width="10" height="10" fill="#0F172A" />
                  </svg>
                </div>

                <div className="text-left text-xs font-mono space-y-1 bg-white p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank:</span>
                    <span className="font-bold text-slate-900">MBBank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account:</span>
                    <span className="font-bold text-slate-900">0987654321</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-bold text-slate-900">AITAROT ARCHIVE STUDIO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Memo:</span>
                    <span className="font-bold text-primary">TAROT-CR-8841</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl space-y-3">
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    className="w-full bg-white border border-[#E2E8F0] rounded p-2 text-xs font-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="bg-white border border-[#E2E8F0] rounded p-2 text-xs font-mono"
                    />
                    <input
                      type="text"
                      defaultValue="884"
                      className="bg-white border border-[#E2E8F0] rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {transferSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-1">
                <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                <h4 className="font-headline font-bold text-base text-emerald-950">Payment Confirmed!</h4>
                <p className="text-xs text-emerald-800">
                  +{selectedProduct.credits} CR credited instantly to your vault.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCompleteOrder}
                className="w-full py-3.5 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Complete Order ({selectedProduct.priceVnd})</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            )}

            <div className="text-[10px] font-mono text-slate-400 text-center space-y-1">
              <div>Instant webhook fulfillment via PayOS & VietQR 24/7.</div>
              <div>VAT invoice eligible • Refund guarantee within 48h.</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
