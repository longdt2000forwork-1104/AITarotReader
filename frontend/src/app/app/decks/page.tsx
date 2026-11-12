"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { TarotDeck } from "@/types/api";

export default function MobileDecksGalleryPage() {
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [decks, setDecks] = useState<TarotDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string>("ED-01");
  const [loading, setLoading] = useState<boolean>(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDecksAndProfile() {
      try {
        setLoading(true);
        const [decksRes, profileRes] = await Promise.all([
          apiClient.tarot.getDecks(),
          apiClient.profile.getMysticProfile()
        ]);
        if (decksRes.data && Array.isArray(decksRes.data)) {
          setDecks(decksRes.data);
        }
        if (profileRes.data?.preferredDeckId) {
          setActiveDeckId(profileRes.data.preferredDeckId);
        }
      } catch (err) {
        console.error("Failed to load mobile decks data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDecksAndProfile();
  }, []);

  const handleSelectDeck = async (deckId: string) => {
    if (deckId === activeDeckId || activatingId) return;
    setActivatingId(deckId);
    try {
      const res = await apiClient.profile.updateMysticProfile({ preferredDeckId: deckId });
      if (res.code === 200 || res.data) {
        setActiveDeckId(deckId);
        const target = decks.find((d) => d.id === deckId);
        const name = isVi ? (target?.nameVi || target?.nameEn) : target?.nameEn;
        setToastMessage(isVi ? `Đã đổi sang bộ bài ${name}!` : `Switched to ${name}!`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to switch mobile deck:", err);
    } finally {
      setActivatingId(null);
    }
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const otherDecks = decks.filter((d) => d.id !== (activeDeck?.id || "ED-01"));

  const getDeckIcon = (deckId: string) => {
    switch (deckId) {
      case "ED-02": return "spa";
      case "ED-03": return "polyline";
      case "ED-04": return "castle";
      case "ED-05": return "brush";
      default: return "auto_awesome";
    }
  };

  return (
    <div className="w-full max-w-[430px] sm:max-w-md mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20 overflow-x-hidden">
      {/* Top Header */}
      <header className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40 w-full gap-2">
        <Link href="/app/home" className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 -ml-1.5 sm:-ml-2 rounded-lg hover:bg-slate-100 text-xs text-slate-600 hover:text-on-surface font-medium transition-colors shrink-0">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>{isVi ? "Thánh Địa" : "Sanctuary"}</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface truncate text-center min-w-0 flex-1">
          {isVi ? "5 PHIÊN BẢN BỘ BÀI" : "5 DECK EDITIONS"}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-mono font-medium px-4 py-2 text-center flex items-center justify-center gap-2 animate-fadeIn shadow-sm">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {loading ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-7 h-7 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs text-slate-500">
              {isVi ? "Đang tải dữ liệu từ Supabase..." : "Loading editions from Supabase..."}
            </span>
          </div>
        ) : (
          <>
            {/* Active Hero Deck */}
            {activeDeck && (
              <div className="bg-white border-2 border-primary rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-100 pb-2">
                  <span className="text-primary font-bold">
                    {isVi ? `LỰA CHỌN HIỆN TẠI · ${activeDeck.id}` : `ACTIVE SELECTION · ${activeDeck.id}`}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    {isVi ? "ĐANG DÙNG" : "IN USE"}
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-20 h-28 bg-[#FAF9F6] border border-amber-200 rounded flex flex-col items-center justify-center shadow-inner overflow-hidden relative">
                    {activeDeck.id === "ED-01" ? (
                      <img
                        src="/decks/rider-waite-1909/cards/19_the_sun.webp"
                        alt="RWS 1909"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-3xl text-emerald-600">
                          {getDeckIcon(activeDeck.id)}
                        </span>
                        <span className="text-[8px] font-mono text-emerald-700 font-bold mt-1 text-center px-1">
                          {activeDeck.id}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h2 className="font-headline font-bold text-base text-on-surface">
                      {isVi ? activeDeck.nameVi : activeDeck.nameEn}
                    </h2>
                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                      {isVi ? activeDeck.descriptionVi : activeDeck.descriptionEn}
                    </p>
                    <div className="text-[10px] font-mono text-emerald-700 font-semibold pt-1">
                      {isVi ? `Đã Kiểm Định ${activeDeck.cardCount} Bản Khắc · ${activeDeck.artist}` : `${activeDeck.cardCount} Plates Verified · ${activeDeck.artist}`}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <Link
                    href="/catalog-picker"
                    className="flex-1 py-2 text-center text-xs font-medium border border-outline-variant rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {isVi ? `Xem ${activeDeck.cardCount} Bản Khắc` : `Browse ${activeDeck.cardCount} Plates`}
                  </Link>
                  <button
                    disabled
                    className="flex-1 py-2 text-center text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-lg cursor-default"
                  >
                    {isVi ? "Đang Hoạt Động ✓" : "Active ✓"}
                  </button>
                </div>
              </div>
            )}

            {/* Other 4 Editions */}
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                {isVi ? "CÁC PHIÊN BẢN KHẢ DỤNG (TÙY Ý CHUYỂN ĐỔI)" : "AVAILABLE EDITIONS (SWITCH FREELY)"}
              </span>

              {otherDecks.map((deck) => {
                const isActivating = activatingId === deck.id;
                const deckName = isVi ? deck.nameVi : deck.nameEn;
                const deckDesc = isVi ? deck.descriptionVi : deck.descriptionEn;
                const tierText = deck.unlockTier === "FREE"
                  ? (isVi ? "MẶC ĐỊNH · MIỄN PHÍ" : "DEFAULT · FREE")
                  : (isVi ? `BẢN PRO (${deck.creditCost} CR)` : `PRO (${deck.creditCost} CR)`);

                return (
                  <div
                    key={deck.id}
                    className="p-4 bg-white border border-outline-variant rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-16 bg-[#FAF9F6] border border-slate-200 rounded shrink-0 flex items-center justify-center overflow-hidden">
                        {deck.id === "ED-01" ? (
                          <img
                            src="/decks/rider-waite-1909/cards/00_the_fool.webp"
                            alt="RWS 1909"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-xl text-slate-500">
                            {getDeckIcon(deck.id)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 max-w-[210px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-primary font-semibold">{deck.id}</span>
                          <h3 className="font-headline font-bold text-sm text-on-surface truncate">{deckName}</h3>
                        </div>
                        <p className="text-[11px] text-[#475569] line-clamp-1">{deckDesc}</p>
                        <span className="text-[10px] font-mono text-slate-400 block">{tierText}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isActivating}
                      onClick={() => handleSelectDeck(deck.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-primary text-white hover:bg-primary-hover rounded-lg transition-colors shrink-0 disabled:opacity-50"
                    >
                      {isActivating ? "..." : (isVi ? "Chọn" : "Switch")}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <MobileBottomNav activeTab="decks" />
    </div>
  );
}
