"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileReadingReportPage() {
  const params = useParams();
  const readingId = (params?.id as string) || "demo-session";
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [hasClarifier, setHasClarifier] = useState(true);
  const [followUpCount, setFollowUpCount] = useState(1);
  const [questionInput, setQuestionInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "user",
      text: isVi
        ? "Tôi nên phân bổ thời gian sáng tạo thế nào trong giai đoạn Ẩn Sĩ này?"
        : "How should I structure my creative time during the Hermit phase?",
    },
    {
      sender: "ai",
      text: isVi
        ? "Hãy dành một khối thời gian làm việc sâu 90 phút vào mỗi buổi sáng hoàn toàn cho việc phác thảo độc lập. Tránh tìm kiếm phản hồi từ bên ngoài cho đến khi sản phẩm mẫu đã thành hình rõ ràng trên thực tế."
        : "Isolate a 90-minute morning deep-work block strictly for solitary drafting. Do not seek external validation or feedback until the core prototype is physically tangible.",
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
          text: isVi
            ? "Hãy tập trung neo giữ tia sáng ban đầu vào những ghi chép cụ thể. Các lá bài chỉ ra rằng kết quả (XIX Mặt Trời) sẽ tự nhiên tỏa rạng một khi nền tảng của bạn đã vững chắc."
            : "Focus your attention on grounding the initial spark into written notes. The cards indicate your outcome (XIX The Sun) will emerge naturally once the foundation is steady.",
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
            <span>{isVi ? "Quay lại" : "Back"}</span>
          </Link>
          <div className="flex flex-col items-center text-center px-1">
            <h1 className="font-headline font-bold text-sm tracking-tight text-slate-900 leading-tight">
              {isVi ? "Báo Cáo Tổng Hợp · 3 Lá" : "Synthesis Report · 3-Card"}
            </h1>
            <span className="text-[10px] text-slate-500 truncate max-w-[170px] font-mono">
              {isVi ? "Quỹ Đạo Ra Mắt Sáng Tạo" : "Creative Launch Trajectory"}
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
              href={`/app/readings/${readingId}/share`}
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
            {/* Card 01 */}
            <div className="shrink-0 bg-white border border-[#E2E8F0] rounded px-2.5 py-1.5 flex items-center gap-2 shadow-2xs">
              <img
                src="/decks/rider-waite-1909/cards/01_the_magician.webp"
                alt="I. Magician"
                className="w-5 h-8 object-cover rounded border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  {isVi ? "01 · TÌNH HUỐNG" : "01 · SIT"}
                </span>
                <span className="font-headline font-bold text-xs text-slate-900">
                  {isVi ? "I. Ảo Thuật ↑" : "I. Magician ↑"}
                </span>
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
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  {isVi ? "02 · HÀNH ĐỘNG" : "02 · ACT"}
                </span>
                <span className="font-headline font-bold text-xs text-slate-900">
                  {isVi ? "IX. Ẩn Sĩ ↑" : "IX. Hermit ↑"}
                </span>
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
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  {isVi ? "03 · KẾT QUẢ" : "03 · OUT"}
                </span>
                <span className="font-headline font-bold text-xs text-slate-900">
                  {isVi ? "XIX. Mặt Trời ↑" : "XIX. Sun ↑"}
                </span>
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
                  <span className="font-mono text-[9px] uppercase tracking-wider text-primary font-bold">
                    {isVi ? "+1 BỔ SUNG" : "+1 CLARIFIER"}
                  </span>
                  <span className="font-headline font-bold text-xs text-emerald-950">
                    {isVi ? "Hậu Tiền ↑" : "Q. Pentacles ↑"}
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setHasClarifier(true)}
                className="shrink-0 border border-dashed border-primary/50 bg-white hover:bg-emerald-50/50 rounded px-2.5 py-1.5 flex items-center gap-1.5 text-primary text-xs font-mono font-semibold"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>{isVi ? "Lá Bổ Sung (5 CR)" : "Clarifier (5 CR)"}</span>
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
                {isVi ? "01. ĐỘNG LỰC NGUYÊN TỐ" : "01. Elemental Dynamics"}
              </h3>
              <span className="text-[10px] font-mono text-primary font-semibold">
                {isVi ? "Nguyên Tố Lửa Áp Đảo (50%)" : "Fire Dominated (50%)"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                <span className="block text-amber-900 font-bold">50%</span>
                <span className="text-[10px] text-amber-700">{isVi ? "Lửa 🔥" : "Fire 🔥"}</span>
              </div>
              <div className="p-2 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                <span className="block text-emerald-900 font-bold">25%</span>
                <span className="text-[10px] text-emerald-700">{isVi ? "Đất 🌿" : "Earth 🌿"}</span>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg">
                <span className="block text-slate-800 font-bold">25%</span>
                <span className="text-[10px] text-slate-600">{isVi ? "Khí 💨" : "Air 💨"}</span>
              </div>
              <div className="p-2 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <span className="block text-blue-900 font-bold">0%</span>
                <span className="text-[10px] text-blue-600">{isVi ? "Nước 💧" : "Water 💧"}</span>
              </div>
            </div>
          </section>

          {/* Section 02: Position-by-Position Analysis */}
          <section className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              {isVi ? "02. PHÂN TÍCH CHI TIẾT CÁC LÁ BÀI" : "02. Arcana Breakdown"}
            </h3>

            {/* Position 1 */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  {isVi ? "VỊ TRÍ 01 · TÌNH HUỐNG HIỆN TẠI" : "POSITION 01 · SITUATION"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isVi ? "XUÔI ↑" : "UPRIGHT ↑"}
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <img
                  src="/decks/rider-waite-1909/cards/01_the_magician.webp"
                  alt="The Magician"
                  className="w-14 h-22 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-headline font-bold text-base text-slate-900">
                    {isVi ? "I. Nhà Ảo Thuật (The Magician)" : "I. The Magician"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isVi
                      ? "Toàn bộ công cụ cấu thành đều đã được bài trí trên bàn làm việc của bạn. Bạn sở hữu đầy đủ quyền tự chủ về trí tuệ, khả năng sáng tạo và nguồn lực cần thiết để biến ý tưởng thành hiện thực."
                      : "All constituent tools are arrayed upon your work surface. You possess the intellectual, creative, and material sovereignty required to materialize your concept."}
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded text-xs text-slate-700 italic font-serif">
                {isVi
                  ? "“Đừng hỏi liệu bản thân đã sẵn sàng hay chưa; mọi nguyên liệu đã nằm trọn trong tay bạn.”"
                  : "“Do not ask if you are ready; the materials are already in your hands.”"}
              </div>
            </div>

            {/* Position 2 */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  {isVi ? "VỊ TRÍ 02 · HÀNH ĐỘNG CẦN THỰC HIỆN" : "POSITION 02 · ACTION"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isVi ? "XUÔI ↑" : "UPRIGHT ↑"}
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <img
                  src="/decks/rider-waite-1909/cards/09_the_hermit.webp"
                  alt="The Hermit"
                  className="w-14 h-22 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-headline font-bold text-base text-slate-900">
                    {isVi ? "IX. Ẩn Sĩ (The Hermit)" : "IX. The Hermit"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isVi
                      ? "Tạm lùi lại khỏi những ồn ào xã hội và các tuyên bố công khai. Hãy thu mình về ngọn núi tĩnh tại bên trong để kết tinh dấu ấn tư duy độc bản của bạn."
                      : "Step back from consensus noise and public declarations. Withdraw to your inner mountain to synthesize your unique intellectual signature."}
                  </p>
                </div>
              </div>
            </div>

            {/* Position 3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  {isVi ? "VỊ TRÍ 03 · KẾT QUẢ TRIỂN VỌNG" : "POSITION 03 · OUTCOME"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isVi ? "XUÔI ↑" : "UPRIGHT ↑"}
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <img
                  src="/decks/rider-waite-1909/cards/19_the_sun.webp"
                  alt="The Sun"
                  className="w-14 h-22 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-headline font-bold text-base text-slate-900">
                    {isVi ? "XIX. Mặt Trời (The Sun)" : "XIX. The Sun"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isVi
                      ? "Sự sáng tỏ rõ ràng như ban ngày, sự công nhận đích thực và nguồn sinh lực dồi dào. Những gì khởi đầu trong sự cô độc chiêm nghiệm sẽ thăng hoa rực rỡ trước ánh mắt công chúng."
                      : "Unambiguous daylight clarity, authentic recognition, and vital vitality. What begins in contemplative solitude culminates in radiant public triumph."}
                  </p>
                </div>
              </div>
            </div>

            {/* Clarifier Position */}
            {hasClarifier && (
              <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "+1 LÁ BỔ TÚC · ĐIỂM TỰA THỰC TẾ" : "+1 CLARIFIER · MATERIAL GROUNDING"}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800">
                    {isVi ? "TIÊU TỐN 5 CR" : "5 CR CONSUMED"}
                  </span>
                </div>
                <div className="flex gap-3 items-start">
                  <img
                    src="/decks/rider-waite-1909/cards/76_queen_of_pentacles.webp"
                    alt="Queen of Pentacles"
                    className="w-14 h-22 object-cover rounded border border-emerald-300 shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-headline font-bold text-base text-emerald-950">
                      {isVi ? "Hậu Tiền (Queen of Pentacles)" : "Queen of Pentacles"}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {isVi
                        ? "Đưa tầm nhìn sáng tạo bay bổng gắn chặt vào nhịp điệu sinh hoạt bền vững, thiết lập ranh giới lành mạnh và sự thực tế về tài chính."
                        : "Ground high creative vision into sustainable physical rhythm, healthy boundaries, and financial pragmatism."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 03: Core Synthesis Thesis */}
          <section className="bg-white border-2 border-primary/80 rounded-xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              {isVi ? "03. LUẬN ĐIỂM TỔNG HỢP CỐT LÕI" : "03. SYNTHESIS THESIS"}
            </span>
            <h3 className="font-headline font-bold text-lg text-slate-900">
              {isVi ? "Cung Đường Khai Sáng" : "The Arc of Illumination"}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isVi
                ? "Quỹ đạo của bạn chuyển đổi từ xung lực sáng tạo nguyên bản (Ảo Thuật), qua sự tĩnh lặng chuyên tâm có kỷ luật (Ẩn Sĩ), đến sự thấu suốt rực rỡ không thể phủ nhận (Mặt Trời). Hãy neo giữ tiến trình này bằng các cột mốc hữu hình (Hậu Tiền)."
                : "Your trajectory transitions from raw creative impulse (Magician) through deliberate, disciplined seclusion (Hermit) to unmistakable clarity (Sun). Ground this process in tangible physical milestones (Queen of Pentacles)."}
            </p>
          </section>

          {/* Section 04: Tactical Action Experiments */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              {isVi ? "04. BA THỬ NGHIỆM HÀNH ĐỘNG THỰC TẾ" : "04. Three Practical Experiments"}
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">1.</span>
                <span>
                  {isVi
                    ? "Dành riêng khung giờ 90 phút ngắt kết nối internet hoàn toàn vào sáng mai để tập trung phác thảo sâu."
                    : "Carve out a 90-minute digital blackout window tomorrow morning."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">2.</span>
                <span>
                  {isVi
                    ? "Viết tay luận điểm cốt lõi của bạn ra giấy trong một đoạn văn duy nhất trước khi tìm kiếm sự góp ý."
                    : "Document your thesis statement in one handwritten paragraph before seeking feedback."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-primary font-bold">3.</span>
                <span>
                  {isVi
                    ? "Đánh giá chi phí sản xuất và thời gian dự phòng tài chính trước khi công bố ra mắt."
                    : "Review production costs and resource runway before announcing the launch."}
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
                followUpCount >= 3
                  ? isVi
                    ? "Đã đạt giới hạn câu hỏi cho phiên trải bài này"
                    : "Maximum inquiries reached for this session"
                  : isVi
                  ? `Đặt câu hỏi đào sâu (còn ${3 - followUpCount} lượt)...`
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
              {isVi ? "Hỏi" : "Ask"}
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>
              {isVi
                ? `Hạn mức: Còn ${3 - followUpCount}/3 câu hỏi`
                : `Quota: ${3 - followUpCount}/3 inquiries remaining`}
            </span>
            <Link
              href={`/app/readings/${readingId}/share`}
              className="text-primary hover:underline font-semibold"
            >
              {isVi ? "Xuất Thẻ Chia Sẻ (2 CR) →" : "Export Share Card (2 CR) →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
