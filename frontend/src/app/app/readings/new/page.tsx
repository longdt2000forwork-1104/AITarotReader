"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { SpreadTemplate, TarotDeck, Persona } from "@/types/api";

export default function MobileSpreadConfigPage() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [spreads, setSpreads] = useState<SpreadTemplate[]>([]);
  const [decks, setDecks] = useState<TarotDeck[]>([]);
  const [selectedSpreadId, setSelectedSpreadId] = useState<string>("S-02");
  const [selectedDeckId, setSelectedDeckId] = useState<string>("ED-01");
  const [selectedPersona, setSelectedPersona] = useState<Persona>("MYSTIC_SAGE");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [spreadsRes, decksRes] = await Promise.all([
          apiClient.tarot.getSpreads(),
          apiClient.tarot.getDecks()
        ]);
        if (spreadsRes.code === 200) setSpreads(spreadsRes.data);
        if (decksRes.code === 200) setDecks(decksRes.data);
      } catch (err) {
        console.error("Failed to load spread/deck catalog:", err);
      }
    }
    loadCatalog();
  }, []);

  const handleCreateSession = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.readings.create({
        spreadId: selectedSpreadId,
        deckId: selectedDeckId,
        persona: selectedPersona,
        question: question.trim() || undefined,
        inputMode: "CARD_DRAW"
      });
      if (res.code === 201) {
        router.push(`/app/readings/draw?sessionId=${res.data.id}`);
      }
    } catch (err) {
      console.error("Error creating reading session:", err);
      setIsSubmitting(false);
    }
  };

  const personaOptions = [
    {
      id: "MYSTIC_SAGE" as Persona,
      title: isVi ? "Nhà Hiền Triết" : "Mystic Sage",
      desc: isVi ? "Tri thức cổ điển & thấu thị" : "Classical wisdom & insight",
    },
    {
      id: "PRACTICAL_COACH" as Persona,
      title: isVi ? "Cố Vấn Thực Tiễn" : "Action Coach",
      desc: isVi ? "Định hướng hành động cụ thể" : "Pragmatic actions & steps",
    },
    {
      id: "SHADOW_EXPLORER" as Persona,
      title: isVi ? "Khai Phá Tiềm Thức" : "Shadow Work",
      desc: isVi ? "Soi rọi góc khuất & nội tâm" : "Subconscious & hidden layers",
    },
  ];

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 text-xs text-slate-600 hover:text-on-surface font-medium transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>{isVi ? "Quay lại" : "Back"}</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface">
          {isVi ? "THIẾT LẬP TRẢI BÀI" : "NEW READING CONFIG"}
        </span>

        {/* Language Switcher */}
        <div className="flex items-center border border-outline-variant rounded text-[10px] font-mono overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-2 py-0.5 transition-colors ${
              !isVi ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-on-surface"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("vi")}
            className={`px-2 py-0.5 transition-colors ${
              isVi ? "bg-primary text-white font-bold" : "text-slate-500 hover:text-on-surface"
            }`}
          >
            VI
          </button>
        </div>
      </header>

      {/* 4-Step Form */}
      <main className="p-4 space-y-6">
        {/* Step 1: Spread Architecture */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {isVi ? "01. SƠ ĐỒ TRẢI BÀI" : "01. SPREAD ARCHITECTURE"}
            </span>
            <span className="text-[10px] font-mono text-primary font-semibold">
              {isVi ? "CHỌN 1 SƠ ĐỒ" : "SELECT 1 SPREAD"}
            </span>
          </div>
          <div className="space-y-2">
            {spreads.map((spread) => {
              const active = spread.id === selectedSpreadId;
              const name = isVi ? spread.nameVi || spread.nameEn : spread.nameEn;
              const desc = isVi ? spread.descriptionVi || spread.descriptionEn : spread.descriptionEn;
              return (
                <div
                  key={spread.id}
                  onClick={() => setSelectedSpreadId(spread.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? "bg-white border-2 border-primary shadow-sm"
                      : "bg-white border-outline-variant hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-sm text-on-surface">
                        {name}
                      </span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-[11px] text-[#475569] mt-0.5">
                      {spread.cardCount} {isVi ? "Lá Bài" : "Cards"} • {desc}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {spread.crystalCost === 0 ? (isVi ? "MIỄN PHÍ" : "FREE") : `${spread.crystalCost} CR`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Deck Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {isVi ? "02. PHIÊN BẢN BỘ BÀI TAROT" : "02. TAROT DECK EDITION"}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {decks.length} {isVi ? "BỘ BÀI KHẢ DỤNG" : "DECKS ACTIVE"}
            </span>
          </div>
          <div className="space-y-2">
            {decks.map((deck) => {
              const active = deck.id === selectedDeckId;
              const name = isVi ? deck.nameVi || deck.nameEn : deck.nameEn;
              return (
                <div
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`p-3 bg-white border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                    active ? "border-2 border-primary shadow-xs" : "border-outline-variant hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-12 bg-[#FAF9F6] border border-amber-200 rounded overflow-hidden flex items-center justify-center">
                      <img src={deck.coverImageUrl} alt={deck.nameEn} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-headline font-bold text-xs text-on-surface">{name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{deck.artist} • {deck.unlockTier}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {deck.creditCost === 0 ? (isVi ? "Mặc định" : "Default") : `${deck.creditCost} CR`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Reader Persona */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {isVi ? "03. HÌNH TƯỢNG GIỌNG ĐỌC AI" : "03. AI READER PERSONA"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {personaOptions.map((p) => {
              const active = p.id === selectedPersona;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                    active ? "bg-white border-2 border-primary shadow-xs" : "bg-white border-outline-variant"
                  }`}
                >
                  <div className="text-xs font-bold font-headline text-on-surface">{p.title}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Inquiry Prompt */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            {isVi ? "04. CÂU HỎI & VẤN ĐỀ (TÙY CHỌN)" : "04. INQUIRY & QUESTION (OPTIONAL)"}
          </span>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              isVi
                ? "Nhập câu hỏi hoặc chủ đề bạn muốn thấu suốt (ví dụ: Định hướng sự nghiệp hoặc phát triển bản thân)..."
                : "Enter the question or theme you wish to gain clarity on (e.g. Career direction or creative focus)..."
            }
            className="w-full p-3 text-xs border border-outline-variant rounded-lg bg-white focus:outline-none focus:border-primary leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleCreateSession}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-primary text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover shadow-sm transition-all"
        >
          {isSubmitting ? (
            <span>{isVi ? "Đang khởi tạo phiên đọc..." : "Initializing session..."}</span>
          ) : (
            <>
              <span>{isVi ? "Tiến Hành Rút Bài (Tactile Draw)" : "Proceed to Card Draw (Tactile Draw)"}</span>
              <span>→</span>
            </>
          )}
        </button>
      </main>

      <MobileBottomNav activeTab="oracle" />
    </div>
  );
}
