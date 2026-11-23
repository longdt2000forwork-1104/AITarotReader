const DAILY_REWARD_CACHE_PREFIX = "ai_tarot_daily_reward_claimed_";

export function getVietnamDateKey(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}

export function isDailyRewardClaimedToday(userId?: string | null): boolean {
  if (typeof window === "undefined" || !userId) return false;
  try {
    const key = `${DAILY_REWARD_CACHE_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const todayKey = getVietnamDateKey();
    if (raw === todayKey) return true;
    localStorage.removeItem(key);
    return false;
  } catch {
    return false;
  }
}

export function markDailyRewardClaimedToday(userId?: string | null): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${DAILY_REWARD_CACHE_PREFIX}${userId}`, getVietnamDateKey());
  } catch {
    // ignore storage errors
  }
}

export function clearDailyRewardCache(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      localStorage.removeItem(`${DAILY_REWARD_CACHE_PREFIX}${userId}`);
      return;
    }
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DAILY_REWARD_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore storage errors
  }
}
