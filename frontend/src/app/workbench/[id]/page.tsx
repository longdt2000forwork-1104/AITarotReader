"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto, DrawnCardDto } from "@/types/api";
import { TAROT_CARDS } from "@/data/tarotCards";

interface WorkbenchPageProps {
  params: { id: string };
}

export default function ReadingWorkbenchPage({ params }: WorkbenchPageProps) {
  const { locale, t } = useLanguage();
  const isVi = locale === "vi";

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<"MYSTIC_SAGE" | "IDEA_SPARK" | "GENTLE_FRIEND">("IDEA_SPARK");
  const [selectedCardDetail, setSelectedCardDetail] = useState<DrawnCardDto | null>(null);
  const [isDrawingClarifier, setIsDrawingClarifier] = useState(false);
  const [clarifierSuccess, setClarifierSuccess] = useState(false);

  // Follow-up chat state
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([]);

  // Load reading session
  useEffect(() => {
    let isSubscribed = true;

    async function loadWorkbenchSession() {
      setIsLoading(true);
      try {
        const id = params.id;

        // If specific session UUID is requested
        if (id && id !== "demo-session") {
          const res = await apiClient.readings.getById(id);
          if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0 && isSubscribed) {
            setSession(res.data);
            initMessages(res.data);
            setIsLoading(false);
            return;
          }
        }

        // Handle "demo-session" or fallback: attempt to load user's real latest session
        const historyRes = await apiClient.readings.getHistory();
        if (historyRes.data && historyRes.data.length > 0 && isSubscribed) {
          const latest = historyRes.data[0];
          if (latest.drawnCards && latest.drawnCards.length > 0) {
            setSession(latest);
            initMessages(latest);
            setIsLoading(false);
            return;
          }
        }

        // If no history exists, check daily draw
        const dailyRes = await apiClient.readings.getDailyDraw(locale, false);
        if (dailyRes.data && dailyRes.data.drawnCards && dailyRes.data.drawnCards.length > 0 && isSubscribed) {
          setSession(dailyRes.data);
          initMessages(dailyRes.data);
          setIsLoading(false);
          return;
        }

        // If still empty, provision a real 3-card spread session via Supabase backend
        const createRes = await apiClient.readings.create({
          spreadId: "S-02",
          deckId: "ED-01",
          inputMode: "VIRTUAL",
          persona: "IDEA_SPARK",
          question: isVi
            ? "Định hướng phát triển và chuyển hóa năng lượng cá nhân trong chu kỳ mới"
            : "Creative Direction & Energy Realignment for the current cycle",
        });

        if (createRes.data && isSubscribed) {
          const created = createRes.data;
          const drawnRes = await apiClient.readings.drawCards(created.id);
          const interpretedRes = await apiClient.readings.interpret(created.id);
          const finalSession = interpretedRes.data || drawnRes.data || created;
          setSession(finalSession);
          initMessages(finalSession);
          if (typeof window !== "undefined" && window.history && id === "demo-session") {
            window.history.replaceState(null, "", `/workbench/${finalSession.id}`);
          }
        }
      } catch (err) {
        console.warn("Failed to load workbench session from backend:", err);
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
  }, [params.id, locale]);

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

  // Elemental balance gauge calculated dynamically from drawn cards
  const elementalBalance = useMemo(() => {
    const cards = session?.drawnCards || [];
    if (cards.length === 0) {
      return { fire: 45, air: 25, earth: 20, water: 10, dominant: isVi ? "Thiên về Hỏa" : "Fire Dominated" };
    }

    let fire = 0;
    let water = 0;
    let air = 0;
    let earth = 0;

    cards.forEach((dc) => {
      const cardId = Number((dc.card as any)?.id);
      const staticCard = TAROT_CARDS.find((c) => c.id === cardId);
      const el = (staticCard?.element || (dc.card as any)?.suit || "").toLowerCase();

      if (el.includes("fire") || el.includes("wands")) fire += 1;
      else if (el.includes("water") || el.includes("cups")) water += 1;
      else if (el.includes("air") || el.includes("swords")) air += 1;
      else if (el.includes("earth") || el.includes("pentacles")) earth += 1;
      else fire += 1; // Major Arcana default distribution
    });

    const total = fire + water + air + earth || 1;
    const firePct = Math.round((fire / total) * 100);
    const airPct = Math.round((air / total) * 100);
    const earthPct = Math.round((earth / total) * 100);
    const waterPct = Math.max(0, 100 - firePct - airPct - earthPct);

    let dominant = isVi ? "Cân Bằng Hài Hòa" : "Balanced Matrix";
    if (firePct >= 40) dominant = isVi ? "Thiên về Hỏa 🔥" : "Fire Dominated 🔥";
    else if (airPct >= 40) dominant = isVi ? "Thiên về Khí 💨" : "Air Dominated 💨";
    else if (earthPct >= 40) dominant = isVi ? "Thiên về Thổ 🌿" : "Earth Dominated 🌿";
    else if (waterPct >= 40) dominant = isVi ? "Thiên về Thủy 💧" : "Water Dominated 💧";

    return { fire: firePct, air: airPct, earth: earthPct, water: waterPct, dominant };
  }, [session, isVi]);

  // Handle follow-up chat with AI Reader persona
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

  // Draw Clarifier card
  const handleDrawClarifier = async () => {
    if (!session || isDrawingClarifier) return;
    setIsDrawingClarifier(true);

    try {
      // Pick a random unused card from catalog as clarifier
      const usedIds = new Set((session.drawnCards || []).map((dc) => Number((dc.card as any)?.id)));
      const availableCards = TAROT_CARDS.filter((c) => !usedIds.has(c.id));
      const clarifierCard = availableCards[Math.floor(Math.random() * availableCards.length)] || TAROT_CARDS[0];

      const newDrawnCard: DrawnCardDto = {
        positionIndex: (session.drawnCards?.length || 3),
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

      // Trigger real Gemini AI inquiry for this clarifier
      const cardName = isVi ? clarifierCard.nameVi : clarifierCard.nameEn;
      const orient = newDrawnCard.isReversed ? (isVi ? "Ngược" : "Reversed") : (isVi ? "Xuôi" : "Upright");
      const promptClarifier = isVi
        ? `Tôi vừa rút thêm lá bài làm rõ: ${cardName} (${orient}). Hãy phân tích ý nghĩa và lời khuyên bổ sung của lá bài này đối với quẻ bài.`
        : `I just drew a clarifier card: ${cardName} (${orient}). Please analyze its guidance in relation to the current spread.`;

      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages((prev) => [
        ...prev,
        { sender: "user", text: promptClarifier, time: nowTime }
      ]);
      setIsSendingChat(true);

      apiClient.readings.sendChat(session.id, promptClarifier).then((chatRes) => {
        if (chatRes.data?.content) {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: chatRes.data.content,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);
        }
      }).catch((err) => {
        console.warn("Clarifier chat error:", err);
      }).finally(() => {
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

  const deckName = isVi
    ? session?.deckNameVi || session?.deck?.nameVi || "Rider-Waite 1909 Kinh Điển"
    : session?.deckNameEn || session?.deck?.nameEn || "Rider-Waite 1909 Canonical";

  const aiSynthesis = session?.aiInterpretation || session?.aiSynthesisResult || "";

  return (
    <>
      <EditorialHeader activeTab="workbench" />

      {/* 3-COLUMN SPLIT-PANE READING WORKBENCH */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                {locale === "vi"
                  ? `PHIÊN #${session?.sessionCode || params.id || "001"} · ${spreadName}`
                  : `SESSION #${session?.sessionCode || params.id || "001"} · ${spreadName}`}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block font-mono text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {locale === "vi" ? `GIỌNG ĐỌC: ${selectedPersona}` : `READER: ${selectedPersona}`}
            </span>
            <Link
              href={session?.id ? `/app/readings/${session.id}/share` : "/pricing"}
              className="px-3 py-1 bg-white border border-outline-variant rounded text-xs font-medium text-on-surface hover:bg-slate-50 flex items-center gap-1 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              <span>{t.workbench.exportCard}</span>
            </Link>
          </div>
        </div>

        {/* 3 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-120px)] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* LEFT COLUMN: HISTORY & SPREAD PARAMETERS (25% / 3 cols) */}
          <div className="lg:col-span-3 p-6 bg-[#F8FAFC] flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2">
                  {t.workbench.spreadSpec}
                </span>
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  {spreadName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isVi ? `Bộ bài: ${deckName}` : `Active Deck: ${deckName}`}
                </p>
                {(session?.question || session?.userQuestion) && (
                  <div className="mt-3 p-3 bg-white border border-outline-variant rounded-lg text-xs font-serif italic text-slate-700">
                    "{session.question || session.userQuestion}"
                  </div>
                )}
              </div>

              {/* Elemental Balance Gauge */}
              <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-3 shadow-2xs">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">{t.workbench.elementalBalance}</span>
                  <span className="text-primary font-semibold">
                    {elementalBalance.dominant}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${elementalBalance.fire}%` }} title={`Fire ${elementalBalance.fire}%`} />
                  <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${elementalBalance.air}%` }} title={`Air ${elementalBalance.air}%`} />
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${elementalBalance.earth}%` }} title={`Earth ${elementalBalance.earth}%`} />
                  <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${elementalBalance.water}%` }} title={`Water ${elementalBalance.water}%`} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{isVi ? `Hỏa ${elementalBalance.fire}%` : `Fire ${elementalBalance.fire}%`}</span>
                  <span>{isVi ? `Khí ${elementalBalance.air}%` : `Air ${elementalBalance.air}%`}</span>
                  <span>{isVi ? `Thổ ${elementalBalance.earth}%` : `Earth ${elementalBalance.earth}%`}</span>
                  <span>{isVi ? `Thủy ${elementalBalance.water}%` : `Water ${elementalBalance.water}%`}</span>
                </div>
              </div>

              {/* Reader Persona Switcher */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block">
                  {locale === "vi" ? "02. GIỌNG ĐỌC AI" : "02. ANALYTICAL VOICE"}
                </span>
                <div className="border border-outline-variant rounded-lg divide-y divide-outline-variant bg-white text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPersona("MYSTIC_SAGE")}
                    className={`w-full p-2.5 flex items-center justify-between text-left transition-colors ${
                      selectedPersona === "MYSTIC_SAGE"
                        ? "bg-emerald-50/70 text-primary font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {selectedPersona === "MYSTIC_SAGE" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      <span>{locale === "vi" ? "Huyền Bí Cổ Điển" : "Classic Mystic"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {locale === "vi" ? "Chiêm Tinh" : "Esoteric"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPersona("IDEA_SPARK")}
                    className={`w-full p-2.5 flex items-center justify-between text-left transition-colors ${
                      selectedPersona === "IDEA_SPARK"
                        ? "bg-emerald-50/70 text-primary font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {selectedPersona === "IDEA_SPARK" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      <span>{locale === "vi" ? "Tia Sáng Sáng Tạo" : "Idea Spark"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-primary font-semibold">
                      {locale === "vi" ? "Tập Trung" : "Creative Focus"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPersona("GENTLE_FRIEND")}
                    className={`w-full p-2.5 flex items-center justify-between text-left transition-colors ${
                      selectedPersona === "GENTLE_FRIEND"
                        ? "bg-emerald-50/70 text-primary font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {selectedPersona === "GENTLE_FRIEND" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      <span>{locale === "vi" ? "Người Bạn Ôn Nhu" : "Gentle Friend"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {locale === "vi" ? "Đồng Cảm" : "Compassionate"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant">
              <div className="font-mono text-[11px] text-slate-400">
                {locale === "vi" ? "HỒ SƠ BẢN ĐỒ SAO: BẠCH DƯƠNG · SỐ ĐƯỜNG ĐỜI 7" : "CLIENT CONTEXT: ARIES · LIFE PATH 7"}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: TACTILE SPREAD BOARD (40% / 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#FAF9F6] flex flex-col justify-between linen-texture">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  {locale === "vi" ? "KHÔNG GIAN TRẢI BÀI · TIẾN TRÌNH TRỰC QUAN" : "SPREAD CANVAS · DRAWN MATRIX"}
                </span>
                <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {drawnCards.length > 0 ? (isVi ? `ĐÃ LẬT ${drawnCards.length} LÁ` : `${drawnCards.length} CARDS REVEALED`) : (isVi ? "ĐANG TẢI..." : "LOADING...")}
                </span>
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
                <div className={`grid ${drawnCards.length === 1 ? "grid-cols-1 max-w-[200px] mx-auto" : drawnCards.length === 2 ? "grid-cols-2" : drawnCards.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"} gap-3`}>
                  {drawnCards.map((dc, idx) => {
                    const cardData = dc.card as any;
                    const cardId = Number(cardData?.id);
                    const staticCard = TAROT_CARDS.find((c) => c.id === cardId);
                    const cardImage = cardData?.imageUrl || cardData?.image || staticCard?.image || "/decks/rider-waite-1909/cards/00_the_fool.webp";
                    const cardName = isVi ? (cardData?.nameVi || staticCard?.nameVi || "Lá Bài") : (cardData?.nameEn || staticCard?.nameEn || "Tarot Card");
                    const cardNum = cardData?.number || staticCard?.number || `#${idx + 1}`;
                    const posName = isVi ? (dc.positionNameVi || `Vị trí 0${idx + 1}`) : (dc.positionNameEn || `Position 0${idx + 1}`);
                    const isReversed = Boolean(dc.isReversed);
                    const isCenterFocus = idx === 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCardDetail(dc)}
                        className={`bg-white rounded-lg p-3 text-center flex flex-col justify-between shadow-sm min-h-[300px] cursor-pointer transition-all duration-200 group ${
                          isCenterFocus
                            ? "border-2 border-primary shadow-md relative -translate-y-1"
                            : "border border-outline-variant hover:border-primary hover:shadow-md"
                        }`}
                      >
                        {isCenterFocus && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-mono px-2 py-0.5 rounded-full uppercase shadow-xs">
                            {locale === "vi" ? "Trọng Tâm" : "Core Focus"}
                          </div>
                        )}
                        <div className={`text-[10px] font-mono border-b pb-1 truncate ${isCenterFocus ? "text-primary font-semibold border-emerald-100" : "text-slate-400 border-slate-100"}`}>
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
                            {isReversed ? (isVi ? "Ngược" : "Reversed") : (isVi ? "Xuôi" : "Upright")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Clarifier Slot */}
              <div className="mt-6 p-4 bg-white border border-dashed border-outline-variant rounded-lg flex items-center justify-between shadow-2xs">
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-700">
                    {locale === "vi" ? "Cần Đào Sâu Thêm?" : "Need More Depth?"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {clarifierSuccess
                      ? (isVi ? "✓ Đã rút thành công thêm 1 lá Làm Rõ vào bàn trải!" : "✓ Clarifier card added to your spread!")
                      : (isVi ? "Rút thêm 1 lá Làm Rõ (Clarifier) bổ trợ trực tiếp vào bàn trải" : "Draw 1 Clarifier card into this active spread matrix")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDrawClarifier}
                  disabled={isDrawingClarifier}
                  className="px-3.5 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isDrawingClarifier ? "progress_activity" : "add"}
                  </span>
                  <span>{isDrawingClarifier ? (isVi ? "Đang rút..." : "Drawing...") : (isVi ? "+ Rút Lá Làm Rõ" : "+ Draw Clarifier")}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 text-center text-[11px] font-mono text-slate-400">
              {locale === "vi" ? "NHẤN VÀO LÁ BÀI BẤT KỲ ĐỂ XEM Ý NGHĨA KINH ĐIỂN" : "CLICK ON ANY CARD TO INSPECT CANONICAL MEANINGS"}
            </div>
          </div>

          {/* RIGHT COLUMN: AI SYNTHESIS REPORT & CLARIFIER CHAT (35% / 4 cols) */}
          <div className="lg:col-span-4 p-6 bg-white flex flex-col justify-between">
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-1">
                  {locale === "vi" ? "BÁO CÁO LUẬN GIẢI · GEMINI AI" : "STREAMING SYNTHESIS · REPORT"}
                </span>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  {locale === "vi" ? "Luận Giải: Tái Định Hướng Sáng Tạo" : "Synthesis: Creative Re-alignment"}
                </h3>
              </div>

              {/* Section 1: Core Synthesis */}
              <div className="space-y-2 border-b border-outline-variant pb-4">
                <div className="font-mono text-xs font-semibold uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>{locale === "vi" ? "01. Biện Chứng Cốt Lõi" : "01. Core Dialectic"}</span>
                </div>
                <p className="font-body text-xs text-[#475569] leading-relaxed whitespace-pre-line">
                  {aiSynthesis ||
                    (isVi
                      ? "Năng lượng quẻ bài mở ra không gian thức tỉnh mạnh mẽ. Hãy tập trung khai phóng những nguồn lực bên trong bạn thay vì lo âu về những yếu tố ngoại cảnh. Mọi công cụ cần thiết cho giai đoạn tiếp theo đều đã hiện diện."
                      : "The cards reveal a transformative awakening. Focus your awareness on internal strengths rather than transient external circumstances. The tools required for your next iteration are already in your possession.")}
                </p>
              </div>

              {/* Section 2: Actionable Checklist */}
              <div className="space-y-2 border-b border-outline-variant pb-4">
                <div className="font-mono text-xs font-semibold uppercase text-primary tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">checklist</span>
                  <span>{locale === "vi" ? "02. Các Bước Hành Động Cụ Thể" : "02. Tactical Next Steps"}</span>
                </div>
                <ul className="text-xs text-[#475569] space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>
                    <span>
                      {locale === "vi"
                        ? "Rà soát lại toàn bộ công việc đang dang dở, tạm gác lại những đầu việc không cốt lõi."
                        : "Audit current work-in-progress and archive non-essential tasks."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>
                    <span>
                      {locale === "vi"
                        ? "Dành trọn vẹn 90 phút buổi sáng cho công việc sáng tạo độc lập, không xao nhãng mạng xã hội."
                        : "Dedicate a focused 90-minute morning block to solitary creative execution."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>
                    <span>
                      {locale === "vi"
                        ? "Ghi lại những cảm nhận trực giác sau khi trải nghiệm phiên trải bài vào Nhật ký cá nhân."
                        : "Record mindful reflections from this session into your personal journal."}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Section 3: Synthesis Pullquote */}
              <div className="p-3.5 rounded-lg bg-[#FAF9F6] border-l-2 border-primary border-y border-r border-outline-variant">
                <blockquote className="font-headline italic text-xs text-on-surface leading-snug">
                  {locale === "vi"
                    ? "“Hành động là phương thuốc duy nhất giải tỏa mọi hoang mang hiện sinh. Hãy kiến tạo phiên bản tiếp theo dưới ánh sáng ban ngày.”"
                    : "“Action is the only cure for existential dread. Build the next iteration in daylight.”"}
                </blockquote>
              </div>

              {/* Follow-up Dialogue Thread */}
              <div className="space-y-3 pt-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {locale === "vi" ? "ĐỐI THOẠI LÀM RÕ (FOLLOW-UP DIALOGUE)" : "FOLLOW-UP DIALOGUE"}
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
                        <span>{msg.sender === "user" ? (isVi ? "BẠN" : "YOU") : (isVi ? "GEMINI AI" : "AI READER")}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
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
                <span>{locale === "vi" ? "Hỏi thêm quẻ bài" : "Ask Follow-up Question"}</span>
                <span className="text-primary font-semibold">{locale === "vi" ? "KẾT NỐI TRỰC TIẾP" : "LIVE CONNECTED"}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={locale === "vi" ? "Đặt câu hỏi cụ thể để làm rõ thêm..." : "Ask a tactical follow-up question..."}
                  className="flex-1 px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-subtle focus:bg-white focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingChat}
                  className="px-3.5 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <span>{locale === "vi" ? "Gửi" : "Send"}</span>
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
                src={(selectedCardDetail.card as any)?.imageUrl || (selectedCardDetail.card as any)?.image || "/decks/rider-waite-1909/cards/00_the_fool.webp"}
                alt={(selectedCardDetail.card as any)?.nameEn || ""}
                className={`w-24 h-40 object-cover rounded border border-slate-200 shadow-sm shrink-0 ${selectedCardDetail.isReversed ? "rotate-180" : ""}`}
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-[10px] font-mono text-primary uppercase font-bold">
                  {isVi ? selectedCardDetail.positionNameVi : selectedCardDetail.positionNameEn}
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  {(selectedCardDetail.card as any)?.number} — {isVi ? (selectedCardDetail.card as any)?.nameVi : (selectedCardDetail.card as any)?.nameEn}
                </h3>
                <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                  {selectedCardDetail.isReversed ? (isVi ? "Vị trí: Ngược" : "Orientation: Reversed") : (isVi ? "Vị trí: Xuôi" : "Orientation: Upright")}
                </div>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed line-clamp-4">
                  {isVi
                    ? ((selectedCardDetail.card as any)?.summaryVi || (selectedCardDetail.card as any)?.meaningUprightVi)
                    : ((selectedCardDetail.card as any)?.summaryEn || (selectedCardDetail.card as any)?.meaningUprightEn)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
