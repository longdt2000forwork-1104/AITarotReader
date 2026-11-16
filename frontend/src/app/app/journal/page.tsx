"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
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

export default function MobileCalendarJournalPage() {
  const { locale, setLocale } = useLanguage();
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
          const todayMatch = validSessions.find((s) => toLocalDateKey(s.createdAt) === todayKey);
          const initialSession = todayMatch || validSessions[0];
          const initKey = toLocalDateKey(initialSession.createdAt);
          if (initKey) {
            setSelectedDateKey(initKey);
            const initDate = new Date(initialSession.createdAt);
            setCurrentMonth(new Date(initDate.getFullYear(), initDate.getMonth(), 1));
          }
        }
      } catch (err) {
        console.error("Failed to load mobile calendar journal:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistorySessions();
  }, [todayKey]);

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

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmptyDays = (firstDayOfMonth.getDay() + 6) % 7;

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

  const activeDaysInMonthCount = useMemo(() => {
    return Object.keys(sessionsByDate).filter((k) => k.startsWith(monthPrefix)).length;
  }, [sessionsByDate, monthPrefix]);

  const monthSessions = useMemo(() => {
    return sessions.filter((s) => toLocalDateKey(s.createdAt).startsWith(monthPrefix));
  }, [sessions, monthPrefix]);

  const selectedDaySessions = sessionsByDate[selectedDateKey] || [];

  const handleDateCellClick = (dateKey: string, daySessions: ReadingSessionDto[]) => {
    setSelectedDateKey(dateKey);
    if (daySessions.length === 1) {
      router.push(`/app/readings/${daySessions[0].id}`);
    }
  };

  const weekdayHeaders = isVi
    ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    : ["M", "T", "W", "T", "F", "S", "S"];

  const monthTitle = currentMonth.toLocaleDateString(isVi ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#FAF9F6] flex flex-col border-x border-outline-variant pb-24">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{isVi ? "Thánh Địa" : "Sanctuary"}</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface uppercase">
          {isVi ? "NHẬT KÝ LỊCH NGÀY" : "CALENDAR JOURNAL"}
        </span>

        {/* Language Switcher */}
        <div className="flex items-center border border-outline-variant rounded text-[10px] font-mono overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-2 py-0.5 transition-colors ${
              !isVi ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-on-surface"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("vi")}
            className={`px-2 py-0.5 transition-colors ${
              isVi ? "bg-primary text-white font-bold" : "text-slate-500 hover:text-on-surface"
            }`}
          >
            VI
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* 2 Compact KPI Cards (No Elemental Ratio) */}
        <section className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-white border border-outline-variant rounded-xl shadow-2xs space-y-1">
            <span className="font-mono text-[9px] uppercase text-slate-400 block">
              {isVi ? "TỔNG PHIÊN ĐÃ LƯU" : "SAVED SESSIONS"}
            </span>
            <div className="font-headline font-bold text-lg text-on-surface">
              {sessions.length} {isVi ? "Phiên" : "Total"}
            </div>
            <div className="text-[10px] font-mono text-primary">
              {activeDaysInMonthCount} {isVi ? "ngày tháng này" : "days this month"}
            </div>
          </div>

          <div className="p-3 bg-white border border-outline-variant rounded-xl shadow-2xs space-y-1">
            <span className="font-mono text-[9px] uppercase text-slate-400 block">
              {isVi ? "LÁ BÀI CHỦ ĐẠO" : "FREQUENT CARD"}
            </span>
            <div className="font-headline font-bold text-sm text-primary truncate">
              {recurringCardStat?.name || (isVi ? "XIX Mặt Trời" : "XIX The Sun")}
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {isVi
                ? `Xuất hiện ${recurringCardStat?.count || 1} lần`
                : `Drawn ${recurringCardStat?.count || 1} times`}
            </div>
          </div>
        </section>

        {/* Monthly Calendar Grid */}
        <section className="bg-white border border-outline-variant rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold block">
                {isVi ? "CHỌN NGÀY ĐỂ MỞ LẠI" : "TAP A DATE TO OPEN"}
              </span>
              <h1 className="font-headline font-bold text-base text-on-surface capitalize">
                {monthTitle}
              </h1>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-1.5 border border-outline-variant rounded-lg hover:bg-slate-50 text-slate-600"
                title={isVi ? "Tháng trước" : "Previous month"}
              >
                <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelectedDateKey(toLocalDateKey(now));
                }}
                className="px-2 py-1 border border-outline-variant rounded-lg hover:border-primary hover:text-primary text-[10px] font-mono font-semibold text-slate-700"
              >
                {isVi ? "Hôm Nay" : "Today"}
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-1.5 border border-outline-variant rounded-lg hover:bg-slate-50 text-slate-600"
                title={isVi ? "Tháng sau" : "Next month"}
              >
                <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[11px] font-mono text-slate-500">
                {isVi ? "Đang tải lịch trải bài từ Supabase..." : "Loading calendar archive..."}
              </p>
            </div>
          ) : (
            <div className="border border-outline-variant rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-[#FAF9F6] border-b border-outline-variant">
                {weekdayHeaders.map((day, idx) => (
                  <div
                    key={idx}
                    className="py-2 text-center font-mono text-[10px] font-semibold text-slate-500 border-r last:border-r-0 border-outline-variant"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((cell) => {
                  if (!cell.date || cell.dayNumber === null) {
                    return (
                      <div
                        key={cell.dateKey}
                        className="h-14 bg-[#FAF9F6]/60 border-b border-r last:border-r-0 border-outline-variant"
                      />
                    );
                  }

                  const daySessions = sessionsByDate[cell.dateKey] || [];
                  const hasSessions = daySessions.length > 0;
                  const isToday = cell.dateKey === todayKey;
                  const isSelected = cell.dateKey === selectedDateKey;
                  const totalCards = daySessions[0]?.drawnCards?.length || 0;

                  return (
                    <button
                      type="button"
                      key={cell.dateKey}
                      onClick={() => handleDateCellClick(cell.dateKey, daySessions)}
                      className={`h-14 p-1 border-b border-r border-outline-variant flex flex-col items-center justify-between transition-all ${
                        hasSessions
                          ? "bg-emerald-50/40 hover:bg-emerald-100/60"
                          : "bg-white hover:bg-slate-50"
                      } ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold ${
                          isToday
                            ? "bg-primary text-white"
                            : hasSessions
                            ? "bg-emerald-100 text-emerald-900"
                            : "text-slate-600"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {hasSessions ? (
                        <span
                          className={`text-[8px] font-mono px-1 rounded font-bold leading-tight ${
                            isToday ? "bg-emerald-600 text-white" : "text-primary"
                          }`}
                        >
                          {daySessions.length > 1
                            ? `${daySessions.length}p`
                            : `${totalCards}/${MAX_TOTAL_CARDS}`}
                        </span>
                      ) : (
                        <span className="h-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              {isVi ? "Hôm nay (rút tối đa 10 lá)" : "Today (up to 10 cards)"}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-200 border border-emerald-400 inline-block" />
              {isVi ? "Ngày cũ (chỉ xem)" : "Past (read-only)"}
            </span>
          </div>
        </section>

        {/* Selected Date Detail List */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
              {selectedDateKey === todayKey
                ? isVi
                  ? "PHIÊN TRẢI BÀI HÔM NAY"
                  : "TODAY'S READING"
                : isVi
                ? `PHIÊN NGÀY ${selectedDateKey}`
                : `SESSIONS ON ${selectedDateKey}`}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {selectedDaySessions.length} {isVi ? "phiên" : "sessions"}
            </span>
          </div>

          {selectedDaySessions.length === 0 ? (
            <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-2.5">
              <p className="text-xs text-slate-500">
                {selectedDateKey === todayKey
                  ? isVi
                    ? "Hôm nay bạn chưa rút bài trong phiên mới."
                    : "You haven't created a reading session today."
                  : isVi
                  ? "Không có phiên trải bài nào vào ngày này."
                  : "No reading sessions archived on this date."}
              </p>
              {selectedDateKey === todayKey && (
                <Link
                  href="/app/home"
                  className="inline-block px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-xs"
                >
                  {isVi ? "Về Trang Chủ Lật Bài Hôm Nay →" : "Flip Today's Card →"}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDaySessions.map((s) => {
                const isSessionToday = toLocalDateKey(s.createdAt) === todayKey;
                const cardNames = (s.drawnCards || [])
                  .map((dc) => (isVi ? dc.card?.nameVi : dc.card?.nameEn))
                  .filter(Boolean);
                const summaryText = cleanAiText(s.aiInterpretation || s.aiSynthesisResult || "");

                return (
                  <Link
                    key={s.id}
                    href={`/app/readings/${s.id}`}
                    className="block p-3.5 bg-white border border-outline-variant hover:border-primary rounded-xl shadow-2xs space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">#{s.id.slice(0, 8).toUpperCase()}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          isSessionToday ? "bg-emerald-50 text-primary" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.drawnCards?.length || 0}/{MAX_TOTAL_CARDS} {isVi ? "lá" : "cards"}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-sm text-slate-900">
                      {s.question && s.question !== "Daily Energetic Guidance & Reflection"
                        ? s.question
                        : (isVi ? s.spreadNameVi : s.spreadNameEn) || "Tarot Reading"}
                    </h3>
                    {summaryText && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{summaryText}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {cardNames.slice(0, 4).map((name, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-[#FAF9F6] border border-outline-variant text-slate-600 rounded text-[10px] font-mono"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 text-[11px] font-mono font-semibold text-primary">
                      {isSessionToday
                        ? isVi
                          ? "Mở phiên hôm nay để rút thêm lá →"
                          : "Open today's reading →"
                        : isVi
                        ? "Xem lại luận giải ngày cũ →"
                        : "Review past interpretation →"}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* All Month Quick List */}
        {monthSessions.length > 0 && (
          <section className="pt-2 border-t border-outline-variant space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-semibold block">
              {isVi ? `CÁC PHIÊN TRONG THÁNG (${monthSessions.length})` : `THIS MONTH (${monthSessions.length})`}
            </span>
            <div className="space-y-2">
              {monthSessions.map((s) => {
                const isTodayItem = toLocalDateKey(s.createdAt) === todayKey;
                const firstCards = (s.drawnCards || [])
                  .map((dc) => (isVi ? dc.card?.nameVi : dc.card?.nameEn))
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(", ");
                return (
                  <Link
                    key={s.id}
                    href={`/app/readings/${s.id}`}
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
          </section>
        )}
      </main>

      <MobileBottomNav activeTab="journal" />
    </div>
  );
}
