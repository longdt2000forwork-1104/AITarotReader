"use client";

import { useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileSeekerProfilePage() {
  const { locale, setLocale } = useLanguage();
  const [allowAiContext, setAllowAiContext] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<"MYSTIC" | "SPARK" | "GENTLE">("SPARK");
  const [credits, setCredits] = useState(45);
  const [claimedDaily, setClaimedDaily] = useState(false);

  const handleClaimDaily = () => {
    if (!claimedDaily) {
      setCredits(credits + 5);
      setClaimedDaily(true);
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <main className="w-full max-w-[412px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-28 border-x border-[#E2E8F0] shadow-sm">
        {/* 1. Android Status Bar */}
        <header className="w-full pt-3 px-6 pb-2 flex justify-between items-center text-slate-800 select-none bg-white">
          <span className="font-mono text-xs font-bold">09:41</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="material-symbols-outlined text-[16px]">signal_cellular_4_bar</span>
            <span className="material-symbols-outlined text-[16px]">wifi</span>
            <span className="material-symbols-outlined text-[18px]">battery_full</span>
          </div>
        </header>

        {/* 2. Top Title Bar */}
        <div className="px-6 py-2.5 flex items-center justify-between border-b border-[#E2E8F0] bg-white sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary text-xl">person</span>
            <h1 className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">
              Seeker Profile & Settings
            </h1>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            SCR-M10
          </span>
        </div>

        {/* 3. Seeker Identity Card */}
        <div className="p-4 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-14 h-14 rounded-full border-2 border-primary bg-slate-50 flex items-center justify-center shrink-0">
              <span className="font-headline font-bold text-lg text-primary">AN</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                <span className="material-symbols-outlined text-[12px]">spa</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-bold text-base text-slate-900 truncate">
                  Aria M. Nguyen
                </h2>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-[9px] uppercase font-bold">
                  ARCHIVAL PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">aria.nguyen@studio.vn</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-primary font-medium">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                <span>Google OAuth2 Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Settings Sections */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Section 01: Mystic Blueprint */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                01 // MYSTIC BLUEPRINT (FR-1.2)
              </span>
              <span className="text-[10px] font-mono text-slate-400">12/04/1998</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                <span className="text-[9px] font-mono text-primary font-bold block">SUN SIGN · ♈ ARIES</span>
                <span className="font-headline font-bold text-slate-900 text-sm block mt-0.5">IV The Emperor</span>
                <span className="text-[10px] text-slate-500 font-mono">Cardinal Will</span>
              </div>
              <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                <span className="text-[9px] font-mono text-primary font-bold block">LIFE PATH · 07</span>
                <span className="font-headline font-bold text-slate-900 text-sm block mt-0.5">IX The Hermit</span>
                <span className="text-[10px] text-slate-500 font-mono">Inner Lantern</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">AI Contextual Memory</span>
                <span className="text-[10px] text-slate-500 leading-tight block">
                  Infuse Aries Decan II into AI readings
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAllowAiContext(!allowAiContext)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  allowAiContext ? "bg-primary" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform block mt-0.5 ${
                    allowAiContext ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Section 02: Deck & Reader Persona */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                02 // DECK & VOICE CONFIGURATION
              </span>
              <Link href="/app/decks" className="text-[10px] font-mono text-primary hover:underline font-semibold">
                Change Deck →
              </Link>
            </div>

            <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Current Archival Deck</span>
                <div className="font-headline font-bold text-xs text-slate-900">
                  ED-02 Sunlit Botanical Herbarium
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-primary text-white font-bold rounded">
                ACTIVE
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                Default Reader Persona
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { code: "MYSTIC", name: "Classic Mystic" },
                  { code: "SPARK", name: "Idea Spark" },
                  { code: "GENTLE", name: "Gentle Friend" },
                ].map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setSelectedPersona(p.code as any)}
                    className={`py-2 px-1 rounded-lg border text-center transition-all ${
                      selectedPersona === p.code
                        ? "border-primary bg-emerald-50 text-slate-900 font-bold"
                        : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-[11px] leading-tight">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 03: Wallet & Billing Summary */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                03 // WALLET & SUBSCRIPTION (SCR-M07)
              </span>
              <Link href="/app/billing" className="text-[10px] font-mono text-primary hover:underline font-semibold">
                Manage Billing →
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Available Balance</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-headline font-bold text-2xl text-slate-900">{credits}</span>
                  <span className="text-xs font-mono font-bold text-primary">CR</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClaimDaily}
                disabled={claimedDaily}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                  claimedDaily
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-emerald-700 shadow-xs"
                }`}
              >
                {claimedDaily ? "Claimed ✓" : "+5 CR Daily Claim"}
              </button>
            </div>
          </section>

          {/* Section 04: Language & Export Data */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                04 // APPLICATION & PRIVACY
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Language / Ngôn Ngữ</span>
                <span className="text-[10px] text-slate-500 font-mono">Bilingual switch (EN / VI)</span>
              </div>
              <div className="flex items-center border border-[#E2E8F0] rounded text-xs font-mono overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`px-2.5 py-1 ${
                    locale === "en" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("vi")}
                  className={`px-2.5 py-1 ${
                    locale === "vi" ? "bg-primary text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  VI
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Export Journal Data</span>
                <span className="text-[10px] text-slate-500 font-mono">Encrypted readings JSON</span>
              </div>
              <button
                type="button"
                onClick={() => alert("Exporting JSON archive...")}
                className="px-2.5 py-1 border border-[#E2E8F0] bg-[#FAF9F6] hover:bg-slate-100 rounded text-xs font-mono text-slate-700"
              >
                Export JSON
              </button>
            </div>
          </section>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav activeTab="profile" />
      </main>
    </div>
  );
}
