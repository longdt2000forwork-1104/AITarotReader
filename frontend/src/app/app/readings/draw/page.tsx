"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto, DrawnCardDto } from "@/types/api";

function TactileDrawContent() {
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [userNote, setUserNote] = useState("");

  useEffect(() => {
    async function initSession() {
      try {
        if (sessionIdParam) {
          const res = await apiClient.readings.getById(sessionIdParam);
          if (res.code === 200) setSession(res.data);
        } else {
          // If no sessionId in query, get latest or create 3-card demo
          const historyRes = await apiClient.readings.getHistory();
          if (historyRes.code === 200 && historyRes.data.length > 0) {
            setSession(historyRes.data[0]);
          } else {
            const createRes = await apiClient.readings.create({
              spreadId: "S-02",
              deckId: "ED-01",
              question: "What clarity should I welcome today?"
            });
            if (createRes.code === 201) setSession(createRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to load reading session:", err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [sessionIdParam]);

  const handleDrawCards = async () => {
    if (!session || isDrawing) return;
    setIsDrawing(true);
    try {
      const drawRes = await apiClient.readings.drawCards(session.id);
      if (drawRes.code === 200) {
        setSession(drawRes.data);

        // Automatically trigger AI interpretation
        setIsInterpreting(true);
        const interpRes = await apiClient.readings.interpret(session.id);
        if (interpRes.code === 200) {
          setSession(interpRes.data);
        }
      }
    } catch (err) {
      console.error("Error drawing cards:", err);
    } finally {
      setIsDrawing(false);
      setIsInterpreting(false);
    }
  };

  const handleSaveJournal = async () => {
    if (!session || journalSaved) return;
    try {
      await apiClient.readings.saveJournal(session.id, userNote || "Empirical reflection on reading");
      setJournalSaved(true);
    } catch (err) {
      console.error("Error saving to journal:", err);
    }
  };

  if (loading || !session) {
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex items-center justify-center border-x border-outline-variant">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-slate-500">Khai mở không gian huyền bí...</span>
        </div>
      </div>
    );
  }

  const hasDrawn = session.drawnCards && session.drawnCards.length > 0;
  const spreadCount = session.spreadTemplate.cardCount;

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/readings/new" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Config</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface uppercase truncate max-w-[200px]">
          {session.spreadTemplate.nameVi || session.spreadTemplate.nameEn}
        </span>
        <span className="text-xs font-mono text-primary font-semibold">
          {hasDrawn ? "COMPLETED" : "AWAITING DRAW"}
        </span>
      </header>

      {/* Main Draw Surface */}
      <main className="p-4 flex-1 flex flex-col space-y-5">
        {/* Question Banner */}
        <div className="p-3 bg-white border border-outline-variant rounded-lg space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">INQUIRY QUESTION</span>
          <p className="text-xs text-on-surface font-headline font-semibold italic">
            "{session.question}"
          </p>
        </div>

        {/* Spread Slots Grid */}
        <div className={`grid gap-2 ${spreadCount === 1 ? "grid-cols-1 max-w-[180px] mx-auto" : spreadCount === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-3"}`}>
          {Array.from({ length: spreadCount }).map((_, idx) => {
            const drawn = session.drawnCards[idx] as DrawnCardDto | undefined;
            const pos = session.spreadTemplate.parsedPositions?.[idx] || {
              index: idx,
              name_en: `Position ${idx + 1}`,
              name_vi: `Vị trí ${idx + 1}`
            };

            return (
              <div
                key={idx}
                className={`p-2 bg-white border rounded-lg text-center shadow-xs flex flex-col items-center justify-between min-h-[140px] transition-all ${
                  drawn ? "border-primary bg-emerald-50/20" : "border-dashed border-slate-300"
                }`}
              >
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight block truncate w-full">
                  {pos.name_vi}
                </span>

                {drawn ? (
                  <div className="my-1.5 flex flex-col items-center">
                    <div className="w-12 h-20 rounded overflow-hidden border border-slate-200 shadow-xs relative">
                      <img
                        src={drawn.card.imageUrl}
                        alt={drawn.card.nameEn}
                        className={`w-full h-full object-cover transition-transform ${drawn.isReversed ? "rotate-180" : ""}`}
                      />
                    </div>
                    <div className="text-[10px] font-headline font-bold text-on-surface mt-1 truncate max-w-[100px]">
                      {drawn.card.nameVi}
                    </div>
                    <span className={`text-[8px] font-mono font-semibold px-1 py-0.2 rounded mt-0.5 ${
                      drawn.isReversed ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {drawn.isReversed ? "Ngược" : "Xuôi"}
                    </span>
                  </div>
                ) : (
                  <div className="my-auto py-2 flex flex-col items-center justify-center text-slate-300">
                    <div className="w-10 h-16 rounded border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-slate-400">?</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">Chờ rút</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tactile Action Button */}
        {!hasDrawn && (
          <div className="text-center py-6 space-y-4">
            <div className="w-24 h-36 mx-auto rounded-lg bg-slate-900 border-2 border-amber-400/80 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={handleDrawCards}
            >
              <div className="w-8 h-8 rounded-full border border-amber-300/40 flex items-center justify-center text-amber-300 text-xs">
                ✦
              </div>
              <span className="text-[10px] font-mono text-amber-200 uppercase mt-2">TAP TO DRAW</span>
            </div>

            <button
              onClick={handleDrawCards}
              disabled={isDrawing}
              className="w-full py-3 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all"
            >
              {isDrawing ? "Đang xáo bài và rút năng lượng..." : "Rút Toàn Bộ Trải Bài Ngay ✨"}
            </button>
          </div>
        )}

        {/* AI Interpretation Box */}
        {hasDrawn && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono text-[10px] uppercase text-primary font-bold">
                  AI SYNTHESIS // {session.persona}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isInterpreting ? "Đang phân tích..." : "GIẢI NGHĨA HOÀN TẤT"}
                </span>
              </div>

              {isInterpreting ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-mono">Đang giải mã thông điệp và biểu tượng các lá bài...</p>
                </div>
              ) : (
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-body">
                  {session.aiInterpretation}
                </div>
              )}
            </div>

            {/* Reflection & Journal Note */}
            <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-3">
              <span className="font-mono text-[10px] uppercase text-slate-400 font-bold block">
                NHẬT KÝ & SUY NGẪM CÁ NHÂN (JOURNAL REFLECTION)
              </span>
              <textarea
                rows={3}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Ghi lại cảm nhận hoặc bài học nghiệm ra từ trải bài này..."
                className="w-full p-3 text-xs border border-outline-variant rounded-lg bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
              />

              <div className="flex justify-between items-center pt-1">
                <Link href="/journal" className="text-xs font-mono text-primary hover:underline">
                  Xem Toàn Bộ Sổ Nhật Ký →
                </Link>
                <button
                  onClick={handleSaveJournal}
                  disabled={journalSaved}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    journalSaved
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {journalSaved ? "✓ Đã Lưu Vào Sổ" : "Lưu Nhật Ký"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav activeTab="oracle" />
    </div>
  );
}

export default function MobileTactileDrawPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TactileDrawContent />
    </Suspense>
  );
}
