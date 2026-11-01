"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileShareStudioPage() {
  const params = useParams();
  const readingId = (params?.id as string) || "demo-session";
  const { locale } = useLanguage();

  const [activeTab, setActiveTab] = useState<"studio" | "journal">("studio");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1">("9:16");
  const [theme, setTheme] = useState<"cream" | "sage" | "slate">("cream");
  const [includeQuestion, setIncludeQuestion] = useState(true);
  const [reflectionNote, setReflectionNote] = useState(
    "Felt a strong resonance with IX The Hermit. Need to decline speaking invitations this month to finish the manuscript."
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const themeStyles = {
    cream: "bg-[#FAF9F6] border-[#0F172A] text-[#0F172A]",
    sage: "bg-[#F2F7F4] border-[#065F46] text-[#065F46]",
    slate: "bg-[#F8FAFC] border-[#334155] text-[#0F172A]",
  };

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[420px] bg-white min-h-screen flex flex-col shadow-xl border-x border-[#E2E8F0] relative pb-28">
        {/* 1. Top Header Bar */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <Link
            href={`/app/readings/${readingId}`}
            className="flex items-center gap-1 text-[#0F172A] hover:text-primary transition-colors text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back</span>
          </Link>

          {/* Segmented Switcher */}
          <div className="inline-flex items-center p-0.5 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setActiveTab("studio")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                activeTab === "studio"
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Share Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("journal")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                activeTab === "journal"
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Journal Note
            </button>
          </div>

          <button
            type="button"
            onClick={() => alert("Saved to journal repository.")}
            className="text-xs font-semibold text-primary hover:text-[#047857] transition-colors px-1 py-1 font-mono uppercase"
          >
            Save
          </button>
        </header>

        {/* Subheader Meta Banner */}
        <div className="px-4 py-1.5 bg-[#FAF9F6] border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
            SPECIMEN EXPORT // ARCHIVAL PRINT
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary font-bold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
            300 DPI READY
          </span>
        </div>

        {activeTab === "studio" ? (
          <>
            {/* 2. Poster Preview Stage */}
            <section className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-4 py-5 flex justify-center items-center overflow-hidden">
              <div
                className={`p-4 flex flex-col justify-between max-w-[290px] w-full shadow-md relative transition-all duration-300 border ${
                  aspectRatio === "9:16" ? "aspect-[9/15]" : "aspect-square"
                } ${themeStyles[theme]}`}
              >
                {/* Inner Border Inset */}
                <div className="absolute inset-1 border border-[#E2E8F0] pointer-events-none" />

                {/* Top Colophon */}
                <div className="relative z-10 text-center border-b border-[#E2E8F0] pb-2">
                  <div className="flex items-center justify-between text-[9px] tracking-widest text-slate-500 font-mono uppercase">
                    <span>SPECIMEN NO. 042</span>
                    <span>OCT 31, 2026</span>
                  </div>
                  {includeQuestion && (
                    <h1 className="font-headline italic text-[14px] font-bold text-slate-900 tracking-tight leading-snug mt-1.5">
                      &ldquo;Creative Direction for Project Launch&rdquo;
                    </h1>
                  )}
                </div>

                {/* 3 Botanical Woodcut Tarot Card Specimens */}
                <div className="relative z-10 my-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Card 1 */}
                    <div className="bg-white border border-[#0F172A] p-1.5 flex flex-col items-center text-center">
                      <span className="text-[9px] font-mono font-semibold text-slate-500">I</span>
                      <div className="w-full aspect-[3/4] my-1 bg-[#FAF9F6] border border-[#E2E8F0] flex flex-col items-center justify-center p-1">
                        <span className="material-symbols-outlined text-slate-900 text-xl">auto_fix_high</span>
                        <span className="text-[7px] text-slate-500 uppercase mt-1">Conduit</span>
                      </div>
                      <div className="text-[9px] font-headline font-bold text-slate-900 truncate w-full">Magician</div>
                      <div className="text-[7.5px] uppercase tracking-wider text-primary font-bold">Upright</div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-[#0F172A] p-1.5 flex flex-col items-center text-center">
                      <span className="text-[9px] font-mono font-semibold text-slate-500">IX</span>
                      <div className="w-full aspect-[3/4] my-1 bg-[#FAF9F6] border border-[#E2E8F0] flex flex-col items-center justify-center p-1">
                        <span className="material-symbols-outlined text-slate-900 text-xl">wb_incandescent</span>
                        <span className="text-[7px] text-slate-500 uppercase mt-1">Sage</span>
                      </div>
                      <div className="text-[9px] font-headline font-bold text-slate-900 truncate w-full">Hermit</div>
                      <div className="text-[7.5px] uppercase tracking-wider text-primary font-bold">Upright</div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white border border-[#0F172A] p-1.5 flex flex-col items-center text-center">
                      <span className="text-[9px] font-mono font-semibold text-slate-500">XIX</span>
                      <div className="w-full aspect-[3/4] my-1 bg-[#FAF9F6] border border-[#E2E8F0] flex flex-col items-center justify-center p-1">
                        <span className="material-symbols-outlined text-slate-900 text-xl">wb_sunny</span>
                        <span className="text-[7px] text-slate-500 uppercase mt-1">Radiance</span>
                      </div>
                      <div className="text-[9px] font-headline font-bold text-slate-900 truncate w-full">The Sun</div>
                      <div className="text-[7.5px] uppercase tracking-wider text-primary font-bold">Upright</div>
                    </div>
                  </div>
                </div>

                {/* Base Synthesis Quote & Colophon */}
                <div className="relative z-10 border-t border-[#E2E8F0] pt-2 text-center space-y-1">
                  <p className="font-serif italic text-[10px] text-slate-700 leading-tight">
                    &ldquo;Illuminate before announcing. Construct your thesis in daylight.&rdquo;
                  </p>
                  <div className="text-[8px] font-mono uppercase tracking-widest text-slate-400">
                    AITAROT ARCHIVAL PRESS · RWS 1909
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Studio Controls */}
            <main className="p-4 space-y-4">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                  Artboard Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      aspectRatio === "9:16"
                        ? "border-primary bg-emerald-50 text-slate-900"
                        : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">crop_portrait</span>
                    <span>9:16 Story / Reel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("1:1")}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      aspectRatio === "1:1"
                        ? "border-primary bg-emerald-50 text-slate-900"
                        : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">crop_square</span>
                    <span>1:1 Square Feed</span>
                  </button>
                </div>
              </div>

              {/* Theme Palette */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                  Paper Texture Palette
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "cream", label: "Archival Cream", swatch: "bg-[#FAF9F6]" },
                    { id: "sage", label: "Botanical Sage", swatch: "bg-[#F2F7F4]" },
                    { id: "slate", label: "Editorial Slate", swatch: "bg-[#F8FAFC]" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTheme(p.id as any)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        theme === p.id
                          ? "border-primary ring-1 ring-primary bg-emerald-50/20"
                          : "border-[#E2E8F0] hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-full h-3 rounded ${p.swatch} border border-[#CBD5E1] mb-1`} />
                      <span className="text-[10px] font-mono font-semibold block text-slate-800">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Question Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Print Question Header</span>
                  <span className="text-[10px] text-slate-500 font-mono">Show user inquiry on artboard</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeQuestion(!includeQuestion)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    includeQuestion ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform block mt-0.5 ${
                      includeQuestion ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </main>
          </>
        ) : (
          /* Journal Entry Reflection Mode */
          <main className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1">
                Reflective Field Notes (FR-4.2)
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Record your real-world outcomes and sync with your encrypted journal ledger.
              </p>
              <textarea
                rows={8}
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Write your reflections and observations here..."
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">check_circle</span>
              <span>Encrypted with local Vault Key. Syncs with Web & Android.</span>
            </div>
          </main>
        )}

        {/* 4. Bottom Sticky Action Dock */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t border-[#E2E8F0] p-3 shadow-lg z-40 space-y-2">
          {downloadSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-center text-xs font-mono text-emerald-900 font-semibold">
              300 DPI Specimen Print Exported Successfully! (2 CR)
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-3 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download High-Res Print (2 CR)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2 bg-[#FAF9F6] border border-[#E2E8F0] hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>{copiedLink ? "Link Copied to Clipboard ✓" : "Copy Secure Share Link"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
