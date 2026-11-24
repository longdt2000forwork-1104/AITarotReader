"use client";

import { useEffect, useState } from "react";
import { toLocalDateKey } from "@/utils/sessionDate";

/**
 * Tracks the user's current local calendar date (YYYY-MM-DD) so open screens
 * automatically lock past-day AI Q&A and clarifier actions after midnight.
 */
export function useCurrentDayKey(): string {
  const [dayKey, setDayKey] = useState<string>(() => toLocalDateKey(new Date()));

  useEffect(() => {
    const syncDayKey = () => {
      const nextKey = toLocalDateKey(new Date());
      setDayKey((prev) => (prev === nextKey ? prev : nextKey));
    };

    syncDayKey();
    const intervalId = window.setInterval(syncDayKey, 30_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncDayKey();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return dayKey;
}
