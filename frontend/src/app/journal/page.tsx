"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { JournalEntryDto, ReadingSessionDto } from "@/types/api";

export default function JournalPatternLedgerPage() {
  const { locale, t } = useLanguage();
  const [journals, setJournals] = useState<JournalEntryDto[]>([]);
  const [sessions, setSessions] = useState<ReadingSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryDto | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadJournalData() {
      setIsLoading(true);
      try {
        const [journalRes, historyRes] = await Promise.all([
          apiClient.readings.getJournal(),
          apiClient.readings.getHistory()
        ]);
        const historySessions = Array.isArray(historyRes.data)
          ? historyRes.data.filter((s) => s.drawnCards && s.drawnCards.length > 0)
          : [];
        setSessions(historySessions);

        let mergedJournals: JournalEntryDto[] = Array.isArray(journalRes.data) ? [...journalRes.data] : [];
        const existingSessionIds = new Set(mergedJournals.map((j) => j.readingSessionId));

        for (const s of historySessions) {
          if (!existingSessionIds.has(s.id)) {
            const cardNames = (s.drawnCards || [])
              .map((dc) => dc.card?.nameVi || dc.card?.nameEn)
              .filter(Boolean) as string[];
            mergedJournals.push({
              id: `JN-${s.id.slice(0, 8)}`,
              readingSessionId: s.id,
              sessionCode: `SESSION-${s.id.slice(0, 8).toUpperCase()}`,
              title:
                s.question && s.question !== "Daily Energetic Guidance & Reflection"
                  ? s.question
                  : `${s.spreadNameVi || "Trải Bài Tarot"}${cardNames.length ? " · " + cardNames.slice(0, 3).join(", ") : ""}`,
              summary: (s.aiInterpretation || s.aiSynthesisResult || "Nghiệm lý trải bài Tarot").slice(0, 160),
              userNotes: s.aiInterpretation || s.aiSynthesisResult || "",
              tags: cardNames.length ? cardNames : ["Trải Bài Tarot"],
              spreadNameEn: s.spreadNameEn || "Tarot Spread",
              spreadNameVi: s.spreadNameVi || "Trải bài Tarot",
              cardCount: s.drawnCards?.length || 1,
              createdAt: s.createdAt
            });
          }
        }

        setJournals(mergedJournals);
        if (mergedJournals.length > 0) {
          setSelectedEntry(mergedJournals[0]);
          setReflectionText(mergedJournals[0].userNotes || "");
        }
      } catch (err) {
        console.error("Failed to load journal ledger:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadJournalData();
  }, []);

  const handleSelectEntry = (entry: JournalEntryDto) => {
    setSelectedEntry(entry);
    setReflectionText(entry.userNotes);
    setSaveSuccess(false);
  };

  const handleSaveReflection = async () => {
    if (!selectedEntry) return;
    try {
      const res = await apiClient.readings.saveJournal(selectedEntry.readingSessionId, reflectionText, selectedEntry.tags);
      if (res.code === 201) {
        setSaveSuccess(true);
        // Refresh journal list
        const updated = await apiClient.readings.getJournal();
        if (updated.code === 200) setJournals(updated.data);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving reflection:", err);
    }
  };

  return (
    <>
      <EditorialHeader activeTab="journal" />

      {/* WEB ARCHIVE JOURNAL & PATTERN LEDGER (SCR-W04) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white pb-20 lg:pb-0">
        {/* Top Analytics KPI Bar */}
        <section className="p-6 linen-texture border-b border-outline-variant grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">
              {locale === "vi" ? "TỔNG SỐ PHIÊN ĐÃ LƯU" : "TOTAL SESSIONS LOGGED"}
            </span>
            <div className="font-headline font-bold text-2xl text-on-surface">
              {sessions.length || 24} {locale === "vi" ? "Phiên Trải" : "Readings"}
            </div>
            <div className="text-xs text-slate-500">
              {locale === "vi" ? "Đã lưu trữ và đối chiếu năng lượng" : "Archived and energetically calibrated"}
            </div>
          </div>

          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">
              {locale === "vi" ? "LÁ BÀI LẶP LẠI (STALKER CARD)" : "STALKER CARD · RECURRING THEME"}
            </span>
            <div className="font-headline font-bold text-xl text-primary flex items-center gap-2">
              <span>{locale === "vi" ? "XIX Mặt Trời (The Sun)" : "XIX The Sun"}</span>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                {locale === "vi" ? "Xuất hiện 4 lần" : "Drawn 4 times"}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {locale === "vi" ? "Khát vọng sáng tạo & Thức tỉnh rõ ràng" : "Creative manifestation & unclouded intellect"}
            </div>
          </div>

          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500 uppercase">
                {locale === "vi" ? "TỶ LỆ NGUYÊN TỐ 30 NGÀY" : "30-DAY ELEMENTAL RATIO"}
              </span>
              <span className="text-primary font-semibold">
                {locale === "vi" ? "Thiên về Hỏa & Khí" : "Fire & Air Heavy"}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-amber-500 h-full w-[40%]" title="Fire 40%" />
              <div className="bg-blue-400 h-full w-[30%]" title="Air 30%" />
              <div className="bg-emerald-500 h-full w-[20%]" title="Earth 20%" />
              <div className="bg-cyan-500 h-full w-[10%]" title="Water 10%" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>{locale === "vi" ? "Hỏa 40%" : "Fire 40%"}</span>
              <span>{locale === "vi" ? "Khí 30%" : "Air 30%"}</span>
              <span>{locale === "vi" ? "Địa 20%" : "Earth 20%"}</span>
              <span>{locale === "vi" ? "Thủy 10%" : "Water 10%"}</span>
            </div>
          </div>
        </section>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* Left: Journal Entries List (40% / 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#F8FAFC] space-y-3">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                {t.journal.entriesTitle} · {journals.length}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {locale === "vi" ? "MỚI NHẤT TRƯỚC" : "NEWEST FIRST"}
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center bg-white rounded-lg border border-outline-variant space-y-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-mono">
                  {locale === "vi" ? "Đang tải lịch sử trải bài từ Supabase..." : "Loading reading history from Supabase..."}
                </p>
              </div>
            ) : journals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-dashed border-slate-300 space-y-3">
                <span className="material-symbols-outlined text-3xl text-slate-300">menu_book</span>
                <p className="text-xs text-slate-500">{t.journal.noEntries}</p>
                <Link
                  href="/workbench/demo-session"
                  className="inline-block px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-xs"
                >
                  {t.journal.newReadingBtn}
                </Link>
              </div>
            ) : (
              journals.map((entry) => {
                const active = selectedEntry?.id === entry.id;
                return (
                  <div
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      active
                        ? "bg-white border-2 border-primary shadow-sm"
                        : "bg-white border-outline-variant hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>{entry.sessionCode}</span>
                      <span suppressHydrationWarning>{new Date(entry.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</span>
                    </div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mt-1">
                      {entry.title || entry.spreadNameVi}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{entry.summary}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.tags.map((tg, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Reflection Editor & Detailed Synthesis (60% / 7 cols) */}
          <div className="lg:col-span-7 p-6 bg-white space-y-6">
            {selectedEntry ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                      {locale === "vi" ? `CHI TIẾT NHẬT KÝ · ${selectedEntry.sessionCode}` : `JOURNAL DETAIL · ${selectedEntry.sessionCode}`}
                    </span>
                    <h2 className="font-headline font-bold text-xl text-on-surface">
                      {selectedEntry.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {locale === "vi" ? "Trải bài:" : "Spread:"} {selectedEntry.spreadNameVi} ({selectedEntry.cardCount} {locale === "vi" ? "lá bài" : "cards"})
                    </p>
                  </div>

                  {selectedEntry.readingSessionId && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/workbench/${selectedEntry.readingSessionId}`}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-200 rounded-lg text-xs font-mono font-semibold transition-colors"
                      >
                        {locale === "vi" ? "Mở trên Workbench →" : "Open Workbench →"}
                      </Link>
                      <Link
                        href={`/app/readings/${selectedEntry.readingSessionId}`}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-outline-variant rounded-lg text-xs font-mono font-semibold transition-colors"
                      >
                        {locale === "vi" ? "Xem Báo Cáo →" : "View Report →"}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Reflection Input */}
                <div className="space-y-2">
                  <label className="font-mono text-xs text-slate-500 block uppercase">
                    {t.journal.reflectionLabel}
                  </label>
                  <textarea
                    rows={6}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder={t.journal.reflectionPlaceholder}
                    className="w-full p-4 text-xs border border-outline-variant rounded-lg bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-emerald-600 font-medium">
                    {saveSuccess && (locale === "vi" ? "✓ Đã lưu thành công vào Supabase!" : "✓ Saved to Supabase!")}
                  </span>
                  <button
                    onClick={handleSaveReflection}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-colors"
                  >
                    {t.journal.saveReflection}
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 space-y-2 text-slate-400">
                <span className="material-symbols-outlined text-4xl text-slate-300">auto_stories</span>
                <p className="text-xs max-w-sm">
                  {t.journal.selectPrompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <MobileBottomNav activeTab="journal" />
    </>
  );
}
