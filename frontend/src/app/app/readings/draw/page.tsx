"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto, DrawnCardDto } from "@/types/api";
import { splitAiParagraphs } from "@/utils/formatAiText";

const MAX_TOTAL_CARDS = 10;

function isSameLocalDay(dateString?: string): boolean {
  if (!dateString) return false;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function TactileDrawContent() {
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [isDrawingClarifier, setIsDrawingClarifier] = useState(false);
  const [clarifierError, setClarifierError] = useState<string | null>(null);
  const [clarifierSuccess, setClarifierSuccess] = useState(false);

  useEffect(() => {
    async function initSession() {
      try {
        if (sessionIdParam) {
          const res = await apiClient.readings.getById(sessionIdParam);
          if (res.code === 200) setSession(res.data);
        } else {
          // Prefer today's reading session first; otherwise create one for today
          const historyRes = await apiClient.readings.getHistory();
          const todaySession =
            historyRes.code === 200 && Array.isArray(historyRes.data)
              ? historyRes.data.find((s) => isSameLocalDay(s.createdAt))
              : null;
          if (todaySession) {
            setSession(todaySession);
          } else {
            const createRes = await apiClient.readings.create({
              spreadId: "S-02",
              deckId: "ED-01",
              question: isVi
                ? "Định hướng phát triển và chuyển hóa năng lượng hôm nay"
                : "What clarity should I welcome today?"
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
  }, [sessionIdParam, isVi]);

  const isTodaySession = useMemo(() => {
    if (!session?.createdAt) return true;
    return isSameLocalDay(session.createdAt);
  }, [session?.createdAt]);

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

  const handleDrawClarifier = async () => {
    if (!session || isDrawingClarifier) return;
    if (!isTodaySession) {
      setClarifierError(
        isVi
          ? "Phiên trải bài của ngày cũ chỉ có thể xem lại luận giải, không thể rút thêm lá bổ sung."
          : "Past-day sessions are read-only; additional clarifiers cannot be drawn."
      );
      return;
    }
    if ((session.drawnCards?.length || 0) >= MAX_TOTAL_CARDS) return;

    setIsDrawingClarifier(true);
    setClarifierError(null);
    setClarifierSuccess(false);

    try {
      const res = await apiClient.readings.drawClarifier(session.id);
      if (res.code >= 400) {
        setClarifierError(
          res.message ||
            (isVi
              ? "Không thể rút thêm lá làm rõ cho phiên trải bài này."
              : "Unable to draw another clarifier card.")
        );
        return;
      }
      if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
        setSession(res.data);
        setClarifierSuccess(true);
        setTimeout(() => setClarifierSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Error drawing clarifier on mobile draw page:", err);
      setClarifierError(
        isVi ? "Có lỗi kết nối khi rút lá làm rõ." : "Connection error while drawing clarifier."
      );
    } finally {
      setIsDrawingClarifier(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex items-center justify-center border-x border-outline-variant">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-slate-500">
            {isVi ? "Khai mở không gian huyền bí..." : "Opening the mystic sanctuary..."}
          </span>
        </div>
      </div>
    );
  }

  const drawnCards = session.drawnCards || [];
  const hasDrawn = drawnCards.length > 0;
  const spreadCount = session.spreadTemplate.cardCount;
  const totalSlots = hasDrawn ? Math.max(spreadCount, drawnCards.length) : spreadCount;
  const spreadName = isVi
    ? session.spreadTemplate.nameVi || session.spreadTemplate.nameEn
    : session.spreadTemplate.nameEn;

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-24">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/readings/new" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{isVi ? "Cấu hình" : "Config"}</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface uppercase truncate max-w-[170px]">
          {spreadName}
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

      {/* Main Draw Surface */}
      <main className="p-4 flex-1 flex flex-col space-y-5">
        {/* Question Banner */}
        <div className="p-3 bg-white border border-outline-variant rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              {isVi ? "CÂU HỎI TRẢI BÀI" : "INQUIRY QUESTION"}
            </span>
            <span className="text-[10px] font-mono text-primary font-semibold">
              {hasDrawn
                ? isVi
                  ? `ĐÃ RÚT ${drawnCards.length}/${MAX_TOTAL_CARDS} LÁ`
                  : `${drawnCards.length}/${MAX_TOTAL_CARDS} DRAWN`
                : isVi
                ? "CHỜ RÚT BÀI"
                : "AWAITING DRAW"}
            </span>
          </div>
          <p className="text-xs text-on-surface font-headline font-semibold italic">
            &ldquo;{session.question}&rdquo;
          </p>
        </div>

        {/* Spread Slots Grid (includes clarifier cards if drawn) */}
        <div
          className={`grid gap-2 ${
            totalSlots === 1
              ? "grid-cols-1 max-w-[180px] mx-auto"
              : totalSlots === 3
              ? "grid-cols-3"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const drawn = drawnCards[idx] as DrawnCardDto | undefined;
            const pos = session.spreadTemplate.parsedPositions?.[idx] || {
              index: idx,
              name_en: drawn?.isClarifier ? "Clarifier Insight" : `Position ${idx + 1}`,
              name_vi: drawn?.isClarifier ? "Lá Làm Rõ" : `Vị trí ${idx + 1}`
            };
            const posName = isVi
              ? drawn?.positionNameVi || pos.name_vi || pos.name_en
              : drawn?.positionNameEn || pos.name_en;

            return (
              <div
                key={drawn?.id || idx}
                className={`p-2 bg-white border rounded-lg text-center shadow-xs flex flex-col items-center justify-between min-h-[140px] transition-all ${
                  drawn?.isClarifier
                    ? "border-amber-400 bg-amber-50/20"
                    : drawn
                    ? "border-primary bg-emerald-50/20"
                    : "border-dashed border-slate-300"
                }`}
              >
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight block truncate w-full">
                  {posName}
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
                      {isVi ? drawn.card.nameVi || drawn.card.nameEn : drawn.card.nameEn}
                    </div>
                    <span
                      className={`text-[8px] font-mono font-semibold px-1 py-0.2 rounded mt-0.5 ${
                        drawn.isReversed ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {drawn.isReversed ? (isVi ? "Ngược" : "Reversed") : isVi ? "Xuôi" : "Upright"}
                    </span>
                  </div>
                ) : (
                  <div className="my-auto py-2 flex flex-col items-center justify-center text-slate-300">
                    <div className="w-10 h-16 rounded border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-slate-400">?</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      {isVi ? "Chờ rút" : "Waiting"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tactile Action Button */}
        {!hasDrawn && (
          <div className="text-center py-6 space-y-4">
            <div
              className="w-24 h-36 mx-auto rounded-lg bg-slate-900 border-2 border-amber-400/80 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={handleDrawCards}
            >
              <div className="w-8 h-8 rounded-full border border-amber-300/40 flex items-center justify-center text-amber-300 text-xs">
                ✦
              </div>
              <span className="text-[10px] font-mono text-amber-200 uppercase mt-2">
                {isVi ? "CHẠM ĐỂ RÚT" : "TAP TO DRAW"}
              </span>
            </div>

            <button
              onClick={handleDrawCards}
              disabled={isDrawing}
              className="w-full py-3 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all"
            >
              {isDrawing
                ? isVi
                  ? "Đang xáo bài và rút năng lượng..."
                  : "Shuffling deck & drawing cards..."
                : isVi
                ? "Rút Toàn Bộ Trải Bài Ngay"
                : "Draw Full Spread Now"}
            </button>
          </div>
        )}

        {/* AI Interpretation & Clarifier Actions */}
        {hasDrawn && (
          <div className="space-y-4 pt-1">
            {/* Clarifier Slot */}
            <div
              className={`p-3.5 border rounded-xl space-y-2.5 ${
                !isTodaySession ? "bg-amber-50/50 border-amber-200" : "bg-white border-dashed border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-700">
                  {isVi
                    ? `LÁ LÀM RÕ TRONG NGÀY (${drawnCards.length}/${MAX_TOTAL_CARDS})`
                    : `DAILY CLARIFIER (${drawnCards.length}/${MAX_TOTAL_CARDS})`}
                </span>
                {!isTodaySession && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    {isVi ? "ĐÃ KHÓA" : "LOCKED"}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                {!isTodaySession
                  ? isVi
                    ? "Phiên này thuộc ngày quá khứ nên chỉ có thể xem lại luận giải."
                    : "Past-day readings are view-only and cannot draw additional cards."
                  : clarifierError
                  ? clarifierError
                  : clarifierSuccess
                  ? isVi
                    ? "✓ Đã rút thêm 1 lá Làm Rõ và tự động lưu vào Nhật Ký Lịch Ngày."
                    : "✓ Clarifier card drawn and saved to Calendar Journal."
                  : drawnCards.length >= MAX_TOTAL_CARDS
                  ? isVi
                    ? "Đã đạt giới hạn tối đa 10 lá bài cho phiên hôm nay."
                    : "Maximum limit of 10 cards reached for today."
                  : isVi
                  ? `Còn có thể rút thêm tối đa ${MAX_TOTAL_CARDS - drawnCards.length} lá bổ sung trong hôm nay.`
                  : `You can draw up to ${MAX_TOTAL_CARDS - drawnCards.length} more clarifier cards today.`}
              </p>

              <button
                type="button"
                onClick={handleDrawClarifier}
                disabled={!isTodaySession || isDrawingClarifier || drawnCards.length >= MAX_TOTAL_CARDS}
                className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold transition-all disabled:cursor-not-allowed ${
                  !isTodaySession
                    ? "bg-slate-200 text-slate-500"
                    : "bg-emerald-50 border border-primary/40 text-primary hover:bg-emerald-100 disabled:opacity-50"
                }`}
              >
                {!isTodaySession
                  ? isVi
                    ? "Phiên Ngày Cũ · Chỉ Xem"
                    : "Past Day · View Only"
                  : drawnCards.length >= MAX_TOTAL_CARDS
                  ? isVi
                    ? "Đã Đủ 10/10 Lá"
                    : "Max 10/10 Cards"
                  : isDrawingClarifier
                  ? isVi
                    ? "Đang rút lá làm rõ..."
                    : "Drawing clarifier..."
                  : isVi
                  ? "+ Rút Thêm 1 Lá Làm Rõ (Clarifier)"
                  : "+ Draw 1 Clarifier Card"}
              </button>
            </div>

            {/* AI Synthesis Report */}
            <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono text-[10px] uppercase text-primary font-bold">
                  {isVi ? "LUẬN GIẢI TỔNG HỢP · GEMINI AI" : "AI SYNTHESIS · GEMINI AI"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isInterpreting
                    ? isVi
                      ? "Đang phân tích..."
                      : "Analyzing..."
                    : isVi
                    ? "ĐÃ LƯU LỊCH NGÀY"
                    : "AUTO-SAVED"}
                </span>
              </div>

              {isInterpreting ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-mono">
                    {isVi
                      ? "Đang giải mã thông điệp và biểu tượng các lá bài..."
                      : "Decoding card archetypes and metaphysical message..."}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-700 leading-relaxed font-body space-y-2.5">
                  {splitAiParagraphs(
                    session.aiInterpretation ||
                      session.aiSynthesisResult ||
                      (isVi
                        ? "Năng lượng các lá bài mở ra góc nhìn rõ ràng cho bước tiếp theo của bạn."
                        : "The cards illuminate a clear perspective for your next step.")
                  ).map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Actions */}
            <div className="space-y-2">
              <Link
                href={`/app/readings/${session.id}`}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-sm">space_dashboard</span>
                <span>
                  {isVi ? "Mở Bàn Trải Bài & Hỏi Đáp AI →" : "Open Reading Workbench & AI Chat →"}
                </span>
              </Link>
              <Link
                href="/app/journal"
                className="w-full py-2.5 bg-white border border-outline-variant hover:border-primary text-on-surface text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                <span>{isVi ? "Xem Lịch Nhật Ký →" : "View Calendar Journal →"}</span>
              </Link>
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
