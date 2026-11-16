"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto } from "@/types/api";
import { cleanAiText } from "@/utils/formatAiText";

export default function MobileShareStudioPage() {
  const params = useParams();
  const readingId = (params?.id as string) || "demo-session";
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [session, setSession] = useState<ReadingSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1">("9:16");
  const [theme, setTheme] = useState<"cream" | "sage" | "slate">("cream");
  const [includeQuestion, setIncludeQuestion] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (readingId && readingId !== "demo-session") {
          const res = await apiClient.readings.getById(readingId);
          if (res.code === 200 && res.data) {
            setSession(res.data);
            return;
          }
        }

        const historyRes = await apiClient.readings.getHistory();
        if (historyRes.code === 200 && historyRes.data.length > 0) {
          setSession(historyRes.data[0]);
        }
      } catch (err) {
        console.error("Failed to load session for share page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [readingId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText?.(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const themeStyles = {
    cream: "bg-[#FAF9F6] border-[#0F172A] text-[#0F172A]",
    sage: "bg-[#F2F7F4] border-[#065F46] text-[#065F46]",
    slate: "bg-[#F8FAFC] border-[#334155] text-[#0F172A]",
  };

  const drawnCards = session?.drawnCards || [];
  const displayCards = drawnCards.slice(0, 3);
  const cleanSummary = cleanAiText(session?.aiInterpretation || session?.aiSynthesisResult || "");

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[420px] bg-white min-h-screen flex flex-col shadow-xl border-x border-[#E2E8F0] relative pb-28">
        {/* 1. Top Header Bar */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <Link
            href={`/app/readings/${session?.id || readingId}`}
            className="flex items-center gap-1 text-[#0F172A] hover:text-primary transition-colors text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{isVi ? "Quay lại" : "Back"}</span>
          </Link>

          <span className="font-mono text-xs font-bold uppercase text-slate-900">
            {isVi ? "Xưởng Xuất Bản" : "Share Studio"}
          </span>

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

            <Link
              href="/app/journal"
              className="text-xs font-semibold text-primary hover:text-[#047857] transition-colors px-1.5 py-1 font-mono uppercase"
            >
              {isVi ? "Lịch" : "Journal"}
            </Link>
          </div>
        </header>

        {/* Subheader Meta Banner */}
        <div className="px-4 py-1.5 bg-[#FAF9F6] border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
            {isVi ? "XUẤT BẢN ẤN PHẨM · SUPABASE CLOUD" : "SPECIMEN EXPORT · SUPABASE"}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary font-bold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
            {isVi ? "CHUẨN 300 DPI" : "300 DPI READY"}
          </span>
        </div>

        {/* 2. Poster Preview Stage */}
        <section className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-4 py-5 flex justify-center items-center overflow-hidden">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-[11px] font-mono text-slate-500 block">
                {isVi ? "Đang dựng bản xem trước..." : "Preparing preview..."}
              </span>
            </div>
          ) : (
            <div
              className={`p-4 flex flex-col justify-between max-w-[290px] w-full shadow-md relative transition-all duration-300 border ${
                aspectRatio === "9:16" ? "aspect-[9/15]" : "aspect-square"
              } ${themeStyles[theme]}`}
            >
              {/* Inner Border Inset */}
              <div className="absolute inset-1 border border-[#E2E8F0] pointer-events-none" />

              {/* Top Colophon */}
              <div className="relative z-10 text-center border-b border-[#E2E8F0] pb-2">
                <div className="flex items-center justify-between text-[9px] tracking-widest text-slate-500 font-mono uppercase">
                  <span>{session?.sessionCode || "AITAROT · SPECIMEN"}</span>
                  <span>{new Date().toLocaleDateString("vi-VN")}</span>
                </div>
                {includeQuestion && (
                  <h1 className="font-headline italic text-[13px] font-bold text-slate-900 tracking-tight leading-snug mt-1.5 line-clamp-2">
                    “{session?.question || (isVi ? "Định hướng phát triển và thấu thị năng lượng" : "Trajectory of development")}”
                  </h1>
                )}
              </div>

              {/* Drawn Tarot Card Specimens */}
              <div className="relative z-10 my-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {displayCards.map((dc, idx) => {
                    const name = isVi ? dc.card?.nameVi : dc.card?.nameEn;
                    return (
                      <div key={dc.id || idx} className="bg-white border border-[#0F172A] p-1.5 flex flex-col items-center text-center">
                        <span className="text-[9px] font-mono font-semibold text-slate-500">{`0${idx + 1}`}</span>
                        <div className="w-full aspect-[3/4] my-1 bg-[#FAF9F6] border border-[#E2E8F0] overflow-hidden flex items-center justify-center">
                          <img
                            src={dc.card?.imageUrl || "/decks/rider-waite-1909/cards/00_the_fool.webp"}
                            alt={name}
                            className={`w-full h-full object-cover ${dc.isReversed ? "rotate-180" : ""}`}
                          />
                        </div>
                        <div className="text-[8px] font-headline font-bold text-slate-900 truncate w-full">
                          {name}
                        </div>
                        <div className="text-[7px] uppercase tracking-wider text-primary font-bold">
                          {dc.isReversed ? (isVi ? "Ngược" : "Reversed") : isVi ? "Xuôi" : "Upright"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Base Synthesis Quote & Colophon */}
              <div className="relative z-10 border-t border-[#E2E8F0] pt-2 text-center space-y-1">
                <p className="font-serif italic text-[10px] text-slate-700 leading-tight line-clamp-2">
                  “{cleanSummary ? `${cleanSummary.slice(0, 100)}...` : isVi ? "Thấu suốt tâm trí trước khi công bố. Kiến tạo thành tựu dưới ánh sáng thanh bạch." : "Illuminate before announcing. Construct your thesis in daylight."}”
                </p>
                <div className="text-[8px] font-mono uppercase tracking-widest text-slate-400">
                  AITAROT ARCHIVAL PRESS · RWS 1909
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3. Studio Controls */}
        <main className="p-4 space-y-4">
          {/* Aspect Ratio */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
              {isVi ? "Tỷ Lệ Khung Hình Poster" : "Artboard Aspect Ratio"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio("9:16")}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  aspectRatio === "9:16"
                    ? "border-primary bg-emerald-50 text-slate-900"
                    : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-base">crop_portrait</span>
                <span>{isVi ? "9:16 Câu Chuyện (Story)" : "9:16 Story / Reel"}</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("1:1")}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  aspectRatio === "1:1"
                    ? "border-primary bg-emerald-50 text-slate-900"
                    : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-base">crop_square</span>
                <span>{isVi ? "1:1 Khung Vuông (Square)" : "1:1 Square Feed"}</span>
              </button>
            </div>
          </div>

          {/* Theme Palette */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
              {isVi ? "Bảng Màu Chất Liệu Giấy" : "Paper Texture Palette"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "cream", name: isVi ? "Giấy Kem" : "Cream", color: "bg-[#FAF9F6] border-[#0F172A]" },
                { id: "sage", name: isVi ? "Xanh Thảo Mộc" : "Sage Herb", color: "bg-[#F2F7F4] border-[#065F46]" },
                { id: "slate", name: isVi ? "Đá Phiến" : "Slate", color: "bg-[#F8FAFC] border-[#334155]" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    theme === t.id ? "border-primary bg-emerald-50 ring-1 ring-primary" : "border-[#E2E8F0]"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full border ${t.color}`} />
                  <span className="text-xs font-medium text-slate-800">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Include Question Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
            <span className="text-xs font-medium text-slate-800">
              {isVi ? "In kèm câu hỏi chiêm nghiệm" : "Include inquiry question"}
            </span>
            <button
              type="button"
              onClick={() => setIncludeQuestion(!includeQuestion)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                includeQuestion ? "bg-primary" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform block mt-0.5 ${
                  includeQuestion ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </main>

        {/* 4. Bottom Sticky Action Dock */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t border-[#E2E8F0] p-3 shadow-lg z-40 space-y-2">
          {downloadSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-center text-xs font-mono text-emerald-900 font-semibold">
              {isVi
                ? "Đã xuất thành công bản in 300 DPI! (2 CR)"
                : "300 DPI Specimen Print Exported Successfully! (2 CR)"}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-3 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>
                {isVi ? "Tải Bản In Độ Phân Giải Cao (2 CR)" : "Download High-Res Print (2 CR)"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2 bg-[#FAF9F6] border border-[#E2E8F0] hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>
              {copiedLink
                ? isVi
                  ? "Đã Sao Chép Liên Kết ✓"
                  : "Link Copied to Clipboard ✓"
                : isVi
                ? "Sao Chép Liên Kết Chia Sẻ An Toàn"
                : "Copy Secure Share Link"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
