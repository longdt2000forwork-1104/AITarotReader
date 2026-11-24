"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto, DrawnCardDto } from "@/types/api";
import { TAROT_CARDS } from "@/data/tarotCards";
import MobileBottomNav from "@/components/MobileBottomNav";
import RequireAuthGate from "@/components/auth/RequireAuthGate";
import { splitAiParagraphs } from "@/utils/formatAiText";
import { isSessionActiveToday, toLocalDateKey } from "@/utils/sessionDate";
import { useCurrentDayKey } from "@/hooks/useCurrentDayKey";
import { detectSessionTopic, getTopicActionSteps, getTopicConfig } from "@/data/readingTopics";

const MAX_TOTAL_CARDS = 10;

function MobileReadingReportContent() {
  const params = useParams();
  const router = useRouter();
  const readingId = (params?.id as string) || "";
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";
  const currentDayKey = useCurrentDayKey();

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCardDetail, setSelectedCardDetail] = useState<DrawnCardDto | null>(null);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarifierError, setClarifierError] = useState<string | null>(null);
  const [clarifierSuccess, setClarifierSuccess] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([]);

  const syncMessagesFromSession = (s: ReadingSessionDto) => {
    if (s.messages && s.messages.length > 0) {
      setChatMessages(
        s.messages.map((m) => ({
          sender: m.sender === "AI_READER" ? "ai" : "user",
          text: m.content
        }))
      );
    } else {
      setChatMessages([]);
    }
  };

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        setClarifierError(null);
        setChatError(null);
        if (readingId && readingId !== "demo-session") {
          const res = await apiClient.readings.getById(readingId);
          if (res.code === 200 && res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
            setSession(res.data);
            syncMessagesFromSession(res.data);
            return;
          }
        }

        // If invalid ID or legacy demo route, check today's flipped daily draw
        const dailyRes = await apiClient.readings.checkDailyDraw(locale);
        if (
          dailyRes.data &&
          dailyRes.data.id &&
          dailyRes.data.drawnCards &&
          dailyRes.data.drawnCards.length > 0
        ) {
          setSession(dailyRes.data);
          syncMessagesFromSession(dailyRes.data);
          router.replace(`/app/readings/${dailyRes.data.id}`);
          return;
        }

        // No active daily reading found -> return to Mobile Home to flip today's card
        router.replace("/app/home");
      } catch (err) {
        console.error("Failed to load reading report session:", err);
        router.replace("/app/home");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [readingId, locale, router]);

  const isTodaySession = useMemo(() => {
    if (!session) return true;
    return isSessionActiveToday(session, currentDayKey);
  }, [session, currentDayKey]);

  const sessionDateLabel = useMemo(() => {
    if (!session?.createdAt) return "";
    const d = new Date(session.createdAt);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }, [session?.createdAt, isVi]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isSendingChat || !session) return;

    if (!isSessionActiveToday(session, toLocalDateKey(new Date()))) {
      setChatError(
        isVi
          ? "Phiên trải bài của ngày cũ chỉ có thể xem lại luận giải, không thể tiếp tục hỏi đáp với AI."
          : "Past-day reading sessions are read-only; AI Q&A is only available for today's session."
      );
      return;
    }

    const userText = questionInput.trim();
    setQuestionInput("");
    setChatError(null);
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsSendingChat(true);

    try {
      const res = await apiClient.readings.sendChat(session.id, userText);
      if (res.code >= 400 || !res.data?.content) {
        setChatMessages((prev) => prev.slice(0, -1));
        if (isSessionActiveToday(session, toLocalDateKey(new Date()))) {
          setQuestionInput(userText);
        }
        setChatError(
          res.message ||
            (isVi
              ? "Không thể gửi câu hỏi tới Gemini AI cho phiên này."
              : "Unable to send your question to Gemini AI for this session.")
        );
        return;
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: res.data.content }]);
    } catch (err) {
      console.error("Failed to send chat message:", err);
      setChatMessages((prev) => prev.slice(0, -1));
      if (isSessionActiveToday(session, toLocalDateKey(new Date()))) {
        setQuestionInput(userText);
      }
      setChatError(
        isVi
          ? "Có lỗi kết nối khi gửi câu hỏi tới Gemini AI. Vui lòng thử lại."
          : "Connection error while contacting Gemini AI. Please try again."
      );
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleDrawClarifier = async () => {
    if (!session || isClarifying) return;
    if (!isTodaySession) {
      setClarifierError(
        isVi
          ? "Phiên trải bài của ngày cũ chỉ có thể xem lại luận giải, không thể rút thêm lá bài bổ sung."
          : "Past-day sessions are read-only; you cannot draw additional clarifier cards."
      );
      return;
    }
    if ((session.drawnCards?.length || 0) >= MAX_TOTAL_CARDS) return;

    setIsClarifying(true);
    setClarifierError(null);
    setClarifierSuccess(false);

    try {
      // 1. Call Backend Clarifier endpoint to draw from Supabase, save to drawn_cards, and generate AI interpretation
      const res = await apiClient.readings.drawClarifier(session.id);
      if (res.code >= 400) {
        setClarifierError(
          res.message ||
            (isVi
              ? "Không thể rút thêm lá làm rõ cho phiên trải bài này."
              : "Unable to draw another clarifier card for this session.")
        );
        return;
      }

      if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
        setSession(res.data);
        setClarifierSuccess(true);
        setTimeout(() => setClarifierSuccess(false), 4000);
        if (res.data.messages && res.data.messages.length > 0) {
          syncMessagesFromSession(res.data);
        }
        return;
      }

      // 2. Offline-only fallback for today's session when backend returned empty payload
      const usedIds = new Set((session.drawnCards || []).map((dc) => Number((dc.card as any)?.id)));
      const availableCards = TAROT_CARDS.filter((c) => !usedIds.has(c.id));
      const clarifierCard = availableCards[Math.floor(Math.random() * availableCards.length)] || TAROT_CARDS[0];
      const isReversed = Math.random() > 0.65;

      const newDrawnCard: DrawnCardDto = {
        id: `DC-CLARIFIER-${Date.now()}`,
        positionIndex: session.drawnCards?.length || 1,
        positionNameVi: "Lá Làm Rõ (Clarifier)",
        positionNameEn: "Clarifier Insight",
        isReversed,
        isClarifier: true,
        card: {
          id: clarifierCard.id,
          slug: clarifierCard.slug,
          cardOrder: clarifierCard.id,
          number: clarifierCard.number,
          nameVi: clarifierCard.nameVi,
          nameEn: clarifierCard.nameEn,
          arcana: clarifierCard.suit === "MAJOR" ? "MAJOR" : "MINOR",
          suit: clarifierCard.suit === "MAJOR" ? null : clarifierCard.suit,
          element: clarifierCard.element,
          imageUrl: clarifierCard.image,
          meaningUprightVi: clarifierCard.meaningUprightVi,
          meaningUprightEn: clarifierCard.meaningUprightEn,
          meaningReversedVi: clarifierCard.meaningUprightVi,
          meaningReversedEn: clarifierCard.meaningUprightEn,
          keywordsUprightVi: clarifierCard.keywordsVi,
          keywordsUprightEn: clarifierCard.keywordsEn,
          keywordsReversedVi: clarifierCard.keywordsVi,
          keywordsReversedEn: clarifierCard.keywordsEn,
          archetypeEn: clarifierCard.nameEn,
          archetypeVi: clarifierCard.nameVi
        }
      };

      setSession((prev) =>
        prev
          ? {
              ...prev,
              drawnCards: [...(prev.drawnCards || []), newDrawnCard]
            }
          : prev
      );
      setClarifierSuccess(true);
      setTimeout(() => setClarifierSuccess(false), 4000);

      const cardName = isVi ? clarifierCard.nameVi : clarifierCard.nameEn;
      const orientText = isReversed ? (isVi ? "Ngược" : "Reversed") : (isVi ? "Xuôi" : "Upright");
      const promptText = isVi
        ? `Tôi vừa rút thêm lá bài làm rõ (Clarifier): ${cardName} (${orientText}). Hãy giải nghĩa sâu lá bài này.`
        : `I just drew a Clarifier card: ${cardName} (${orientText}). Please interpret this card for the reading.`;

      setChatMessages((prev) => [...prev, { sender: "user", text: promptText }]);
      const chatRes = await apiClient.readings.sendChat(session.id, promptText);
      if (chatRes.data) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: chatRes.data.content }]);
      }
    } catch (err) {
      console.error("Error drawing clarifier:", err);
      setClarifierError(
        isVi ? "Có lỗi xảy ra khi rút lá bài làm rõ." : "Error while drawing clarifier card."
      );
    } finally {
      setIsClarifying(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">
            {isVi ? "Đang đồng bộ dữ liệu trải bài từ Supabase..." : "Loading session from Supabase..."}
          </p>
        </div>
      </div>
    );
  }

  const drawnCards = session.drawnCards || [];
  const spreadName = isVi
    ? session.spreadNameVi || session.spreadTemplate?.nameVi || "Trải Bài 3 Lá"
    : session.spreadNameEn || session.spreadTemplate?.nameEn || "3-Card Spread";
  const sessionTopic = detectSessionTopic(session.question || session.userQuestion);
  const topicMeta = sessionTopic ? getTopicConfig(sessionTopic) : null;
  const synthesisTitle = topicMeta
    ? isVi
      ? `Luận Giải · Chủ Đề ${topicMeta.labelVi}`
      : `Deep Reading · ${topicMeta.labelEn}`
    : isVi
    ? "Thông Điệp Cốt Lõi Từ Vũ Trụ"
    : "Core Oracle Synthesis";
  const actionSteps = getTopicActionSteps(sessionTopic, isVi);

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[420px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-24 border-x border-[#E2E8F0] shadow-sm">
        {/* 1. Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
          <Link
            href="/app/home"
            className="flex items-center gap-1 text-[#0F172A] hover:text-primary transition-colors text-xs font-mono font-medium"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>{isVi ? "Quay lại" : "Back"}</span>
          </Link>
          <div className="flex flex-col items-center text-center px-1">
            <h1 className="font-headline font-bold text-sm tracking-tight text-slate-900 leading-tight">
              {isVi ? "Bàn Trải & Luận Giải" : "Reading Workbench"}
            </h1>
            <span className="text-[10px] text-slate-500 truncate max-w-[170px] font-mono">
              {spreadName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <div className="flex items-center border border-[#E2E8F0] rounded text-[10px] font-mono overflow-hidden shadow-xs">
              <button
                onClick={() => setLocale("en")}
                className={`px-1.5 py-0.5 font-bold ${
                  !isVi ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("vi")}
                className={`px-1.5 py-0.5 font-bold ${
                  isVi ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                VI
              </button>
            </div>
          </div>
        </header>

        {/* Sub-Toolbar: Date Status + Quick Actions (+ New Reading & Calendar Journal) */}
        <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-2">
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded border truncate ${
              isTodaySession
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                : "bg-amber-50 text-amber-800 border-amber-200 font-semibold"
            }`}
          >
            {sessionDateLabel ? `${sessionDateLabel} · ` : ""}
            {isTodaySession
              ? isVi
                ? "Hôm Nay"
                : "Today"
              : isVi
              ? "Ngày Cũ · Chỉ Xem"
              : "Past Day · Read-Only"}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/app/journal"
              className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[12px]">calendar_month</span>
              <span>{isVi ? "Lịch Nhật Ký" : "Journal"}</span>
            </Link>
          </div>
        </div>

        {/* 3. Main Reading Content Scroll */}
        <main className="p-4 space-y-5">
          {/* Question Banner */}
          {session.question && (
            <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                {isVi ? "CÂU HỎI CHIÊM NGHIỆM" : "CONTEMPLATIVE INQUIRY"}
              </span>
              <p className="font-headline font-bold text-sm text-slate-900">
                “{session.question}”
              </p>
            </div>
          )}

          {/* Section 01: Position-by-Position Analysis (Tap card for details) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                {isVi ? "01. CÁC LÁ BÀI TRONG PHIÊN" : "01. DRAWN CARDS MATRIX"}
              </h3>
              <span className="shrink-0 whitespace-nowrap text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {drawnCards.length}/{MAX_TOTAL_CARDS} {isVi ? "LÁ" : "CARDS"}
              </span>
            </div>

            {drawnCards.map((dc, idx) => {
              const card = dc.card;
              const staticMatch = TAROT_CARDS.find((c) => c.id === Number(card?.id));
              const cardName = isVi ? card?.nameVi || staticMatch?.nameVi : card?.nameEn || staticMatch?.nameEn;
              const posName = isVi ? dc.positionNameVi : dc.positionNameEn;
              const imgUrl =
                card?.imageUrl || (card as any)?.image || staticMatch?.image || "/decks/rider-waite-1909/cards/00_the_fool.webp";
              const meaning = dc.isReversed
                ? isVi
                  ? card?.meaningReversedVi || (card as any)?.summaryVi || staticMatch?.meaningUprightVi
                  : card?.meaningReversedEn || (card as any)?.summaryEn || staticMatch?.meaningUprightEn
                : isVi
                ? card?.meaningUprightVi || (card as any)?.summaryVi || staticMatch?.meaningUprightVi
                : card?.meaningUprightEn || (card as any)?.summaryEn || staticMatch?.meaningUprightEn;
              const keywords = dc.isReversed
                ? isVi
                  ? card?.keywordsReversedVi || staticMatch?.keywordsVi
                  : card?.keywordsReversedEn || staticMatch?.keywordsEn
                : isVi
                ? card?.keywordsUprightVi || staticMatch?.keywordsVi
                : card?.keywordsUprightEn || staticMatch?.keywordsEn;
              const stepNum = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={dc.id || idx}
                  onClick={() => setSelectedCardDetail(dc)}
                  className={`bg-white border rounded-xl p-4 space-y-3 shadow-xs cursor-pointer hover:border-primary transition-all ${
                    dc.isClarifier ? "border-amber-400 bg-amber-50/20" : "border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                        dc.isClarifier ? "text-amber-700" : "text-primary"
                      }`}
                    >
                      {dc.isClarifier
                        ? `✦ ${isVi ? `VỊ TRÍ ${stepNum} · LÁ BÀI LÀM RÕ (CLARIFIER)` : `POSITION ${stepNum} · CLARIFIER CARD`}`
                        : `VỊ TRÍ ${stepNum} · ${posName}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {dc.isReversed ? (isVi ? "NGƯỢC ↓" : "REVERSED ↓") : isVi ? "XUÔI ↑" : "UPRIGHT ↑"}
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <img
                      src={imgUrl}
                      alt={cardName}
                      className={`w-14 h-22 object-cover rounded border border-slate-200 shrink-0 shadow-2xs ${
                        dc.isReversed ? "rotate-180" : ""
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-headline font-bold text-base text-slate-900">
                        {cardName}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {meaning}
                      </p>
                      {keywords && (
                        <div className="text-[10px] font-mono text-primary pt-1">
                          ✦ {keywords}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clarifier Draw Slot with Today-only & 10-card Limit */}
            <div
              className={`p-3.5 border rounded-xl space-y-2 shadow-2xs ${
                !isTodaySession ? "bg-amber-50/50 border-amber-200" : "bg-white border-dashed border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-700 uppercase">
                  {isVi
                    ? `Lá Làm Rõ Trong Ngày (${drawnCards.length}/${MAX_TOTAL_CARDS})`
                    : `Daily Clarifier (${drawnCards.length}/${MAX_TOTAL_CARDS})`}
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
                    ? `Phiên này thuộc ngày ${sessionDateLabel || "trước đây"}. Khi đã sang ngày mới, bạn chỉ có thể xem lại luận giải và không thể rút thêm lá bổ sung hoặc hỏi đáp với AI.`
                    : `This session belongs to ${sessionDateLabel || "a past day"}. Past-day readings are view-only and cannot draw more cards or continue AI Q&A.`
                  : clarifierError
                  ? clarifierError
                  : clarifierSuccess
                  ? isVi
                    ? "✓ Đã rút thành công thêm 1 lá Làm Rõ và tự động lưu vào Lịch Nhật Ký!"
                    : "✓ Clarifier card drawn and saved to your Calendar Journal!"
                  : drawnCards.length >= MAX_TOTAL_CARDS
                  ? isVi
                    ? "Đã đạt giới hạn tối đa 10 lá bài trong phiên hôm nay."
                    : "Maximum limit of 10 cards for today's session reached."
                  : isVi
                  ? `Hôm nay bạn còn có thể rút thêm tối đa ${MAX_TOTAL_CARDS - drawnCards.length} lá bổ sung cho phiên này.`
                  : `You can draw up to ${MAX_TOTAL_CARDS - drawnCards.length} more clarifier cards today.`}
              </p>

              <button
                type="button"
                disabled={!isTodaySession || isClarifying || drawnCards.length >= MAX_TOTAL_CARDS}
                onClick={handleDrawClarifier}
                className={`w-full rounded-lg px-4 py-2.5 flex items-center justify-center text-xs font-mono font-bold transition-all disabled:cursor-not-allowed ${
                  !isTodaySession
                    ? "bg-slate-200 text-slate-500"
                    : "bg-primary hover:bg-primary-hover text-white disabled:opacity-50"
                }`}
              >
                <span>
                  {!isTodaySession
                    ? isVi
                      ? "Phiên Ngày Cũ · Chỉ Xem Luận Giải"
                      : "Past Day · View Only"
                    : drawnCards.length >= MAX_TOTAL_CARDS
                    ? isVi
                      ? "Đã Đủ 10/10 Lá"
                      : "Max 10/10 Cards"
                    : isClarifying
                    ? isVi
                      ? "Đang rút lá bài làm rõ..."
                      : "Drawing clarifier card..."
                    : isVi
                    ? "Rút Lá Bài Làm Rõ"
                    : "Draw Clarifier Card"}
                </span>
              </button>
            </div>
          </section>

          {/* Section 02: Core Synthesis Thesis */}
          <section className="bg-white border-2 border-primary/80 rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              {isVi ? "02. LUẬN GIẢI CHI TIẾT · TAROT READER KINH NGHIỆM" : "02. EXPERIENCED READER SYNTHESIS"}
            </span>
            <h3 className="font-headline font-bold text-lg text-slate-900">
              {synthesisTitle}
            </h3>
            <div className="text-[13px] text-slate-700 leading-relaxed space-y-3">
              {splitAiParagraphs(
                session.aiInterpretation ||
                  session.aiSynthesisResult ||
                  (isVi
                    ? "Năng lượng các lá bài hội tụ chỉ ra rằng bạn đang đứng trước bước ngoặt quyết định. Hãy giữ tâm thế tự chủ và biến các chiêm nghiệm thành hành động cụ thể."
                    : "The converging card energies indicate a defining milestone. Maintain sovereign focus and ground insights into deliberate action.")
              ).map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Section 03: Tactical Action Advice */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              {isVi ? "03. KHUYẾN NGHỊ HÀNH ĐỘNG THỰC TẾ" : "03. Actionable Steps"}
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {actionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-primary font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <Link href="/app/journal" className="text-primary hover:underline font-semibold">
                {isVi ? "← Xem Lịch Nhật Ký" : "← Calendar Journal"}
              </Link>
              <span>
                {isVi ? "Đồng bộ Supabase & Gemini AI" : "Synced with Supabase"}
              </span>
            </div>
          </section>
        </main>

        {/* 4. Card Detail Modal Popup (same feature as Web Workbench) */}
        {selectedCardDetail && (
          <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-[390px] w-full p-5 shadow-xl border border-[#E2E8F0] relative">
              <button
                type="button"
                onClick={() => setSelectedCardDetail(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ×
              </button>
              <div className="flex gap-3.5 items-start">
                <img
                  src={
                    (selectedCardDetail.card as any)?.imageUrl ||
                    (selectedCardDetail.card as any)?.image ||
                    "/decks/rider-waite-1909/cards/00_the_fool.webp"
                  }
                  alt={(selectedCardDetail.card as any)?.nameEn || ""}
                  className={`w-20 h-34 object-cover rounded border border-slate-200 shadow-sm shrink-0 ${
                    selectedCardDetail.isReversed ? "rotate-180" : ""
                  }`}
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-primary uppercase font-bold">
                    {isVi ? selectedCardDetail.positionNameVi : selectedCardDetail.positionNameEn}
                  </div>
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    {(selectedCardDetail.card as any)?.number} —{" "}
                    {isVi
                      ? (selectedCardDetail.card as any)?.nameVi
                      : (selectedCardDetail.card as any)?.nameEn}
                  </h3>
                  <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                    {selectedCardDetail.isReversed
                      ? isVi
                        ? "Vị trí: Ngược"
                        : "Orientation: Reversed"
                      : isVi
                      ? "Vị trí: Xuôi"
                      : "Orientation: Upright"}
                  </div>
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                    {selectedCardDetail.isReversed
                      ? isVi
                        ? (selectedCardDetail.card as any)?.meaningReversedVi ||
                          (selectedCardDetail.card as any)?.summaryVi ||
                          (selectedCardDetail.card as any)?.meaningUprightVi
                        : (selectedCardDetail.card as any)?.meaningReversedEn ||
                          (selectedCardDetail.card as any)?.summaryEn ||
                          (selectedCardDetail.card as any)?.meaningUprightEn
                      : isVi
                      ? (selectedCardDetail.card as any)?.meaningUprightVi ||
                        (selectedCardDetail.card as any)?.summaryVi
                      : (selectedCardDetail.card as any)?.meaningUprightEn ||
                        (selectedCardDetail.card as any)?.summaryEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Floating AI Chat Bubble & Popup Window */}
        {!isChatOpen ? (
          <div className="fixed bottom-20 left-0 right-0 max-w-[420px] mx-auto px-4 pointer-events-none z-40 flex justify-end">
            {isTodaySession ? (
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="pointer-events-auto relative flex items-center gap-2 bg-primary hover:bg-[#047857] text-white px-4 py-3 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
                title={isVi ? "Mở khung chat Hỏi đáp với AI" : "Open AI Oracle Chat"}
              >
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  {isVi ? "Hỏi Đáp AI" : "AI Chat"}
                </span>
                {chatMessages.length > 0 && (
                  <span className="ml-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-slate-900 font-mono text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                    {chatMessages.length}
                  </span>
                )}
              </button>
            ) : chatMessages.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="pointer-events-auto relative flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-3 rounded-full shadow-lg transition-all"
                title={
                  isVi
                    ? "Xem lại lịch sử hỏi đáp AI (phiên ngày cũ chỉ đọc)"
                    : "Review archived AI Q&A history (past-day read-only)"
                }
              >
                <span className="material-symbols-outlined text-xl">history</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  {isVi ? "Lịch Sử Hỏi Đáp" : "Chat Archive"}
                </span>
                <span className="ml-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-200 text-amber-900 font-mono text-[10px] font-extrabold flex items-center justify-center">
                  {chatMessages.length}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="pointer-events-auto relative flex items-center gap-2 bg-slate-200 text-slate-500 border border-slate-300 px-4 py-3 rounded-full shadow-md cursor-not-allowed"
                title={
                  isVi
                    ? "Hỏi đáp với AI chỉ hoạt động cho phiên của ngày hôm nay"
                    : "AI Q&A is only available for today's session"
                }
              >
                <span className="material-symbols-outlined text-lg">lock</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  {isVi ? "Hỏi Đáp AI · Đã Khóa" : "AI Chat · Locked"}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-3 sm:p-4">
            <div className="w-full max-w-[410px] h-[82dvh] max-h-[640px] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
              {/* Popup Header */}
              <div className="px-4 py-3 bg-[#FAF9F6] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      !isTodaySession ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {!isTodaySession ? "lock" : "auto_awesome"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-headline font-bold text-sm text-slate-900 leading-tight truncate">
                        {isVi ? "Hỏi Đáp Đào Sâu · Gemini AI" : "Oracle Dialectic · Gemini AI"}
                      </h4>
                      {!isTodaySession && (
                        <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          {isVi ? "ĐÃ KHÓA" : "LOCKED"}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      {!isTodaySession
                        ? isVi
                          ? `${drawnCards.length} lá bài · Ngày cũ (Chỉ xem)`
                          : `${drawnCards.length} cards · Past day (Read-only)`
                        : isVi
                        ? `${drawnCards.length} lá bài trong phiên · Trực tuyến`
                        : `${drawnCards.length} cards in session · Live`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0"
                  title={isVi ? "Thu nhỏ" : "Minimize"}
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Popup Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]/60">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-3 text-slate-500">
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        !isTodaySession ? "text-amber-600/70" : "text-primary/60"
                      }`}
                    >
                      {!isTodaySession ? "lock" : "forum"}
                    </span>
                    <p className="text-xs leading-relaxed">
                      {!isTodaySession
                        ? isVi
                          ? "Không có lịch sử hỏi đáp AI trong phiên ngày cũ này. Tính năng hỏi đáp chỉ hoạt động cho phiên hôm nay."
                          : "No AI Q&A history was recorded for this past-day session. AI Q&A is only available for today's session."
                        : isVi
                        ? "Bạn có thể đặt bất kỳ câu hỏi nào để Gemini AI phân tích sâu hơn về mối liên hệ giữa các lá bài trong phiên này."
                        : "Ask any follow-up question for Gemini AI to analyze the deeper connections between your drawn cards."}
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-slate-400 mb-1 px-1">
                        {msg.sender === "user"
                          ? isVi
                            ? "Bạn"
                            : "You"
                          : isVi
                          ? "✦ Nhà Tiên Tri AI"
                          : "✦ AI Oracle"}
                      </span>
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-2xs ${
                          msg.sender === "user"
                            ? "bg-primary text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-[#E2E8F0] rounded-bl-xs"
                        }`}
                      >
                        {(msg.sender === "ai" ? splitAiParagraphs(msg.text) : [msg.text]).map((para, pIdx) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                {isSendingChat && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 px-2 py-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span>{isVi ? "Nhà Tiên Tri AI đang luận giải..." : "AI Oracle is interpreting..."}</span>
                  </div>
                )}
              </div>

              {/* Popup Input Footer */}
              {!isTodaySession ? (
                <div className="shrink-0">
                  <div className="bg-amber-50 border-t border-amber-200 px-3.5 py-2.5 flex items-start gap-2 text-[11px] text-amber-900 leading-snug">
                    <span className="material-symbols-outlined text-sm text-amber-700 shrink-0 mt-0.5">lock</span>
                    <span>
                      {isVi
                        ? `Phiên ngày ${sessionDateLabel || "cũ"} đã lưu trữ. Tính năng hỏi đáp với AI chỉ hoạt động cho phiên của ngày hôm nay.`
                        : `This session from ${sessionDateLabel || "a past day"} is archived. AI Q&A is only available for today's session.`}
                    </span>
                  </div>
                  <div className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
                    <input
                      type="text"
                      value=""
                      readOnly
                      disabled
                      placeholder={
                        isVi
                          ? "Hỏi đáp AI đã khóa cho phiên ngày cũ..."
                          : "AI Q&A is locked for past-day sessions..."
                      }
                      className="flex-1 bg-slate-100 text-slate-400 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled
                      className="px-3.5 py-2.5 bg-slate-200 text-slate-500 rounded-xl text-xs font-mono font-bold uppercase cursor-not-allowed shrink-0 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">lock</span>
                      <span>{isVi ? "Đã khóa" : "Locked"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shrink-0">
                  {chatError && (
                    <div className="bg-rose-50 border-t border-rose-200 px-3.5 py-2 text-[11px] text-rose-700">
                      {chatError}
                    </div>
                  )}
                  <form
                    onSubmit={handleSendChat}
                    className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={questionInput}
                      onChange={(e) => {
                        setQuestionInput(e.target.value);
                        if (chatError) setChatError(null);
                      }}
                      placeholder={
                        isVi
                          ? "Nhập câu hỏi đào sâu với Gemini AI..."
                          : "Ask follow-up question to Gemini AI..."
                      }
                      disabled={isSendingChat}
                      className="flex-1 bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat || !questionInput.trim()}
                      className="px-4 py-2.5 bg-primary hover:bg-[#047857] text-white rounded-xl text-xs font-mono font-bold uppercase disabled:bg-slate-200 disabled:text-slate-500 transition-colors shrink-0"
                    >
                      {isSendingChat ? "..." : isVi ? "Gửi" : "Send"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        <MobileBottomNav activeTab="oracle" />
      </div>
    </div>
  );
}

export default function MobileReadingReportPage() {
  return (
    <RequireAuthGate authPath="/app/auth">
      <MobileReadingReportContent />
    </RequireAuthGate>
  );
}
