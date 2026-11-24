/**
 * Helpers to format and compare reading session dates against the local calendar day.
 */

export function toLocalDateKey(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameLocalDay(dateString?: string, referenceDate: Date = new Date()): boolean {
  if (!dateString) return false;
  const sessionKey = toLocalDateKey(dateString);
  const referenceKey = toLocalDateKey(referenceDate);
  return Boolean(sessionKey && referenceKey && sessionKey === referenceKey);
}

export function isSessionActiveToday(
  session?: { createdAt?: string; isTodaySession?: boolean } | null,
  todayKey: string = toLocalDateKey(new Date())
): boolean {
  if (!session?.createdAt) return false;
  const localMatch = toLocalDateKey(session.createdAt) === todayKey;
  if (typeof session.isTodaySession === "boolean") {
    return session.isTodaySession && localMatch;
  }
  return localMatch;
}
