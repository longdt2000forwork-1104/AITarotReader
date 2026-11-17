"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditorialHeader from "@/components/EditorialHeader";
import RequireAuthGate from "@/components/auth/RequireAuthGate";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto, DrawnCardDto } from "@/types/api";
import { TAROT_CARDS } from "@/data/tarotCards";
import { splitAiParagraphs } from "@/utils/formatAiText";

interface WorkbenchPageProps {
  params: { id: string };
}

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

function ReadingWorkbenchContent({ params }: WorkbenchPageProps) {
  const { locale, t } = useLanguage();
  const isVi = locale === "vi";
  const router = useRouter();

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardDetail, setSelectedCardDetail] = useState<DrawnCardDto | null>(null);
  const [isDrawingClarifier, setIsDrawingClarifier] = useState(false);
  const [clarifierSuccess, setClarifierSuccess] = useState(false);
  const [clarifierError, setClarifierError] = useState<string | null>(null);

  // Follow-up chat state
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([]);

  const MAX_TOTAL_CARDS = 10;

  // Determine whether the active reading session belongs to today's calendar day
  const isTodaySession = useMemo(() => {
    if (!session?.createdAt) return true;
    return isSameLocalDay(session.createdAt);
  }, [session?.createdAt]);

  const sessionDateLabel = useMemo(() => {
    if (!session?.createdAt) return "";
    const d = new Date(session.createdAt);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [session?.createdAt, isVi]);

  const initMessages = (s: ReadingSessionDto) => {
    if (s.messages && s.messages.length > 0) {
      setChatMessages(
        s.messages.map((m) => ({
          sender: m.sender === "USER" ? "user" : "ai",
          text: m.content,
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }))
      );
    } else {
      setChatMessages([
        {
          sender: "user",
          text: isVi
            ? "Tôi nên phân bổ thời gian và năng lực sáng tạo thế nào trong chu kỳ này?"
            : "How should I structure my creative time and focus during this cycle?",
          time: "09:41",
        },
        {
          sender: "ai",
          text: isVi
            ? "Hãy dành một khối thời gian làm việc sâu 90 phút vào mỗi buổi sáng hoàn toàn cho việc phác thảo độc lập. Tránh tìm kiếm phản hồi từ bên ngoài cho đến khi sản phẩm mẫu đã thành hình rõ ràng trên thực tế."
            : "Isolate a 90-minute morning deep-work block strictly for solitary drafting. Do not seek external validation until the core prototype is physically tangible.",
          time: "09:42",
        },
      ]);
    }
  };

  // Load reading session (no demo-session generation)
  useEffect(() => {
    let isSubscribed = true;

    async function loadWorkbenchSession() {
      setIsLoading(true);
      setClarifierError(null);
      try {
        const id = params.id;

        // 1. Load specific session UUID
        if (id && id !== "demo-session") {
          const res = await apiClient.readings.getById(id);
          if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0 && isSubscribed) {
            setSession(res.data);
            initMessages(res.data);
            setIsLoading(false);
            return;
          }
        }

        // 2. If invalid ID or legacy demo route, check today's flipped daily draw
        const dailyRes = await apiClient.readings.checkDailyDraw(locale);
        if (
          dailyRes.data &&
          dailyRes.data.id &&
          dailyRes.data.drawnCards &&
          dailyRes.data.drawnCards.length > 0 &&
          isSubscribed
        ) {
          setSession(dailyRes.data);
          initMessages(dailyRes.data);
          if (typeof window !== "undefined") {
            router.replace(`/workbench/${dailyRes.data.id}`);
          }
          setIsLoading(false);
          return;
        }

        // 3. No active daily reading found -> redirect back to Daily Index so user flips today's card
        if (isSubscribed) {
          router.replace("/");
        }
      } catch (err) {
        console.warn("Failed to load workbench session from backend:", err);
        if (isSubscribed) {
          router.replace("/");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadWorkbenchSession();

    return () => {
      isSubscribed = false;
    };
  }, [params.id, locale, router]);

  // Handle follow-up chat with AI Reader
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !session?.id || isSendingChat) return;

    const userText = chatInput.trim();
    setChatInput("");
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setChatMessages((prev) => [...prev, { sender: "user", text: userText, time: nowTime }]);
    setIsSendingChat(true);

    try {
      const res = await apiClient.readings.sendChat(session.id, userText);
      const aiReply =
        res.data?.content ||
        (isVi
          ? "Hãy neo giữ sự tĩnh lặng và quan sát dòng chảy năng lượng. Mỗi quyết định sáng tạo được khởi sinh từ sự hiện diện chân thật sẽ dẫn lối đến kết quả vững bền."
          : "Anchor yourself in mindful stillness. Creative actions initiated from authentic presence will naturally cultivate lasting fruition.");

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: isVi
            ? "Vũ trụ đang lắng nghe thông điệp của bạn. Hãy tiếp tục vững bước trên hành trình sáng tạo."
            : "The universe acknowledges your inquiry. Continue walking steadily upon your creative path.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Draw Clarifier card (only permitted on today's session and under 10 cards)
  const handleDrawClarifier = async () => {
    if (!session || isDrawingClarifier) return;
    if (!isTodaySession) {
      setClarifierError(
        isVi
          ? "Phiên trải bài của ngày cũ chỉ có thể xem lại luận giải, không thể rút thêm lá bổ sung."
          : "Past-day sessions are read-only; you cannot draw additional clarifier cards."
      );
      return;
    }
    if ((session.drawnCards?.length || 0) >= MAX_TOTAL_CARDS) return;

    setIsDrawingClarifier(true);
    setClarifierError(null);

    try {
      // 1. Call Backend API to draw & persist Clarifier card into Supabase + generate AI message
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
          setChatMessages(
            res.data.messages.map((m) => ({
              sender: m.sender === "USER" ? "user" : "ai",
              text: m.content,
              time: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }))
          );
        }
        return;
      }

      // 2. Fallback (only if backend returned empty response on today's session while offline)
      const usedIds = new Set((session.drawnCards || []).map((dc) => Number((dc.card as any)?.id)));
      const availableCards = TAROT_CARDS.filter((c) => !usedIds.has(c.id));
      const clarifierCard = availableCards[Math.floor(Math.random() * availableCards.length)] || TAROT_CARDS[0];

      const newDrawnCard: DrawnCardDto = {
        positionIndex: session.drawnCards?.length || 3,
        positionNameVi: "Lá Làm Rõ (Clarifier)",
        positionNameEn: "Clarifier Insight",
        isReversed: Math.random() > 0.65,
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
          meaningReversedVi: "",
          meaningReversedEn: "",
          keywordsUprightVi: clarifierCard.keywordsVi,
          keywordsUprightEn: clarifierCard.keywordsEn,
          keywordsReversedVi: "",
          keywordsReversedEn: "",
          archetypeEn: clarifierCard.nameEn,
          archetypeVi: clarifierCard.nameVi,
        },
      };

      const updatedSession: ReadingSessionDto = {
        ...session,
        drawnCards: [...(session.drawnCards || []), newDrawnCard],
      };

      setSession(updatedSession);
      setClarifierSuccess(true);
      setTimeout(() => setClarifierSuccess(false), 4000);

      const cardName = isVi ? clarifierCard.nameVi : clarifierCard.nameEn;
      const orient = newDrawnCard.isReversed ? (isVi ? "Ngược" : "Reversed") : isVi ? "Xuôi" : "Upright";
      const promptClarifier = isVi
        ? `Tôi vừa rút thêm lá bài làm rõ: ${cardName} (${orient}). Hãy phân tích ý nghĩa và lời khuyên bổ sung của lá bài này đối với quẻ bài.`
        : `I just drew a clarifier card: ${cardName} (${orient}). Please analyze its guidance in relation to the current spread.`;

      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages((prev) => [...prev, { sender: "user", text: promptClarifier, time: nowTime }]);
      setIsSendingChat(true);

      apiClient.readings
        .sendChat(session.id, promptClarifier)
        .then((chatRes) => {
          if (chatRes.data?.content) {
            setChatMessages((prev) => [
              ...prev,
              {
                sender: "ai",
                text: chatRes.data.content,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }
        })
        .catch((err) => {
          console.warn("Clarifier chat error:", err);
        })
        .finally(() => {
          setIsSendingChat(false);
        });
    } catch (err) {
      console.error("Clarifier draw error:", err);
    } finally {
      setIsDrawingClarifier(false);
    }
  };

  const drawnCards = session?.drawnCards || [];
  const spreadName = isVi
    ? session?.spreadNameVi || session?.spreadTemplate?.nameVi || "Hiện Trạng · Hành Động · Kết Quả"
    : session?.spreadNameEn || session?.spreadTemplate?.nameEn || "Situation · Action · Outcome";

  const aiSynthesis = session?.aiInterpretation || session?.aiSynthesisResult || "";

  return (
    <>
      <EditorialHeader activeTab="workbench" />

      {/* 2-COLUMN SPLIT-PANE READING WORKBENCH */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-outline-variant flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-slate-500 hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>{t.workbench.dailyPortal}</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>
                {isVi
                  ? `PHIÊN #${session?.sessionCode || params.id || "001"} · ${spreadName}`
                  : `SESSION #${session?.sessionCode || params.id || "001"} · ${spreadName}`}
              </span>
            </span>
            {sessionDateLabel && (
              <span
                className={`font-mono text-[11px] px-2.5 py-0.5 rounded border ${
                  isTodaySession
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {sessionDateLabel} ·{" "}
                {isTodaySession
                  ? isVi
                    ? "Phiên Hôm Nay"
                    : "Today"
                  : isVi
                  ? "Ngày Cũ · Chỉ Xem Luận Giải"
                  : "Past Day · Read Only"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/journal"
              className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <span>{isVi ? "Lịch Nhật Ký" : "Calendar Journal"}</span>
            </Link>
          </div>
        </div>

        {/* 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-120px)] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* LEFT COLUMN: SPREAD CANVAS & CONTEXT HEADER (58% / 7 cols) */}
          <div className="lg:col-span-7 p-6 bg-[#FAF9F6] flex flex-col justify-between linen-texture">
            <div>
              {/* Compact Session & Question Header */}
              <div className="mb-6 p-4 bg-white border border-outline-variant rounded-xl shadow-2xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block">
                      {isVi ? "KHÔNG GIAN TRẢI BÀI · BÀN ĐỌC CHUYÊN SÂU" : "SPREAD CANVAS · READING WORKBENCH"}
                    </span>
                    <h2 className="font-headline font-bold text-lg text-on-surface">
                      {spreadName}
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {drawnCards.length > 0
                      ? isVi
                        ? `ĐÃ LẬT ${drawnCards.length}/${MAX_TOTAL_CARDS} LÁ`
                        : `${drawnCards.length}/${MAX_TOTAL_CARDS} CARDS REVEALED`
                      : isVi
                      ? "ĐANG TẢI..."
                      : "LOADING..."}
                  </span>
                </div>
                {(session?.question || session?.userQuestion) && (
                  <div className="pt-2 border-t border-slate-100 text-xs font-serif italic text-slate-700">
                    “{session.question || session.userQuestion}”
                  </div>
                )}
              </div>

              {/* Card Grid in Linen table */}
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3 animate-pulse">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="bg-white border border-outline-variant rounded-lg p-3 text-center flex flex-col justify-between min-h-[300px]">
                      <div className="h-3 w-16 bg-slate-200 rounded mx-auto" />
                      <div className="w-20 h-32 mx-auto rounded bg-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300 animate-spin">progress_activity</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-8 bg-slate-200 rounded mx-auto" />
                        <div className="h-3 w-20 bg-slate-200 rounded mx-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : drawnCards.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-outline-variant rounded-lg">
                  <p className="text-xs text-slate-500">
                    {isVi ? "Chưa có lá bài nào được rút. Nhấn để nạp trải bài." : "No cards drawn yet. Click to pull cards."}
                  </p>
                </div>
              ) : (
                <div
                  className={`grid ${
                    drawnCards.length === 1
                      ? "grid-cols-1 max-w-[220px] mx-auto"
                      : drawnCards.length === 2
                      ? "grid-cols-2 max-w-[460px] mx-auto"
                      : drawnCards.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-4"
                  } gap-3`}
                >
                  {drawnCards.map((dc, idx) => {
                    const cardData = dc.card as any;
                    const cardId = Number(cardData?.id);
                    const staticCard = TAROT_CARDS.find((c) => c.id === cardId);
                    const cardImage =
                      cardData?.imageUrl || cardData?.image || staticCard?.image || "/decks/rider-waite-1909/cards/00_the_fool.webp";
                    const cardName = isVi
                      ? cardData?.nameVi || staticCard?.nameVi || "Lá Bài"
                      : cardData?.nameEn || staticCard?.nameEn || "Tarot Card";
                    const cardNum = cardData?.number || staticCard?.number || `#${idx + 1}`;
                    const posName = isVi
                      ? dc.positionNameVi || `Vị trí 0${idx + 1}`
                      : dc.positionNameEn || `Position 0${idx + 1}`;
                    const isReversed = Boolean(dc.isReversed);
                    const isCenterFocus = idx === 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCardDetail(dc)}
                        className={`bg-white rounded-lg p-3 text-center flex flex-col justify-between shadow-sm min-h-[290px] cursor-pointer transition-all duration-200 group ${
                          isCenterFocus
                            ? "border-2 border-primary shadow-md relative -translate-y-1"
                            : "border border-outline-variant hover:border-primary hover:shadow-md"
                        }`}
                      >
                        {isCenterFocus && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-mono px-2 py-0.5 rounded-full uppercase shadow-xs">
                            {isVi ? "Trọng Tâm" : "Core Focus"}
                          </div>
                        )}
                        <div
                          className={`text-[10px] font-mono border-b pb-1 truncate ${
                            isCenterFocus ? "text-primary font-semibold border-emerald-100" : "text-slate-400 border-slate-100"
                          }`}
                        >
                          {posName.toUpperCase()}
                        </div>

                        <div className="my-auto py-2 relative flex items-center justify-center">
                          <img
                            src={cardImage}
                            alt={cardName}
                            className={`w-20 h-32 mx-auto rounded object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-all duration-200 ${
                              isReversed ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        <div className="border-t border-slate-100 pt-1.5">
                          <div className="font-mono text-[9px] text-slate-400">{cardNum}</div>
                          <div className="font-headline font-bold text-xs text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                            {cardName.toUpperCase()}
                          </div>
                          <div className={`text-[9px] font-mono font-medium ${isReversed ? "text-amber-700" : "text-emerald-600"}`}>
                            {isReversed ? (isVi ? "Ngược" : "Reversed") : isVi ? "Xuôi" : "Upright"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Clarifier Slot with Today-only & 10-card limit enforcement */}
              <div
                className={`mt-6 p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                  !isTodaySession
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-white border-dashed border-outline-variant"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <span>
                      {isVi
                        ? `Lá Làm Rõ Trong Ngày (${drawnCards.length}/${MAX_TOTAL_CARDS} lá)`
                        : `Daily Clarifier Allowance (${drawnCards.length}/${MAX_TOTAL_CARDS} cards)`}
                    </span>
                    {!isTodaySession && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {isVi ? "ĐÃ KHÓA" : "LOCKED"}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {!isTodaySession
                      ? isVi
                        ? `Phiên này thuộc ngày ${sessionDateLabel || "trước đây"}. Khi đã sang ngày mới, bạn chỉ có thể xem lại luận giải và không thể rút thêm lá bổ sung.`
                        : `This reading belongs to ${sessionDateLabel || "a past day"}. Past-day sessions are archived for review only and cannot draw more cards.`
                      : clarifierError
                      ? clarifierError
                      : drawnCards.length >= MAX_TOTAL_CARDS
                      ? isVi
                        ? "Đã đạt giới hạn tối đa 10 lá bài trong phiên hôm nay."
                        : "Maximum limit of 10 cards for today's session reached."
                      : clarifierSuccess
                      ? isVi
                        ? "✓ Đã rút thành công thêm 1 lá Làm Rõ vào bàn trải và tự động lưu vào Nhật Ký!"
                        : "✓ Clarifier card added and auto-archived to your Journal!"
                      : isVi
                      ? `Hôm nay bạn còn có thể rút thêm tối đa ${MAX_TOTAL_CARDS - drawnCards.length} lá bổ sung cho phiên này.`
                      : `You can draw up to ${MAX_TOTAL_CARDS - drawnCards.length} more clarifier cards in today's session.`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDrawClarifier}
                  disabled={!isTodaySession || isDrawingClarifier || drawnCards.length >= MAX_TOTAL_CARDS}
                  className={`shrink-0 whitespace-nowrap px-4 py-2 text-xs font-medium rounded-lg flex items-center justify-center transition-all disabled:cursor-not-allowed ${
                    !isTodaySession
                      ? "bg-slate-200 text-slate-500"
                      : "bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
                  }`}
                >
                  <span>
                    {!isTodaySession
                      ? isVi
                        ? "Phiên Ngày Cũ · Chỉ Xem"
                        : "Past Session · View Only"
                      : drawnCards.length >= MAX_TOTAL_CARDS
                      ? isVi
                        ? "Đã Đủ 10/10 Lá"
                        : "Max 10/10 Cards"
                      : isDrawingClarifier
                      ? isVi
                        ? "Đang rút..."
                        : "Drawing..."
                      : isVi
                      ? "Rút Lá Làm Rõ"
                      : "Draw Clarifier"}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-4 text-center text-[11px] font-mono text-slate-400">
              {isVi ? "NHẤN VÀO LÁ BÀI BẤT KỲ ĐỂ XEM Ý NGHĨA KINH ĐIỂN" : "CLICK ON ANY CARD TO INSPECT CANONICAL MEANINGS"}
            </div>
          </div>

          {/* RIGHT COLUMN: AI SYNTHESIS REPORT & CLARIFIER CHAT (42% / 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between">
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1">
                  {isVi ? "BÁO CÁO LUẬN GIẢI · GEMINI AI" : "STREAMING SYNTHESIS · REPORT"}
                </span>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  {isVi ? "Luận Giải: Tái Định Hướng Sáng Tạo" : "Synthesis: Creative Re-alignment"}
                </h3>
              </div>

              {/* Section 1: Core Synthesis */}
              <div className="space-y-2 border-b border-outline-variant pb-4">
                <div className="font-mono text-xs font-semibold uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>{isVi ? "01. Biện Chứng Cốt Lõi" : "01. Core Dialectic"}</span>
                </div>
                <div className="font-body text-xs text-[#475569] leading-relaxed space-y-2.5">
                  {splitAiParagraphs(
                    aiSynthesis ||
                      (isVi
                        ? "Năng lượng quẻ bài mở ra không gian thức tỉnh mạnh mẽ. Hãy tập trung khai phóng những nguồn lực bên trong bạn thay vì lo âu về những yếu tố ngoại cảnh. Mọi công cụ cần thiết cho giai đoạn tiếp theo đều đã hiện diện."
                        : "The cards reveal a transformative awakening. Focus your awareness on internal strengths rather than transient external circumstances. The tools required for your next iteration are already in your possession.")
                  ).map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Section 2: Actionable Checklist */}
              <div className="space-y-2 border-b border-outline-variant pb-4">
                <div className="font-mono text-xs font-semibold uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">checklist</span>
                  <span>{isVi ? "02. Các Bước Hành Động Cụ Thể" : "02. Tactical Next Steps"}</span>
                </div>
                <ul className="text-xs text-[#475569] space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>
                    <span>
                      {isVi
                        ? "Rà soát lại toàn bộ công việc đang dang dở, tạm gác lại những đầu việc không cốt lõi."
                        : "Audit current work-in-progress and archive non-essential tasks."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>
                    <span>
                      {isVi
                        ? "Dành trọn vẹn 90 phút buổi sáng cho công việc sáng tạo độc lập, không xao nhãng mạng xã hội."
                        : "Dedicate a focused 90-minute morning block to solitary creative execution."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>
                    <span>
                      {isVi
                        ? "Mọi diễn biến của phiên trải bài hôm nay tự động được lưu trong Nhật Ký Lịch Ngày."
                        : "Today's reading session is automatically preserved in your Calendar Journal."}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Section 3: Synthesis Pullquote */}
              <div className="p-3.5 rounded-lg bg-[#FAF9F6] border-l-2 border-primary border-y border-r border-outline-variant">
                <blockquote className="font-headline italic text-xs text-on-surface leading-snug">
                  {isVi
                    ? "“Hành động là phương thuốc duy nhất giải tỏa mọi hoang mang hiện sinh. Hãy kiến tạo phiên bản tiếp theo dưới ánh sáng ban ngày.”"
                    : "“Action is the only cure for existential dread. Build the next iteration in daylight.”"}
                </blockquote>
              </div>

              {/* Follow-up Dialogue Thread */}
              <div className="space-y-3 pt-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {isVi ? "ĐỐI THOẠI LÀM RÕ (FOLLOW-UP DIALOGUE)" : "FOLLOW-UP DIALOGUE"}
                </div>
                <div className="space-y-2.5">
                  {chatMessages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-slate-100 text-slate-800 ml-4 border border-slate-200"
                          : "bg-emerald-50/80 text-emerald-950 mr-2 border border-emerald-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{msg.sender === "user" ? (isVi ? "BẠN" : "YOU") : isVi ? "GEMINI AI" : "AI READER"}</span>
                        <span>{msg.time}</span>
                      </div>
                      <div className="space-y-1.5">
                        {(msg.sender === "ai" ? splitAiParagraphs(msg.text) : [msg.text]).map((para, pIdx) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="p-3 bg-emerald-50 text-xs text-primary flex items-center gap-2 rounded-lg">
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      <span>{isVi ? "Gemini AI đang suy ngẫm câu trả lời..." : "Gemini AI is contemplating..."}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Clarifier Input Bar */}
            <form onSubmit={handleSendChat} className="pt-4 border-t border-outline-variant">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span>{isVi ? "Hỏi thêm quẻ bài" : "Ask Follow-up Question"}</span>
                <span className="text-primary font-semibold">{isVi ? "KẾT NỐI TRỰC TIẾP" : "LIVE CONNECTED"}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isVi ? "Đặt câu hỏi cụ thể để làm rõ thêm..." : "Ask a tactical follow-up question..."}
                  className="flex-1 px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-subtle focus:bg-white focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingChat}
                  className="px-3.5 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <span>{isVi ? "Gửi" : "Send"}</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Card Details Modal popup when user clicks any card */}
      {selectedCardDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-outline-variant relative">
            <button
              onClick={() => setSelectedCardDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg leading-none"
            >
              ×
            </button>
            <div className="flex gap-4 items-start">
              <img
                src={
                  (selectedCardDetail.card as any)?.imageUrl ||
                  (selectedCardDetail.card as any)?.image ||
                  "/decks/rider-waite-1909/cards/00_the_fool.webp"
                }
                alt={(selectedCardDetail.card as any)?.nameEn || ""}
                className={`w-24 h-40 object-cover rounded border border-slate-200 shadow-sm shrink-0 ${
                  selectedCardDetail.isReversed ? "rotate-180" : ""
                }`}
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-[10px] font-mono text-primary uppercase font-bold">
                  {isVi ? selectedCardDetail.positionNameVi : selectedCardDetail.positionNameEn}
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  {(selectedCardDetail.card as any)?.number} —{" "}
                  {isVi ? (selectedCardDetail.card as any)?.nameVi : (selectedCardDetail.card as any)?.nameEn}
                </h3>
                <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                  {selectedCardDetail.isReversed
                    ? isVi
                      ? "Vị trí: Ngược"
                      : "Orientation: Reversed"
                    : isVi
                    ? "Vị trí: Xuôi"
                    : "Orientation: Upright"}
                </div>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed line-clamp-4">
                  {isVi
                    ? (selectedCardDetail.card as any)?.summaryVi || (selectedCardDetail.card as any)?.meaningUprightVi
                    : (selectedCardDetail.card as any)?.summaryEn || (selectedCardDetail.card as any)?.meaningUprightEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ReadingWorkbenchPage({ params }: WorkbenchPageProps) {
  return (
    <RequireAuthGate authPath="/auth">
      <ReadingWorkbenchContent params={params} />
    </RequireAuthGate>
  );
}
