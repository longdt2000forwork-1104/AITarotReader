"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { ReadingSessionDto } from "@/types/api";
import { cleanAiText } from "@/utils/formatAiText";

const MAX_TOTAL_CARDS = 10;

function toLocalDateKey(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function JournalPatternLedgerPage() {
  const { locale } = useLanguage();
  const isVi = locale === "vi";
  const router = useRouter();

  const [sessions, setSessions] = useState<ReadingSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toLocalDateKey(today), [today]);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  useEffect(() => {
    async function loadHistorySessions() {
      setIsLoading(true);
      try {
        const historyRes = await apiClient.readings.getHistory();
        const validSessions = Array.isArray(historyRes.data)
          ? historyRes.data
              .filter((s) => s.drawnCards && s.drawnCards.length > 0)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          : [];
        setSessions(validSessions);

        if (validSessions.length > 0) {
          const hasToday = validSessions.some((s) => toLocalDateKey(s.createdAt) === todayKey);
          const initialSession = hasToday ? validSessions.find((s) => toLocalDateKey(s.createdAt) === todayKey)! : validSessions[0];
          const initKey = toLocalDateKey(initialSession.createdAt);
          if (initKey) {
            setSelectedDateKey(initKey);
            const initDate = new Date(initialSession.createdAt);
            setCurrentMonth(new Date(initDate.getFullYear(), initDate.getMonth(), 1));
          }
        }
      } catch (err) {
        console.error("Failed to load calendar journal sessions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistorySessions();
  }, [todayKey]);

  // Group reading sessions by calendar date (YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    const map: Record<string, ReadingSessionDto[]> = {};
    for (const s of sessions) {
      const key = toLocalDateKey(s.createdAt);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [sessions]);

  // Compute recurring card analytics from actual saved sessions (without elemental stats)
  const recurringCardStat = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const s of sessions) {
      for (const dc of s.drawnCards || []) {
        const name = isVi ? dc.card?.nameVi : dc.card?.nameEn;
        if (!name) continue;
        const prev = counts.get(name);
        counts.set(name, { name, count: (prev?.count || 0) + 1 });
      }
    }
    let top: { name: string; count: number } | null = null;
    counts.forEach((entry) => {
      if (!top || entry.count > top.count) top = entry;
    });
    return top as { name: string; count: number } | null;
  }, [sessions, isVi]);

  // Build Monday-first monthly calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday = 0, ..., Sunday = 6
    const jsDay = firstDayOfMonth.getDay();
    const leadingEmptyDays = (jsDay + 6) % 7;

    const cells: Array<{
      date: Date | null;
      dateKey: string;
      dayNumber: number | null;
    }> = [];

    for (let i = 0; i < leadingEmptyDays; i++) {
      cells.push({ date: null, dateKey: `empty-start-${i}`, dayNumber: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      cells.push({
        date: dateObj,
        dateKey: toLocalDateKey(dateObj),
        dayNumber: d,
      });
    }
    const trailingEmpty = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailingEmpty; i++) {
      cells.push({ date: null, dateKey: `empty-end-${i}`, dayNumber: null });
    }
    return cells;
  }, [currentMonth]);

  const monthPrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  const monthSessions = useMemo(() => {
    return sessions.filter((s) => toLocalDateKey(s.createdAt).startsWith(monthPrefix));
  }, [sessions, monthPrefix]);

  const activeDaysInMonthCount = useMemo(() => {
    return Object.keys(sessionsByDate).filter((k) => k.startsWith(monthPrefix)).length;
  }, [sessionsByDate, monthPrefix]);

  const selectedDaySessions = sessionsByDate[selectedDateKey] || [];

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(toLocalDateKey(now));
  };

  const handleDateCellClick = (dateKey: string, daySessions: ReadingSessionDto[]) => {
    setSelectedDateKey(dateKey);
    // Navigate directly to the reading workbench of that day if there is a session
    if (daySessions.length === 1) {
      router.push(`/workbench/${daySessions[0].id}`);
    }
  };

  const weekdayHeaders = isVi
    ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const monthTitle = currentMonth.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <EditorialHeader activeTab="journal" />

      {/* WEB ARCHIVE CALENDAR JOURNAL (SCR-W04) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Top Analytics KPI Bar (2 clean cards — Elemental Ratio removed) */}
        <section className="p-6 bg-[#FAF9F6] border-b border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">
              {isVi ? "NHẬT KÝ LỊCH NGÀY · TỔNG PHIÊN ĐÃ LƯU" : "CALENDAR ARCHIVE · TOTAL SESSIONS LOGGED"}
            </span>
            <div className="font-headline font-bold text-2xl text-on-surface flex items-baseline gap-3">
              <span>
                {sessions.length} {isVi ? "Phiên Trải" : "Readings"}
              </span>
              <span className="text-xs font-mono font-normal text-primary bg-emerald-50 px-2 py-0.5 rounded">
                {activeDaysInMonthCount} {isVi ? "ngày trong tháng này" : "days this month"}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {isVi
                ? "Mỗi phiên trải bài được tự động lưu theo ngày. Nhấn vào ngày bất kỳ để mở lại bàn trải bài của ngày đó."
                : "Reading sessions are auto-archived by date. Click any active calendar date to open its workbench."}
            </div>
          </div>

          <div className="p-4 bg-white border border-outline-variant rounded-lg space-y-1">
            <span className="font-mono text-[10px] uppercase text-slate-400">
              {isVi ? "LÁ BÀI LẶP LẠI NHIỀU NHẤT" : "MOST FREQUENT CARD"}
            </span>
            <div className="font-headline font-bold text-xl text-primary flex items-center gap-2">
              <span>
                {recurringCardStat?.name || (isVi ? "XIX Mặt Trời (The Sun)" : "XIX The Sun")}
              </span>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                {isVi
                  ? `Xuất hiện ${recurringCardStat?.count || 1} lần`
                  : `Drawn ${recurringCardStat?.count || 1} times`}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {isVi
                ? "Phiên ngày hôm nay có thể rút tối đa 10 lá bổ sung; phiên ngày cũ chỉ xem lại luận giải."
                : "Today's reading allows up to 10 cards total; past-day sessions are preserved for review only."}
            </div>
          </div>
        </section>

        {/* Calendar Grid + Day/Month Session List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
          {/* Left: Monthly Calendar View (8 cols) */}
          <div className="lg:col-span-8 p-6 bg-white flex flex-col">
            {/* Calendar Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold block">
                  {isVi ? "LỊCH SỬ TRẢI BÀI THEO NGÀY" : "DAILY SESSION CALENDAR"}
                </span>
                <h1 className="font-headline font-bold text-2xl text-on-surface capitalize">
                  {monthTitle}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 border border-outline-variant rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                  title={isVi ? "Tháng trước" : "Previous month"}
                >
                  <span className="material-symbols-outlined text-base leading-none">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="px-3 py-1.5 border border-outline-variant rounded-lg hover:border-primary hover:text-primary text-xs font-mono font-semibold text-slate-700 transition-colors"
                >
                  {isVi ? "Hôm Nay" : "Today"}
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 border border-outline-variant rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
                  title={isVi ? "Tháng sau" : "Next month"}
                >
                  <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 border border-outline-variant rounded-xl bg-[#FAF9F6] space-y-2">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-slate-500">
                  {isVi ? "Đang tải lịch trải bài từ Supabase..." : "Loading calendar archive from Supabase..."}
                </p>
              </div>
            ) : (
              <div className="border border-outline-variant rounded-xl overflow-hidden bg-white shadow-2xs">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 bg-[#FAF9F6] border-b border-outline-variant">
                  {weekdayHeaders.map((day) => (
                    <div
                      key={day}
                      className="py-2.5 text-center font-mono text-[11px] font-semibold tracking-wider text-slate-500 border-r last:border-r-0 border-outline-variant"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((cell) => {
                    if (!cell.date || cell.dayNumber === null) {
                      return (
                        <div
                          key={cell.dateKey}
                          className="min-h-[104px] bg-[#FAF9F6]/60 border-b border-r last:border-r-0 border-outline-variant"
                        />
                      );
                    }

                    const daySessions = sessionsByDate[cell.dateKey] || [];
                    const hasSessions = daySessions.length > 0;
                    const isToday = cell.dateKey === todayKey;
                    const isSelected = cell.dateKey === selectedDateKey;
                    const primarySession = daySessions[0];
                    const totalCards = primarySession?.drawnCards?.length || 0;
                    const firstCardName = primarySession?.drawnCards?.[0]
                      ? isVi
                        ? primarySession.drawnCards[0].card?.nameVi
                        : primarySession.drawnCards[0].card?.nameEn
                      : "";

                    return (
                      <div
                        key={cell.dateKey}
                        onClick={() => handleDateCellClick(cell.dateKey, daySessions)}
                        className={`min-h-[104px] p-2 border-b border-r border-outline-variant flex flex-col justify-between transition-all ${
                          hasSessions
                            ? "cursor-pointer hover:bg-emerald-50/50"
                            : "bg-white hover:bg-slate-50/60 cursor-pointer"
                        } ${isSelected ? "ring-2 ring-inset ring-primary bg-emerald-50/30" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-semibold ${
                              isToday
                                ? "bg-primary text-white"
                                : hasSessions
                                ? "bg-emerald-100 text-emerald-900"
                                : "text-slate-600"
                            }`}
                          >
                            {cell.dayNumber}
                          </span>
                          {hasSessions && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                                isToday
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {daySessions.length > 1
                                ? `${daySessions.length} ${isVi ? "phiên" : "ses."}`
                                : `${totalCards}/${MAX_TOTAL_CARDS}`}
                            </span>
                          )}
                        </div>

                        {hasSessions ? (
                          <div className="mt-1.5 space-y-1">
                            <div className="text-[10px] font-headline font-bold text-slate-900 line-clamp-1">
                              {firstCardName ||
                                (isVi ? primarySession.spreadNameVi : primarySession.spreadNameEn) ||
                                "Tarot"}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono text-primary font-semibold">
                              <span>
                                {isToday
                                  ? isVi
                                    ? "Mở · Rút tiếp →"
                                    : "Open · Active →"
                                  : isVi
                                  ? "Xem luận giải →"
                                  : "Review →"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[9px] font-mono text-slate-300 mt-auto">
                            {isToday ? (isVi ? "Chưa trải bài" : "No draw yet") : "—"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                  <span>{isVi ? "Hôm nay (có thể rút tối đa 10 lá)" : "Today (up to 10 cards)"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 border border-emerald-400 inline-block" />
                  <span>{isVi ? "Ngày cũ (chỉ xem lại luận giải)" : "Past Day (read-only archive)"}</span>
                </span>
              </div>
              <span>
                {isVi
                  ? "Nhấn vào ngày có phiên để chuyển thẳng tới Bàn Trải Bài"
                  : "Click any active date to open its Reading Workbench"}
              </span>
            </div>
          </div>

          {/* Right: Selected Date Sessions & Monthly List (4 cols) */}
          <aside className="lg:col-span-4 p-6 bg-[#F8FAFC] flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Selected Date Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                    {selectedDateKey === todayKey
                      ? isVi
                        ? "PHIÊN TRẢI BÀI HÔM NAY"
                        : "TODAY'S SESSION"
                      : isVi
                      ? `PHIÊN NGÀY ${selectedDateKey}`
                      : `SESSIONS ON ${selectedDateKey}`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedDaySessions.length} {isVi ? "phiên" : "found"}
                  </span>
                </div>

                {selectedDaySessions.length === 0 ? (
                  <div className="p-5 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-2.5">
                    <span className="material-symbols-outlined text-2xl text-slate-300">event_note</span>
                    <p className="text-xs text-slate-500">
                      {selectedDateKey === todayKey
                        ? isVi
                          ? "Hôm nay bạn chưa thực hiện phiên trải bài nào."
                          : "You have not drawn a reading session today yet."
                        : isVi
                        ? "Không có phiên trải bài nào được lưu vào ngày này."
                        : "No reading sessions archived on this date."}
                    </p>
                    {selectedDateKey === todayKey && (
                      <Link
                        href="/"
                        className="inline-block px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-xs transition-colors"
                      >
                        {isVi ? "Về Trang Chủ Lật Bài Hôm Nay →" : "Go Flip Today's Card →"}
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDaySessions.map((s) => {
                      const cardNames = (s.drawnCards || [])
                        .map((dc) => (isVi ? dc.card?.nameVi : dc.card?.nameEn))
                        .filter(Boolean);
                      const isSessionToday = toLocalDateKey(s.createdAt) === todayKey;
                      const summaryText = cleanAiText(s.aiInterpretation || s.aiSynthesisResult || "");

                      return (
                        <Link
                          key={s.id}
                          href={`/workbench/${s.id}`}
                          className="block p-4 bg-white border border-outline-variant hover:border-primary rounded-xl shadow-2xs transition-all group"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                            <span className="text-slate-400">#{s.id.slice(0, 8).toUpperCase()}</span>
                            <span
                              className={`px-2 py-0.5 rounded font-semibold ${
                                isSessionToday
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {s.drawnCards?.length || 0}/{MAX_TOTAL_CARDS} {isVi ? "lá" : "cards"}
                            </span>
                          </div>
                          <h3 className="font-headline font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">
                            {s.question && s.question !== "Daily Energetic Guidance & Reflection"
                              ? s.question
                              : (isVi ? s.spreadNameVi : s.spreadNameEn) || "Tarot Reading"}
                          </h3>
                          {summaryText && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {summaryText}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {cardNames.slice(0, 4).map((name, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-[#FAF9F6] border border-outline-variant text-slate-600 rounded text-[10px] font-mono"
                              >
                                {name}
                              </span>
                            ))}
                            {cardNames.length > 4 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                                +{cardNames.length - 4}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-primary font-semibold">
                            <span>
                              {isSessionToday
                                ? isVi
                                  ? "Mở Workbench để rút thêm lá →"
                                  : "Open Workbench to continue →"
                                : isVi
                                ? "Mở lại luận giải trên Workbench →"
                                : "View past interpretation →"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monthly Archive Quick Links */}
              <div className="pt-4 border-t border-outline-variant space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                    {isVi ? `TẤT CẢ PHIÊN TRONG THÁNG (${monthSessions.length})` : `ALL THIS MONTH (${monthSessions.length})`}
                  </span>
                </div>

                {monthSessions.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {isVi ? "Chưa có phiên nào trong tháng này." : "No sessions recorded in this month."}
                  </p>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {monthSessions.map((s) => {
                      const dKey = toLocalDateKey(s.createdAt);
                      const isTodayItem = dKey === todayKey;
                      const firstCards = (s.drawnCards || [])
                        .map((dc) => (isVi ? dc.card?.nameVi : dc.card?.nameEn))
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(", ");
                      return (
                        <Link
                          key={s.id}
                          href={`/workbench/${s.id}`}
                          className="flex items-center justify-between p-2.5 bg-white border border-outline-variant hover:border-primary rounded-lg text-xs transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-mono text-[10px] text-slate-400">
                              {new Date(s.createdAt).toLocaleDateString(isVi ? "vi-VN" : "en-US")}
                            </div>
                            <div className="font-medium text-slate-800 truncate">
                              {firstCards || (isVi ? s.spreadNameVi : s.spreadNameEn) || "Tarot"}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              isTodayItem ? "bg-emerald-50 text-primary" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {s.drawnCards?.length || 0} {isVi ? "lá" : "c"} →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
