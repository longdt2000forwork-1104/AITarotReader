"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { apiClient } from "@/services/apiClient";
import { JournalEntryDto, ReadingSessionDto } from "@/types/api";

export default function JournalPatternLedgerPage() {
  const [journals, setJournals] = useState<JournalEntryDto[]>([]);
  const [sessions, setSessions] = useState<ReadingSessionDto[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryDto | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadJournalData() {
      try {
        const [journalRes, historyRes] = await Promise.all([
          apiClient.readings.getJournal(),
          apiClient.readings.getHistory()
        ]);
        if (journalRes.code === 200) {
          setJournals(journalRes.data);
          if (journalRes.data.length > 0) {
            setSelectedEntry(journalRes.data[0]);
            setReflectionText(journalRes.data[0].userNotes);
          }
        }
        if (historyRes.code === 200) {
          setSessions(historyRes.data);
        }
      } catch (err) {
        console.error("Failed to load journal ledger:", err);
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
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Top Analytics KPI Bar */}
        <section className="p-6 bg-[#FAF9F6] border-b border-outline-variant grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">TOTAL SESSIONS LOGGED</span>
            <div className="font-headline font-bold text-2xl text-on-surface">
              {sessions.length || 24} Readings
            </div>
            <div className="text-xs text-slate-500">Đã lưu trữ và đối chiếu năng lượng</div>
          </div>

          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">STALKER CARD // RECURRING THEME</span>
            <div className="font-headline font-bold text-xl text-primary flex items-center gap-2">
              <span>XIX The Sun</span>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                Drawn 4 times
              </span>
            </div>
            <div className="text-xs text-slate-500">Khát vọng sáng tạo & Thức tỉnh rõ ràng</div>
          </div>

          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500 uppercase">30-DAY ELEMENTAL RATIO</span>
              <span className="text-primary font-semibold">Fire & Air Heavy</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-amber-500 h-full w-[40%]" title="Fire 40%" />
              <div className="bg-blue-400 h-full w-[30%]" title="Air 30%" />
              <div className="bg-emerald-500 h-full w-[20%]" title="Earth 20%" />
              <div className="bg-cyan-500 h-full w-[10%]" title="Water 10%" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Fire 40%</span>
              <span>Air 30%</span>
              <span>Earth 20%</span>
              <span>Water 10%</span>
            </div>
          </div>
        </section>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* Left: Journal Entries List (40% / 5 cols) */}
          <div className="lg:col-span-5 p-6 bg-[#F8FAFC] space-y-3">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                READINGS CHRONICLE // {journals.length} ENTRIES
              </span>
              <span className="text-[10px] font-mono text-slate-400">NEWEST FIRST</span>
            </div>

            {journals.map((entry) => {
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
                    <span suppressHydrationWarning>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-on-surface mt-1">
                    {entry.title || entry.spreadNameVi}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{entry.summary}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.tags.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Reflection Editor & Detailed Synthesis (60% / 7 cols) */}
          <div className="lg:col-span-7 p-6 bg-white space-y-6">
            {selectedEntry ? (
              <>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                    JOURNAL DETAIL // {selectedEntry.sessionCode}
                  </span>
                  <h2 className="font-headline font-bold text-xl text-on-surface">
                    {selectedEntry.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Trải bài: {selectedEntry.spreadNameVi} ({selectedEntry.cardCount} lá bài)
                  </p>
                </div>

                {/* Reflection Input */}
                <div className="space-y-2">
                  <label className="font-mono text-xs text-slate-500 block uppercase">
                    Personal Reflection & Empirical Evidence (Nghiệm Lý Thực Tế)
                  </label>
                  <textarea
                    rows={6}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    className="w-full p-4 text-xs border border-outline-variant rounded-lg bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                  <span className="font-mono text-[11px] text-slate-400">
                    {saveSuccess ? "✓ Đã lưu thay đổi vào sổ nhật ký!" : "Autosave ready"}
                  </span>
                  <button
                    onClick={handleSaveReflection}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-all"
                  >
                    Lưu Ghi Chép Nghiệm Lý
                  </button>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs font-mono">
                Chọn một mục nhật ký bên trái để xem và ghi chép.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
