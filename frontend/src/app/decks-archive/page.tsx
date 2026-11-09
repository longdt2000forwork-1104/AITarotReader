"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { TarotDeck } from "@/types/api";

export default function DecksArchivePage() {
  const { locale, t } = useLanguage();
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
        console.error("Failed to load decks archive data:", err);
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
        const currentDeck = decks.find((d) => d.id === deckId);
        const deckName = isVi ? (currentDeck?.nameVi || currentDeck?.nameEn) : currentDeck?.nameEn;
        setToastMessage(isVi ? `Đã kích hoạt bộ bài ${deckName} làm bộ bài mặc định!` : `Activated ${deckName} as primary deck!`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error("Failed to switch active deck:", err);
    } finally {
      setActivatingId(null);
    }
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];

  return (
    <>
      <EditorialHeader activeTab="decks" />

      {/* WEB — CURATED DECK EDITIONS & 78-CARD CONTACT SHEET (SCR-W06) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-mono font-medium px-4 py-2.5 text-center flex items-center justify-center gap-2 animate-fadeIn shadow-sm">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Strip */}
        <section className="p-6 lg:p-8 bg-[#FAF9F6] border-b border-outline-variant">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                {t.decks.kicker}
              </span>
              <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
                {t.decks.title}
              </h1>
              <p className="font-body text-xs text-[#475569] mt-1 max-w-2xl">
                {t.decks.desc}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-600 bg-white border border-outline-variant px-3 py-1.5 rounded-lg shadow-2xs">
                {isVi ? "Bộ bài đang dùng: " : "Active Deck: "}
                <strong className="text-primary font-bold">
                  {activeDeck ? (isVi ? activeDeck.nameVi : activeDeck.nameEn) : "RWS 1909"}
                </strong>
              </span>
              <Link
                href="/catalog-picker"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-colors"
              >
                {t.decks.viewContact}
              </Link>
            </div>
          </div>
        </section>

        {/* 5-Deck Style Comparison Strip for Single Card (XVII The Star) */}
        <section className="p-6 bg-white border-b border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              {isVi
                ? "ĐỐI CHIẾU THẨM MỸ 5 BỘ BÀI · XVII THE STAR (NGÔI SAO)"
                : "CROSS-EDITION VISUAL COMPARISON · XVII THE STAR"}
            </span>
            <span className="text-[11px] font-mono text-primary font-semibold">
              {isVi ? "5 PHONG CÁCH NGHỆ THUẬT LƯU TRỮ" : "COMPARE ALL 5 ART EDITIONS"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {decks.map((deck) => {
              const isActive = deck.id === activeDeckId;
              const isActivating = activatingId === deck.id;
              const deckName = isVi ? deck.nameVi : deck.nameEn;
              const tierBadge = deck.unlockTier === "FREE" 
                ? (isVi ? "CHUẨN MỰC" : "CANONICAL") 
                : deck.unlockTier === "PRO" 
                ? "PRO" 
                : "MASTER";

              return (
                <div
                  key={deck.id}
                  onClick={() => handleSelectDeck(deck.id)}
                  className={`border rounded-lg p-3 flex flex-col justify-between transition-all cursor-pointer group ${
                    isActive
                      ? "bg-emerald-50/40 border-primary shadow-xs ring-1 ring-primary"
                      : "bg-[#FAF9F6] border-outline-variant hover:border-slate-400"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 pb-1 border-b border-slate-200">
                      <span className="font-bold text-slate-600">{deck.id}</span>
                      <span className={isActive ? "text-primary font-bold" : "text-slate-500"}>
                        {isActive ? (isVi ? "ĐANG DÙNG" : "ACTIVE") : tierBadge}
                      </span>
                    </div>
                    <div className="w-full aspect-[2/3] bg-white border border-slate-200 rounded overflow-hidden flex flex-col items-center justify-center relative group-hover:shadow-sm">
                      {deck.id === "ED-01" ? (
                        <img
                          src="/decks/rider-waite-1909/cards/17_the_star.webp"
                          alt="XVII The Star - Rider-Waite-Smith 1909"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="p-3 text-center flex flex-col items-center">
                          <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">
                            {deck.id === "ED-02" ? "spa" : deck.id === "ED-03" ? "polyline" : deck.id === "ED-04" ? "castle" : "brush"}
                          </span>
                          <span className="text-[10px] font-headline font-bold text-on-surface mt-2 text-center">
                            XVII THE STAR
                          </span>
                          <span className="text-[8px] font-mono text-slate-400 mt-1">
                            {deck.id}
                          </span>
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[11px] shadow-sm">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <div className="font-headline font-bold text-xs text-on-surface truncate">{deckName}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5 flex justify-between items-center">
                      <span>{deck.cardCount} {isVi ? "Lá" : "Cards"}</span>
                      <button
                        type="button"
                        disabled={isActivating || isActive}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDeck(deck.id);
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isActivating ? "..." : isActive ? (isVi ? "Đang Chọn" : "Active") : (isVi ? "Chọn" : "Select")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5 Decks Selection Table */}
        <section className="p-6 bg-[#FAF9F6]">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-4">
            {isVi
              ? "DANH SÁCH 5 BỘ BÀI LƯU TRỮ CHUẨN MỰC (DỮ LIỆU TỪ SUPABASE)"
              : "CURATED ARCHIVAL DECK EDITIONS (SUPABASE DATABASE)"}
          </span>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              {isVi ? "Đang tải kho bài lưu trữ..." : "Loading deck catalog..."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck) => {
                const isActive = deck.id === activeDeckId;
                const isActivating = activatingId === deck.id;
                const deckName = isVi ? deck.nameVi : deck.nameEn;
                const desc = isVi ? deck.descriptionVi : deck.descriptionEn;

                return (
                  <div
                    key={deck.id}
                    className={`p-5 rounded-lg space-y-3 transition-colors ${
                      isActive
                        ? "bg-white border-2 border-primary shadow-xs"
                        : "bg-white border border-outline-variant hover:border-slate-400"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] font-semibold text-primary">{deck.id}</span>
                        <h3 className="font-headline font-bold text-base text-on-surface">{deckName}</h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isVi ? "Họa sĩ: " : "Artist: "}{deck.artist}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                        {isActive ? (isVi ? "ĐANG DÙNG" : "ACTIVE") : `${deck.cardCount} ${isVi ? "LÁ" : "CARDS"}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                      {desc}
                    </p>
                    <div className="pt-3 border-t border-outline-variant flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-slate-500">
                        {deck.unlockTier === "FREE"
                          ? (isVi ? "MIỄN PHÍ" : "FREE TIER")
                          : `${deck.creditCost} CR`}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href="/catalog-picker" className="text-slate-600 hover:text-primary font-medium text-xs">
                          {isVi ? "Khám Phá →" : "Inspect →"}
                        </Link>
                        <button
                          type="button"
                          disabled={isActivating || isActive}
                          onClick={() => handleSelectDeck(deck.id)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 cursor-default"
                              : "bg-primary text-white hover:bg-primary-hover"
                          }`}
                        >
                          {isActivating ? "..." : isActive ? (isVi ? "Đã Chọn ✓" : "Active ✓") : (isVi ? "Chọn Bộ Này" : "Select Deck")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
