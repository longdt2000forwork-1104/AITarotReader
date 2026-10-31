"use client";

import { useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";

export default function SeekerProfilePage() {
  const { locale, setLocale } = useLanguage();
  const [allowAiContext, setAllowAiContext] = useState(true);
  const [stalkerAlerts, setStalkerAlerts] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<"MYSTIC" | "SPARK" | "GENTLE">("SPARK");
  const [selectedDeck, setSelectedDeck] = useState("ED-02");
  const [credits, setCredits] = useState(120);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleClaimDaily = () => {
    if (!claimedDaily) {
      setCredits(credits + 5);
      setClaimedDaily(true);
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] antialiased min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-body">
      <EditorialHeader activeTab="settings" credits={credits} />

      {/* Main 3-Zone Architecture Container */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto border-x border-[#E2E8F0] bg-white">
        {/* ZONE 1: LEFT RAIL NAVIGATION (240px) */}
        <aside className="hidden lg:flex w-[240px] shrink-0 bg-white border-r border-[#E2E8F0] flex-col justify-between p-4 min-h-[calc(100vh-64px)]">
          <div>
            <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
              <div className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">
                ✦ AITAROT // VAULT
              </div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mt-0.5">
                Seeker Console · SCR-W08
              </div>
              <div className="mt-3 inline-flex items-center space-x-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-mono text-primary font-semibold">ONLINE · ENCRYPTED</span>
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
                href="/catalog-picker"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">grid_view</span>
                  <span>78-Card Input</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">78</span>
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
              <Link
                href="/pricing"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">store</span>
                  <span>Pricing & Store</span>
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">CR</span>
              </Link>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 text-primary font-semibold border-l-2 border-primary pl-2.5">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-primary">person</span>
                  <span>Seeker Profile</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </nav>
          </div>

          {/* Rail Colophon */}
          <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
            <div className="flex items-center space-x-2 mb-1 text-xs font-semibold text-slate-900 font-mono">
              <span className="material-symbols-outlined text-primary text-base">park</span>
              <span>Active Deck Token</span>
            </div>
            <div className="text-xs text-slate-800 font-medium">ED-02 Sunlit Botanical</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">78 Engravings · Archival Ink</div>
          </div>
        </aside>

        {/* ZONE 2: CENTER COLUMN (Seeker Identity, Mystic Blueprint & AI Memory) */}
        <main className="flex-1 bg-[#FAF9F6] p-6 lg:p-8 overflow-y-auto max-w-[780px] border-r border-[#E2E8F0]">
          {/* Top Context Banner */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2E8F0]">
            <div>
              <h1 className="font-headline font-bold text-2xl text-slate-900 tracking-tight">
                SEEKER PROFILE // REPOSITORY #8841-A
              </h1>
              <p className="text-xs font-mono uppercase text-slate-500 tracking-wider mt-0.5">
                Natal Blueprint & AI Contextual Memory Studio (FR-1.2 & FR-1.3)
              </p>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 bg-white border border-[#E2E8F0] rounded font-mono text-[10px] text-slate-500">
              LAST SYNCED: OCT 31, 2026
            </span>
          </div>

          {/* CARD 01: Seeker Identity & Account Credentials */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">01 //</span>
                <h2 className="font-headline font-bold text-base text-slate-900">
                  Seeker Identity & Credentials
                </h2>
              </div>
              <span className="material-symbols-outlined text-slate-400">badge</span>
            </div>

            <div className="flex items-start space-x-4">
              <div className="relative w-14 h-14 rounded-full border-2 border-primary bg-slate-50 flex items-center justify-center shrink-0">
                <span className="font-headline font-bold text-xl text-primary">AN</span>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                  <span className="material-symbols-outlined text-[12px]">spa</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-headline font-bold text-lg text-slate-900">Aria M. Nguyen</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold">
                    ARCHIVAL PRO SUBSCRIBER
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    aria.nguyen@studio.vn
                  </span>
                  <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-primary">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Google OAuth2 Connected</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs text-slate-600 flex-wrap gap-2">
                  <span>Subscription renews: <strong className="text-slate-900">Nov 30, 2026</strong></span>
                  <div className="flex items-center space-x-1 bg-[#FAF9F6] border border-[#E2E8F0] px-2.5 py-1 rounded text-xs font-mono">
                    <span>Language:</span>
                    <button
                      onClick={() => setLocale(locale === "en" ? "vi" : "en")}
                      className="font-bold text-primary hover:underline"
                    >
                      {locale === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 02: Mystic Blueprint & Natal Calibration */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">02 //</span>
                <h2 className="font-headline font-bold text-base text-slate-900">
                  Mystic Blueprint & Natal Calibration (FR-1.2)
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                NATAL CORRELATION
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Synthesized by the AI Engine to harmonize card archetypes and reading trajectories with your core energetic decans.
            </p>

            <div className="bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg p-3 mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-white border border-[#E2E8F0] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500">Date of Birth & Ephemeris</div>
                  <div className="font-mono text-sm font-bold text-slate-900">12 / 04 / 1998</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-slate-500">Ascendant Coordinates</div>
                <div className="text-xs font-mono text-slate-700">04:15 ICT · Hanoi (21.02° N, 105.83° E)</div>
              </div>
            </div>

            {/* Specimen summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center space-x-3">
                <div className="w-10 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center font-headline font-bold text-lg text-primary">
                  IV
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500">Sun Sign · ♈ Aries</span>
                  <div className="font-headline font-bold text-sm text-slate-900">IV The Emperor</div>
                  <span className="text-[10px] text-primary font-mono">Cardinal Will · Mars</span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center space-x-3">
                <div className="w-10 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center font-headline font-bold text-lg text-slate-700">
                  IX
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500">Life Path · 07 Seeker</span>
                  <div className="font-headline font-bold text-sm text-slate-900">IX The Hermit</div>
                  <span className="text-[10px] text-slate-600 font-mono">Inner Lantern · Wisdom</span>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 03: Preferred Deck Edition & Voice Persona */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">03 //</span>
                <h2 className="font-headline font-bold text-base text-slate-900">
                  Deck Edition & Voice Persona (FR-2.4 & FR-3.1)
                </h2>
              </div>
            </div>

            {/* Deck Selector */}
            <div className="mt-3">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-2">
                Preferred Archival Deck
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "ED-01", name: "Rider-Waite-Smith 1909", badge: "CANONICAL" },
                  { id: "ED-02", name: "Sunlit Botanical Herbarium", badge: "ACTIVE · PRIMARY" },
                  { id: "ED-03", name: "Swiss Geometric Construct", badge: "PRO" },
                  { id: "ED-04", name: "Marseille 1760 Heritage", badge: "PRO" },
                ].map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => setSelectedDeck(deck.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      selectedDeck === deck.id
                        ? "border-primary bg-emerald-50/50 text-slate-900"
                        : "border-[#E2E8F0] hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{deck.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{deck.id} · 78 Cards</div>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        selectedDeck === deck.id ? "bg-primary text-white font-bold" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {deck.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reader Persona Selector */}
            <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-2">
                Default Synthesis Voice Persona
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: "MYSTIC", title: "Classic Mystic", desc: "Esoteric, poetic, archetypal" },
                  { code: "SPARK", title: "Idea Spark", desc: "Tactical, direct, creative catalyst" },
                  { code: "GENTLE", title: "Gentle Friend", desc: "Compassionate, mindful, reassuring" },
                ].map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setSelectedPersona(p.code as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedPersona === p.code
                        ? "border-primary bg-emerald-50 text-slate-900"
                        : "border-[#E2E8F0] hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold">{p.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CARD 04: AI Context Guardrail & Memory Management */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">04 //</span>
                <h2 className="font-headline font-bold text-base text-slate-900">
                  AI Context Guardrail & Memory (FR-1.3)
                </h2>
              </div>
              <span className="material-symbols-outlined text-primary">psychology</span>
            </div>

            <div className="space-y-3 mt-3">
              <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Allow Natal Decan Context Injection</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Weaves your Aries Sun & Life Path 7 into reading synthesis and advice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowAiContext(!allowAiContext)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                    allowAiContext ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ${
                      allowAiContext ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Stalker Card Recurring Pattern Detection</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Alerts you when a card appears &ge; 3 times in 30 days (Current: IX The Hermit, 4 times).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStalkerAlerts(!stalkerAlerts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                    stalkerAlerts ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ${
                      stalkerAlerts ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ZONE 3: RIGHT COLUMN (Archival Pro Pass, Crystals, Ledger & Export) */}
        <aside className="hidden xl:flex w-[360px] shrink-0 bg-white p-6 flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Membership Pass */}
            <div className="p-5 rounded-xl border-2 border-primary bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/30 relative shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  SANCTUARY PASS
                </span>
                <span className="material-symbols-outlined text-primary text-lg">verified</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-slate-900">Archival Pro Pass</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Unlimited daily draws, watermark-free 300 DPI exports, 5 full Tarot editions unlocked.
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Auto-renews:</span>
                <span className="font-bold text-slate-900">Nov 30, 2026</span>
              </div>
              <Link
                href="/pricing"
                className="mt-3 block text-center py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Manage Membership Plan
              </Link>
            </div>

            {/* Crystals Ledger Balance Box */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Resonance Balance
                </span>
                <span className="material-symbols-outlined text-amber-600 text-lg">toll</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-headline font-bold text-3xl text-slate-900">{credits}</span>
                <span className="text-xs font-mono font-bold text-primary">CR</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">Archival Tier</span>
              </div>

              <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">+5 CR Daily Login</div>
                  <div className="text-[10px] text-slate-400 font-mono">Available every midnight</div>
                </div>
                <button
                  type="button"
                  disabled={claimedDaily}
                  onClick={handleClaimDaily}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-colors ${
                    claimedDaily
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-emerald-700"
                  }`}
                >
                  {claimedDaily ? "Claimed ✓" : "Claim"}
                </button>
              </div>

              <Link
                href="/pricing"
                className="mt-3 block text-center py-1.5 border border-[#E2E8F0] bg-white hover:bg-slate-50 rounded text-xs font-mono text-slate-700 transition-colors"
              >
                Purchase Credit Pouches →
              </Link>
            </div>

            {/* Data Sovereignty & Export */}
            <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-900">
                <span className="material-symbols-outlined text-slate-500 text-base">download</span>
                <span>Data Sovereignty (FR-4.2)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Export all reading sessions, reflection notes, and synthesis histories to an encrypted archive.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => alert("Downloading readings_export.json")}
                  className="py-1.5 px-3 bg-[#FAF9F6] border border-[#E2E8F0] hover:bg-slate-100 rounded text-xs font-mono text-slate-800 transition-colors flex items-center justify-center gap-1"
                >
                  <span>JSON File</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Exporting printable PDF archive")}
                  className="py-1.5 px-3 bg-[#FAF9F6] border border-[#E2E8F0] hover:bg-slate-100 rounded text-xs font-mono text-slate-800 transition-colors flex items-center justify-center gap-1"
                >
                  <span>PDF Print</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-700 font-bold block">
                DANGER ZONE
              </span>
              <p className="text-[11px] text-slate-600">
                Permanently purge all readings, journal reflections, and personal mystic configurations.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full mt-1 py-1.5 border border-red-300 text-red-700 hover:bg-red-100/60 rounded text-xs font-mono font-semibold transition-colors"
              >
                Delete Account & Purge Vault
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] text-[10px] font-mono text-slate-400 flex justify-between items-center">
            <span>AITAROT VAULT v2.3</span>
            <span>RWS 1909 COMPLIANT</span>
          </div>
        </aside>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] max-w-md w-full p-6 shadow-xl">
            <h3 className="font-headline font-bold text-xl text-red-700 mb-2">Purge Archival Vault?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              This action cannot be undone. All 42 journal entries, personal natal blueprints, and unlocked deck configurations will be permanently deleted from our encrypted database.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-[#E2E8F0] text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Account deleted.");
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
