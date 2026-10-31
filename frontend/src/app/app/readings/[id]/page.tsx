"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileReadingReportPage() {
  const params = useParams();
  const readingId = (params?.id as string) || "demo-session";
  const { locale } = useLanguage();

  const [hasClarifier, setHasClarifier] = useState(true);
  const [followUpCount, setFollowUpCount] = useState(1);
  const [questionInput, setQuestionInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "user",
      text: "How should I structure my creative time during the Hermit phase?",
    },
    {
      sender: "ai",
      text: "Isolate a 90-minute morning deep-work block strictly for solitary drafting. Do not seek external validation or feedback until the core prototype is physically tangible.",
    },
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || followUpCount >= 3) return;

    const userText = questionInput;
    setQuestionInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setFollowUpCount((prev) => prev + 1);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Focus your attention on grounding the initial spark into written notes. The cards indicate your outcome (XIX The Sun) will emerge naturally once the foundation is steady.`,
        },
      ]);
    }, 800);
  };

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[420px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-48 border-x border-[#E2E8F0] shadow-sm">
        {/* 1. Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
          <Link
            href="/app/home"
            className="flex items-center gap-1 text-[#0F172A] hover:text-primary transition-colors text-xs font-mono font-medium"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Back</span>
          </Link>
          <div className="flex flex-col items-center text-center px-1">
            <h1 className="font-headline font-bold text-sm tracking-tight text-slate-900 leading-tight">
              Synthesis Report // 3-Card
            </h1>
            <span className="text-[10px] text-slate-500 truncate max-w-[170px] font-mono">
              Creative Launch Trajectory
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-[#FDE68A]">
              <span className="material-symbols-outlined text-xs">toll</span>
              45 CR
            </span>
            <Link
              href={`/app/readings/${readingId}/share`}
              className="text-slate-600 hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-100"
              title="Export Specimen Poster"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </Link>
          </div>
        </header>

        {/* 2. Pinned Drawn Cards Summary Strip */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Card 01 */}
            <div className="shrink-0 bg-white border border-[#E2E8F0] rounded px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
              <img
                src="/decks/rider-waite-1909/cards/01_the_magician.webp"
                alt="I. Magician"
                className="w-5 h-8 object-cover rounded border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">01 · SIT</span>
                <span className="font-headline font-bold text-xs text-slate-900">I. Magician ↑</span>
              </div>
            </div>

            {/* Card 02 */}
            <div className="shrink-0 bg-white border border-[#E2E8F0] rounded px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
              <img
                src="/decks/rider-waite-1909/cards/09_the_hermit.webp"
                alt="IX. Hermit"
                className="w-5 h-8 object-cover rounded border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">02 · ACT</span>
                <span className="font-headline font-bold text-xs text-slate-900">IX. Hermit ↑</span>
              </div>
            </div>

            {/* Card 03 */}
            <div className="shrink-0 bg-white border border-[#E2E8F0] rounded px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
              <img
                src="/decks/rider-waite-1909/cards/19_the_sun.webp"
                alt="XIX. Sun"
                className="w-5 h-8 object-cover rounded border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">03 · OUT</span>
                <span className="font-headline font-bold text-xs text-slate-900">XIX. Sun ↑</span>
              </div>
            </div>

            {/* Card 04 (Clarifier) */}
            {hasClarifier ? (
              <div className="shrink-0 bg-emerald-50 border border-primary/40 rounded px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
                <img
                  src="/decks/rider-waite-1909/cards/76_queen_of_pentacles.webp"
                  alt="Queen of Pentacles"
                  className="w-5 h-8 object-cover rounded border border-emerald-300"
                />
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-primary font-bold">+1 CLARIFIER</span>
                  <span className="font-headline font-bold text-xs text-emerald-950">Q. Pentacles ↑</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setHasClarifier(true)}
                className="shrink-0 border border-dashed border-primary/50 bg-white hover:bg-emerald-50/50 rounded px-2.5 py-1.5 flex items-center gap-1.5 text-primary text-xs font-mono font-semibold"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Clarifier (5 CR)</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Main Reading Content Scroll */}
        <main className="p-4 space-y-6">
          {/* Section 01: Elemental Synthesis */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                01 // Elemental Dynamics
              </h3>
              <span className="text-[10px] font-mono text-primary font-semibold">Fire Dominated (50%)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                <span className="block text-amber-900 font-bold">50%</span>
                <span className="text-[10px] text-amber-700">Fire 🔥</span>
              </div>
              <div className="p-2 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                <span className="block text-emerald-900 font-bold">25%</span>
                <span className="text-[10px] text-emerald-700">Earth 🌿</span>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg">
                <span className="block text-slate-800 font-bold">25%</span>
                <span className="text-[10px] text-slate-600">Air 💨</span>
              </div>
              <div className="p-2 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <span className="block text-blue-900 font-bold">0%</span>
                <span className="text-[10px] text-blue-600">Water 💧</span>
              </div>
            </div>
          </section>

          {/* Section 02: Position-by-Position Analysis */}
          <section className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              02 // Arcana Breakdown
            </h3>

            {/* Position 1 */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  POSITION 01 · SITUATION
                </span>
                <span className="text-[10px] font-mono text-slate-400">UPRIGHT ↑</span>
              </div>
              <div className="flex gap-3 items-start">
                <img
                  src="/decks/rider-waite-1909/cards/01_the_magician.webp"
                  alt="The Magician"
                  className="w-14 h-22 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-headline font-bold text-base text-slate-900">
                    I. The Magician (Nhà Ảo Thuật)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All constituent tools are arrayed upon your work surface. You possess the intellectual, creative, and material sovereignty required to materialize your concept.
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded text-xs text-slate-700 italic font-serif">
                &ldquo;Do not ask if you are ready; the materials are already in your hands.&rdquo;
              </div>
            </div>

            {/* Position 2 */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  POSITION 02 · ACTION
                </span>
                <span className="text-[10px] font-mono text-slate-400">UPRIGHT ↑</span>
              </div>
              <div className="flex gap-3 items-start">
                <img
                  src="/decks/rider-waite-1909/cards/09_the_hermit.webp"
                  alt="The Hermit"
                  className="w-14 h-22 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-headline font-bold text-base text-slate-900">
                    IX. The Hermit (Ẩn Sĩ)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Step back from consensus noise and public declarations. Withdraw to your inner mountain to synthesize your unique intellectual signature.
                  </p>
                </div>
              </div>
            </div>

            {/* Position 3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  POSITION 03 · OUTCOME
                </span>
                <span className="text-[10px] font-mono text-slate-400">UPRIGHT ↑</span>
              </div>
              <div className="flex gap-3 items-start">
                <img
                  src="/decks/rider-waite-1909/cards/19_the_sun.webp"
                  alt="The Sun"
                  className="w-14 h-22 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-headline font-bold text-base text-slate-900">
                    XIX. The Sun (Mặt Trời)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Unambiguous daylight clarity, authentic recognition, and vital vitality. What begins in contemplative solitude culminates in radiant public triumph.
                  </p>
                </div>
              </div>
            </div>

            {/* Clarifier Position */}
            {hasClarifier && (
              <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    +1 CLARIFIER · MATERIAL GROUNDING
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800">5 CR CONSUMED</span>
                </div>
                <div className="flex gap-3 items-start">
                  <img
                    src="/decks/rider-waite-1909/cards/76_queen_of_pentacles.webp"
                    alt="Queen of Pentacles"
                    className="w-14 h-22 object-cover rounded border border-emerald-300 shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-headline font-bold text-base text-emerald-950">
                      Queen of Pentacles (Hậu Tiền)
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Ground high creative vision into sustainable physical rhythm, healthy boundaries, and financial pragmatism.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 03: Core Synthesis Thesis */}
          <section className="bg-white border-2 border-primary/80 rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              03 // SYNTHESIS THESIS
            </span>
            <h3 className="font-headline font-bold text-lg text-slate-900">
              The Arc of Illumination
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Your trajectory transitions from raw creative impulse (Magician) through deliberate, disciplined seclusion (Hermit) to unmistakable clarity (Sun). Ground this process in tangible physical milestones (Queen of Pentacles).
            </p>
          </section>

          {/* Section 04: Tactical Action Experiments */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              04 // Three Practical Experiments
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">1.</span>
                <span>Carve out a 90-minute digital blackout window tomorrow morning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">2.</span>
                <span>Document your thesis statement in one handwritten paragraph before seeking feedback.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">3.</span>
                <span>Review production costs and resource runway before announcing the launch.</span>
              </li>
            </ul>
          </section>
        </main>

        {/* 4. Bottom Sticky Dialectic Chat & Clarifier Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t border-[#E2E8F0] p-3 shadow-xl z-40 space-y-2">
          {/* Chat transcript preview */}
          {chatMessages.length > 0 && (
            <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-1.5 rounded text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-200 text-slate-900 ml-4 text-right"
                      : "bg-white text-slate-800 border border-slate-200 mr-4"
                  }`}
                >
                  <span className="font-bold font-mono text-[10px] block opacity-75">
                    {msg.sender === "user" ? "You" : "AI Oracle"}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendChat} className="flex gap-1.5">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder={
                followUpCount >= 3
                  ? "Maximum inquiries reached for this session"
                  : `Ask follow-up question (${3 - followUpCount} left)...`
              }
              disabled={followUpCount >= 3}
              className="flex-1 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={followUpCount >= 3 || !questionInput.trim()}
              className="px-3 py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase disabled:bg-slate-200 disabled:text-slate-500"
            >
              Ask
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Quota: {3 - followUpCount}/3 inquiries remaining</span>
            <Link
              href={`/app/readings/${readingId}/share`}
              className="text-primary hover:underline font-semibold"
            >
              Export Share Card (2 CR) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
