"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto, DrawnCardDto } from "@/types/api";
import { TAROT_CARDS } from "@/data/tarotCards";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function MobileReadingReportPage() {
  const params = useParams();
  const readingId = (params?.id as string) || "demo-session";
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isClarifying, setIsClarifying] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([]);

  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        if (readingId && readingId !== "demo-session") {
          const res = await apiClient.readings.getById(readingId);
          if (res.code === 200 && res.data) {
            setSession(res.data);
            if (res.data.messages && res.data.messages.length > 0) {
              setChatMessages(
                res.data.messages.map((m) => ({
                  sender: m.sender === "AI_READER" ? "ai" : "user",
                  text: m.content
                }))
              );
            }
            return;
          }
        }

        // Demo session handler
        const historyRes = await apiClient.readings.getHistory();
        if (historyRes.code === 200 && historyRes.data.length > 0) {
          const existing = historyRes.data[0];
          setSession(existing);
          if (existing.messages && existing.messages.length > 0) {
            setChatMessages(
              existing.messages.map((m) => ({
                sender: m.sender === "AI_READER" ? "ai" : "user",
                text: m.content
              }))
            );
          }
        } else {
          // If no history, create a live 3-card session via Supabase
          const createRes = await apiClient.readings.create({
            spreadId: "S-02",
            deckId: "ED-01",
            question: isVi ? "Định hướng phát triển và thấu thị năng lượng" : "Trajectory of development and energy clarity",
            inputMode: "CARD_DRAW"
          });
          if (createRes.data) {
            let active = createRes.data;
            if (!active.drawnCards || active.drawnCards.length === 0) {
              const drawRes = await apiClient.readings.drawCards(active.id);
              if (drawRes.data) active = drawRes.data;
            }
            if (!active.aiInterpretation) {
              const interpRes = await apiClient.readings.interpret(active.id);
              if (interpRes.data) active = interpRes.data;
            }
            setSession(active);
          }
        }
      } catch (err) {
        console.error("Failed to load reading report session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [readingId, isVi]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isSendingChat || !session) return;

    const userText = questionInput.trim();
    setQuestionInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsSendingChat(true);

    try {
      const res = await apiClient.readings.sendChat(session.id, userText);
      if (res.data) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: res.data.content }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: isVi
              ? "Vũ trụ gửi tín hiệu: Hãy tiếp tục nuôi dưỡng niềm tin nội tâm và kiên định với con đường đã chọn."
              : "The universe signals: Continue nurturing your inner conviction along this path."
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: isVi
            ? "Đã ghi nhận câu hỏi. Hãy giữ vững tâm thức tĩnh lặng để đón nhận thông điệp."
            : "Question noted. Maintain a tranquil mind to receive intuitive guidance."
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const MAX_TOTAL_CARDS = 10;

  const handleDrawClarifier = async () => {
    if (!session || isClarifying || (session.drawnCards?.length || 0) >= MAX_TOTAL_CARDS) return;
    setIsClarifying(true);
    try {
      // 1. Call Backend Clarifier endpoint to draw from Supabase, save to drawn_cards, and generate AI interpretation
      const res = await apiClient.readings.drawClarifier(session.id);
      if (res.data && res.data.drawnCards && res.data.drawnCards.length > 0) {
        setSession(res.data);
        if (res.data.messages && res.data.messages.length > 0) {
          setChatMessages(
            res.data.messages.map((m) => ({
              sender: m.sender === "AI_READER" ? "ai" : "user",
              text: m.content
            }))
          );
        }
        return;
      }

      // 2. Fallback if backend has not reloaded yet: draw an unused card and append at the bottom
      if ((session.drawnCards?.length || 0) >= MAX_TOTAL_CARDS) return;
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
    ? session.spreadTemplate?.nameVi || "Trải Bài 3 Lá"
    : session.spreadTemplate?.nameEn || "3-Card Spread";

  // Calculate Elemental Balance dynamically
  const elementCounts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  drawnCards.forEach((dc) => {
    const el = dc.card?.element || "Fire";
    if (elementCounts[el] !== undefined) elementCounts[el]++;
    else elementCounts.Fire++;
  });
  const totalCards = drawnCards.length || 1;
  const firePct = Math.round((elementCounts.Fire / totalCards) * 100);
  const earthPct = Math.round((elementCounts.Earth / totalCards) * 100);
  const airPct = Math.round((elementCounts.Air / totalCards) * 100);
  const waterPct = Math.max(0, 100 - (firePct + earthPct + airPct));

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
              {isVi ? "Báo Cáo Tổng Hợp" : "Synthesis Report"}
            </h1>
            <span className="text-[10px] text-slate-500 truncate max-w-[170px] font-mono">
              {spreadName}
            </span>
          </div>
          <div className="flex items-center gap-2">
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

            <Link
              href={`/app/readings/${session.id}/share`}
              className="text-slate-600 hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-100"
              title={isVi ? "Xuất Ấn Phẩm Poster" : "Export Specimen Poster"}
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </Link>

            <Link
              href="/app/profile"
              className="text-slate-600 hover:text-primary transition-colors p-1 rounded hover:bg-slate-100"
              title={isVi ? "Hồ sơ cá nhân" : "Seeker Profile"}
            >
              <span className="material-symbols-outlined text-xl">person</span>
            </Link>
          </div>
        </header>

        {/* 3. Main Reading Content Scroll */}
        <main className="p-4 space-y-6">
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

          {/* Section 01: Elemental Synthesis */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                {isVi ? "01. ĐỘNG LỰC NGUYÊN TỐ (SUPABASE)" : "01. Elemental Dynamics (Supabase)"}
              </h3>
              <span className="text-[10px] font-mono text-primary font-semibold">
                {isVi ? `Hỏa ${firePct}% · Thổ ${earthPct}%` : `Fire ${firePct}% · Earth ${earthPct}%`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                <span className="block text-amber-900 font-bold">{firePct}%</span>
                <span className="text-[10px] text-amber-700">{isVi ? "Lửa 🔥" : "Fire 🔥"}</span>
              </div>
              <div className="p-2 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                <span className="block text-emerald-900 font-bold">{earthPct}%</span>
                <span className="text-[10px] text-emerald-700">{isVi ? "Đất 🌿" : "Earth 🌿"}</span>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg">
                <span className="block text-slate-800 font-bold">{airPct}%</span>
                <span className="text-[10px] text-slate-600">{isVi ? "Khí 💨" : "Air 💨"}</span>
              </div>
              <div className="p-2 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <span className="block text-blue-900 font-bold">{waterPct}%</span>
                <span className="text-[10px] text-blue-600">{isVi ? "Nước 💧" : "Water 💧"}</span>
              </div>
            </div>
          </section>

          {/* Section 02: Position-by-Position Analysis */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                {isVi ? "02. PHÂN TÍCH CHI TIẾT CÁC LÁ BÀI" : "02. Arcana Breakdown"}
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
              const imgUrl = card?.imageUrl || (card as any)?.image || staticMatch?.image || "/decks/rider-waite-1909/cards/00_the_fool.webp";
              const meaning = dc.isReversed
                ? (isVi
                    ? card?.meaningReversedVi || (card as any)?.summaryVi || staticMatch?.meaningUprightVi
                    : card?.meaningReversedEn || (card as any)?.summaryEn || staticMatch?.meaningUprightEn)
                : (isVi
                    ? card?.meaningUprightVi || (card as any)?.summaryVi || staticMatch?.meaningUprightVi
                    : card?.meaningUprightEn || (card as any)?.summaryEn || staticMatch?.meaningUprightEn);
              const keywords = dc.isReversed
                ? (isVi
                    ? card?.keywordsReversedVi || staticMatch?.keywordsVi
                    : card?.keywordsReversedEn || staticMatch?.keywordsEn)
                : (isVi
                    ? card?.keywordsUprightVi || staticMatch?.keywordsVi
                    : card?.keywordsUprightEn || staticMatch?.keywordsEn);
              const stepNum = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={dc.id || idx}
                  className={`bg-white border rounded-xl p-4 space-y-3 shadow-xs ${
                    dc.isClarifier ? "border-amber-400 bg-amber-50/20" : "border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                      dc.isClarifier ? "text-amber-700" : "text-primary"
                    }`}>
                      {dc.isClarifier
                        ? `✦ ${isVi ? `VỊ TRÍ ${stepNum} · LÁ BÀI LÀM RÕ (CLARIFIER)` : `POSITION ${stepNum} · CLARIFIER CARD`}`
                        : `VỊ TRÍ ${stepNum} · ${posName}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {dc.isReversed ? (isVi ? "NGƯỢC ↓" : "REVERSED ↓") : (isVi ? "XUÔI ↑" : "UPRIGHT ↑")}
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
                      <p className="text-xs text-slate-600 leading-relaxed">
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

            {/* Full-width Clarifier Draw Action Button at the bottom of the card list */}
            <button
              type="button"
              disabled={isClarifying || drawnCards.length >= MAX_TOTAL_CARDS}
              onClick={handleDrawClarifier}
              className="w-full border border-dashed border-primary/60 bg-white hover:bg-emerald-50/60 rounded-xl px-4 py-3 flex items-center justify-center text-primary text-xs font-mono font-bold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {drawnCards.length >= MAX_TOTAL_CARDS
                  ? isVi
                    ? "Đã đạt giới hạn tối đa (10/10 lá)"
                    : "Maximum limit reached (10/10 cards)"
                  : isClarifying
                  ? isVi
                    ? "Đang rút lá bài làm rõ..."
                    : "Drawing clarifier card..."
                  : isVi
                  ? "Rút Lá Bài Làm Rõ (5 CR)"
                  : "Draw Clarifier Card (5 CR)"}
              </span>
            </button>
          </section>

          {/* Section 03: Core Synthesis Thesis */}
          <section className="bg-white border-2 border-primary/80 rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              {isVi ? "03. LUẬN ĐIỂM TỔNG HỢP CỐT LÕI (GEMINI AI)" : "03. SYNTHESIS THESIS (GEMINI AI)"}
            </span>
            <h3 className="font-headline font-bold text-lg text-slate-900">
              {isVi ? "Thông Điệp Cốt Lõi Từ Vũ Trụ" : "Core Oracle Synthesis"}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {session.aiInterpretation ||
                session.aiSynthesisResult ||
                (isVi
                  ? "Năng lượng các lá bài hội tụ chỉ ra rằng bạn đang đứng trước bước ngoặt quyết định. Hãy giữ tâm thế tự chủ và biến các chiêm nghiệm thành hành động cụ thể."
                  : "The converging card energies indicate a defining milestone. Maintain sovereign focus and ground insights into deliberate action.")}
            </p>
          </section>

          {/* Section 04: Tactical Action Advice */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              {isVi ? "04. KHUYẾN NGHỊ HÀNH ĐỘNG THỰC TẾ" : "04. Actionable Steps"}
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">1.</span>
                <span>
                  {isVi
                    ? "Dành thời gian tĩnh tại đầu ngày để lắng nghe trực giác trước khi tiếp nhận thông tin từ bên ngoài."
                    : "Dedicate early morning tranquility to consult inner intuition before external noise."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">2.</span>
                <span>
                  {isVi
                    ? "Ghi chép lại các nghiệm chứng trong ngày vào nhật ký để theo dõi chu kỳ năng lượng."
                    : "Log daily reflections in the journal ledger to trace recurrent energetic cycles."}
                </span>
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>
                {isVi ? "Đồng bộ Supabase & Gemini Live" : "Synced with Supabase & Gemini"}
              </span>
              <Link
                href={`/app/readings/${session.id}/share`}
                className="text-primary hover:underline font-semibold"
              >
                {isVi ? "Xuất Thẻ Chia Sẻ →" : "Export Share Card →"}
              </Link>
            </div>
          </section>
        </main>

        {/* 4. Floating AI Chat Bubble & Popup Window */}
        {!isChatOpen ? (
          <div className="fixed bottom-20 left-0 right-0 max-w-[420px] mx-auto px-4 pointer-events-none z-40 flex justify-end">
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
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-2 sm:p-4">
            <div className="w-full max-w-[410px] h-[78vh] max-h-[640px] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
              {/* Popup Header */}
              <div className="px-4 py-3 bg-[#FAF9F6] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm text-slate-900 leading-tight">
                      {isVi ? "Hỏi Đáp Đào Sâu · Gemini AI" : "Oracle Dialectic · Gemini AI"}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {isVi
                        ? `${drawnCards.length} lá bài trong phiên · Trực tuyến`
                        : `${drawnCards.length} cards in session · Live`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                  title={isVi ? "Thu nhỏ" : "Minimize"}
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Popup Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]/60">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-3 text-slate-500">
                    <span className="material-symbols-outlined text-3xl text-primary/60">
                      forum
                    </span>
                    <p className="text-xs leading-relaxed">
                      {isVi
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
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                          msg.sender === "user"
                            ? "bg-primary text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-[#E2E8F0] rounded-bl-xs"
                        }`}
                      >
                        {msg.text}
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
              <form
                onSubmit={handleSendChat}
                className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
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
          </div>
        )}

        <MobileBottomNav activeTab="oracle" />
      </div>
    </div>
  );
}
