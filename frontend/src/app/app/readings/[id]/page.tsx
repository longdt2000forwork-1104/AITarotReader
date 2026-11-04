"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto, DrawnCardDto } from "@/types/api";

export default function MobileReadingReportPage() {
  const params = useParams();
  const readingId = (params?.id as string) || "demo-session";
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isClarifying, setIsClarifying] = useState(false);
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

  const handleDrawClarifier = async () => {
    if (!session || isClarifying) return;
    setIsClarifying(true);
    try {
      // Simulate drawing clarifier or send inquiry
      const res = await apiClient.readings.sendChat(
        session.id,
        isVi ? "Hãy rút và diễn giải một lá bài bổ sung làm rõ (Clarifier) cho trải bài này." : "Draw and interpret a clarifier card for this reading."
      );
      if (res.data) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: isVi ? "+ Rút Lá Bài Làm Rõ (Clarifier)" : "+ Draw Clarifier Card"
          },
          { sender: "ai", text: res.data.content }
        ]);
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
      <div className="w-full max-w-[420px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-52 border-x border-[#E2E8F0] shadow-sm">
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
          </div>
        </header>

        {/* 2. Pinned Drawn Cards Summary Strip */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {drawnCards.map((dc, idx) => {
              const cardName = isVi ? dc.card?.nameVi : dc.card?.nameEn;
              const posName = isVi ? dc.positionNameVi : dc.positionNameEn;
              return (
                <div
                  key={dc.id || idx}
                  className="shrink-0 bg-white border border-[#E2E8F0] rounded px-2.5 py-1.5 flex items-center gap-2 shadow-2xs"
                >
                  <img
                    src={dc.card?.imageUrl || "/decks/rider-waite-1909/cards/00_the_fool.webp"}
                    alt={cardName}
                    className={`w-5 h-8 object-cover rounded border border-slate-200 ${
                      dc.isReversed ? "rotate-180" : ""
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                      {`0${idx + 1} · ${posName.slice(0, 4)}`}
                    </span>
                    <span className="font-headline font-bold text-xs text-slate-900 truncate max-w-[90px]">
                      {cardName} {dc.isReversed ? "↓" : "↑"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Clarifier Button */}
            <button
              type="button"
              disabled={isClarifying}
              onClick={handleDrawClarifier}
              className="shrink-0 border border-dashed border-primary/50 bg-white hover:bg-emerald-50/50 rounded px-2.5 py-1.5 flex items-center gap-1.5 text-primary text-xs font-mono font-semibold transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>{isClarifying ? "..." : (isVi ? "+ Làm Rõ (5 CR)" : "+ Clarifier")}</span>
            </button>
          </div>
        </div>

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
          <section className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              {isVi ? "02. PHÂN TÍCH CHI TIẾT CÁC LÁ BÀI" : "02. Arcana Breakdown"}
            </h3>

            {drawnCards.map((dc, idx) => {
              const card = dc.card;
              const cardName = isVi ? card?.nameVi : card?.nameEn;
              const posName = isVi ? dc.positionNameVi : dc.positionNameEn;
              const meaning = dc.isReversed
                ? (isVi ? card?.meaningReversedVi : card?.meaningReversedEn)
                : (isVi ? card?.meaningUprightVi : card?.meaningUprightEn);
              const keywords = dc.isReversed
                ? (isVi ? card?.keywordsReversedVi : card?.keywordsReversedEn)
                : (isVi ? card?.keywordsUprightVi : card?.keywordsUprightEn);

              return (
                <div key={dc.id || idx} className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                      {`VỊ TRÍ 0${idx + 1} · ${posName}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {dc.isReversed ? (isVi ? "NGƯỢC ↓" : "REVERSED ↓") : (isVi ? "XUÔI ↑" : "UPRIGHT ↑")}
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <img
                      src={card?.imageUrl || "/decks/rider-waite-1909/cards/00_the_fool.webp"}
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
                    {msg.sender === "user" ? (isVi ? "Bạn" : "You") : (isVi ? "Nhà Tiên Tri AI" : "AI Oracle")}
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
                isVi
                  ? "Hỏi đáp đào sâu với Gemini AI..."
                  : "Ask follow-up question to Gemini AI..."
              }
              disabled={isSendingChat}
              className="flex-1 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isSendingChat || !questionInput.trim()}
              className="px-3 py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase disabled:bg-slate-200 disabled:text-slate-500 transition-colors"
            >
              {isSendingChat ? "..." : (isVi ? "Hỏi" : "Ask")}
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
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
        </div>
      </div>
    </div>
  );
}
