"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en, TranslationDict } from "@/locales/en";
import { vi } from "@/locales/vi";

type Locale = "en" | "vi";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDict;
}

const translations: Record<Locale, TranslationDict> = {
  en,
  vi,
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "vi",
  setLocale: () => {},
  t: vi,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("ai_tarot_locale") as Locale | null;
    if (saved && (saved === "en" || saved === "vi")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("ai_tarot_locale", newLocale);
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: translations[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

