"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { MysticProfileDto, WalletBalanceDto } from "@/types/api";

export default function MobileSeekerProfilePage() {
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MysticProfileDto | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);

  const [allowAiContext, setAllowAiContext] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState("ED-02");
  const [birthZodiac, setBirthZodiac] = useState("Aries");
  const [birthDate, setBirthDate] = useState("1998-04-12");

  const [credits, setCredits] = useState(45);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileAndWallet() {
      try {
        setLoading(true);
        const [profRes, walRes] = await Promise.all([
          apiClient.profile.getMysticProfile(),
          apiClient.wallet.getBalance()
        ]);
        if (profRes.data) {
          setProfile(profRes.data);
          if (profRes.data.preferredDeckId) setSelectedDeck(profRes.data.preferredDeckId);
          if (profRes.data.birthZodiac || profRes.data.zodiacSign) {
            setBirthZodiac(profRes.data.birthZodiac || profRes.data.zodiacSign || "Aries");
          }
          if (profRes.data.birthDate) setBirthDate(profRes.data.birthDate);
          if (typeof profRes.data.allowAiContext === "boolean") {
            setAllowAiContext(profRes.data.allowAiContext);
          }
        }
        if (walRes.data) {
          setWallet(walRes.data);
          setCredits(walRes.data.balance);
        }
      } catch (err) {
        console.error("Failed to load mobile profile & wallet:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndWallet();
  }, []);

  const handleClaimDaily = async () => {
    if (claimedDaily) return;
    try {
      const res = await apiClient.wallet.claimDailyReward();
      if (res.code === 200 && res.data) {
        setCredits(res.data.balance);
        setClaimedDaily(true);
        setToastMessage(isVi ? "+10 CR Phước lành buổi sớm đã nhận!" : "+10 CR Daily Blessing claimed!");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error claiming daily reward:", err);
    }
  };

  const handleSaveChanges = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await apiClient.profile.updateMysticProfile({
        preferredDeckId: selectedDeck,
        birthZodiac: birthZodiac,
        zodiacSign: birthZodiac,
        birthDate: birthDate,
        allowAiContext: allowAiContext,
        locale: locale,
        aiContextNotes: allowAiContext
          ? "Harmonize readings with natal birth zodiac decans and active archival deck."
          : "Standard objective card analysis without astrological bias."
      });
      if (res.code === 200 || res.data) {
        if (res.data) setProfile(res.data);
        setToastMessage(isVi ? "Đã lưu hồ sơ & thiết lập vào Supabase!" : "Settings saved to Supabase!");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error saving mobile profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const zodiacOptions = [
    { code: "Aries", vi: "Bạch Dương", symbol: "♈", cardVi: "IV Hoàng Đế", cardEn: "IV The Emperor" },
    { code: "Taurus", vi: "Kim Ngưu", symbol: "♉", cardVi: "V Giáo Hoàng", cardEn: "V The Hierophant" },
    { code: "Gemini", vi: "Song Tử", symbol: "♊", cardVi: "VI Người Tình", cardEn: "VI The Lovers" },
    { code: "Cancer", vi: "Cự Giải", symbol: "♋", cardVi: "VII Cỗ Xe", cardEn: "VII The Chariot" },
    { code: "Leo", vi: "Sư Tử", symbol: "♌", cardVi: "VIII Sức Mạnh", cardEn: "VIII Strength" },
    { code: "Virgo", vi: "Xử Nữ", symbol: "♍", cardVi: "IX Ẩn Sĩ", cardEn: "IX The Hermit" },
    { code: "Libra", vi: "Thiên Bình", symbol: "♎", cardVi: "XI Công Lý", cardEn: "XI Justice" },
    { code: "Scorpio", vi: "Bọ Cạp", symbol: "♏", cardVi: "XIII Tử Thần", cardEn: "XIII Death" },
    { code: "Sagittarius", vi: "Nhân Mã", symbol: "♐", cardVi: "XIV Tiết Chế", cardEn: "XIV Temperance" },
    { code: "Capricorn", vi: "Ma Kết", symbol: "♑", cardVi: "XV Ác Quỷ", cardEn: "XV The Devil" },
    { code: "Aquarius", vi: "Bảo Bình", symbol: "♒", cardVi: "XVII Ngôi Sao", cardEn: "XVII The Star" },
    { code: "Pisces", vi: "Song Ngư", symbol: "♓", cardVi: "XVIII Mặt Trăng", cardEn: "XVIII The Moon" },
  ];

  const currentZodiac = zodiacOptions.find((z) => z.code === birthZodiac) || zodiacOptions[0];

  const deckOptions = [
    { id: "ED-01", name: "Rider-Waite-Smith 1909", badge: isVi ? "KINH ĐIỂN" : "CANONICAL" },
    { id: "ED-02", name: "Sunlit Botanical Herbarium", badge: isVi ? "THẢO MỘC" : "BOTANICAL" },
    { id: "ED-03", name: "Swiss Geometric Construct", badge: "PRO" },
    { id: "ED-04", name: "Marseille 1760 Heritage", badge: "PRO" },
    { id: "ED-05", name: "Kyoto Sumi-e Ink Wash", badge: "PRO" },
  ];

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <main className="w-full max-w-[412px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-28 border-x border-[#E2E8F0] shadow-sm">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-mono font-medium px-4 py-2 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Status Bar */}
        <header className="w-full pt-3 px-6 pb-2 flex justify-between items-center text-slate-800 select-none bg-white">
          <span className="font-mono text-xs font-bold">09:41</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="material-symbols-outlined text-[16px]">signal_cellular_4_bar</span>
            <span className="material-symbols-outlined text-[16px]">wifi</span>
            <span className="material-symbols-outlined text-[18px]">battery_full</span>
          </div>
        </header>

        {/* 2. Top Title Bar with Save */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#E2E8F0] bg-white sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary text-xl">person</span>
            <h1 className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">
              {isVi ? "Hồ Sơ & Thiết Lập" : "Seeker Profile"}
            </h1>
          </div>
          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSaveChanges}
            className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>{saving ? (isVi ? "Đang lưu..." : "Saving...") : "Save"}</span>
          </button>
        </div>

        {/* 3. Seeker Identity Card */}
        <div className="p-4 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-14 h-14 rounded-full border-2 border-primary bg-slate-50 flex items-center justify-center shrink-0">
              <span className="font-headline font-bold text-lg text-primary">
                {currentZodiac.code.slice(0, 2).toUpperCase()}
              </span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                <span className="material-symbols-outlined text-[12px]">spa</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-bold text-base text-slate-900 truncate">
                  {isVi ? "Người Tìm Kiếm" : "Seeker of Truth"}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-[9px] uppercase font-bold">
                  {wallet?.tier === "PRO" ? (isVi ? "HỘI VIÊN PRO" : "ARCHIVAL PRO") : (isVi ? "TIÊU CHUẨN" : "STANDARD")}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">seeker@aitarotreader.com</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-primary font-medium">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                <span>{isVi ? "Đã Xác Thực Supabase" : "Supabase PostgreSQL Verified"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Settings Sections */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-xs font-mono text-slate-500">
                {isVi ? "Đang đồng bộ dữ liệu..." : "Synchronizing..."}
              </span>
            </div>
          ) : (
            <>
              {/* Section 01: Mystic Blueprint & Natal Calibration */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "01. BẢN ĐỒ NGÀY SINH & CHIÊM TINH" : "01. MYSTIC BLUEPRINT"}
                  </span>
                </div>

                {/* Editable Birth Date & Zodiac */}
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {isVi ? "Ngày Sinh" : "Birth Date"}
                    </span>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded"
                    />
                  </div>

                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {isVi ? "Cung Hoàng Đạo" : "Sun Sign"}
                    </span>
                    <select
                      value={birthZodiac}
                      onChange={(e) => setBirthZodiac(e.target.value)}
                      className="text-xs font-mono font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-900"
                    >
                      {zodiacOptions.map((z) => (
                        <option key={z.code} value={z.code}>
                          {z.symbol} {isVi ? z.vi : z.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                    <span className="text-[9px] font-mono text-primary font-bold block">
                      {isVi
                        ? `CUNG · ${currentZodiac.symbol} ${currentZodiac.vi}`
                        : `SUN SIGN · ${currentZodiac.symbol} ${currentZodiac.code}`}
                    </span>
                    <span className="font-headline font-bold text-slate-900 text-sm block mt-0.5">
                      {isVi ? currentZodiac.cardVi : currentZodiac.cardEn}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isVi ? "Năng Lượng Bản Mệnh" : "Natal Archetype"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                    <span className="text-[9px] font-mono text-primary font-bold block">
                      {isVi ? `SỐ ĐƯỜNG ĐỜI · 0${profile?.lifePathNumber || 7}` : `LIFE PATH · 0${profile?.lifePathNumber || 7}`}
                    </span>
                    <span className="font-headline font-bold text-slate-900 text-sm block mt-0.5">
                      {isVi ? "IX Ẩn Sĩ" : "IX The Hermit"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isVi ? "Ngọn Đèn Soi Tâm" : "Inner Lantern"}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between">
                  <div className="pr-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      {isVi ? "Bộ Nhớ Ngữ Cảnh AI" : "AI Contextual Memory"}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block">
                      {isVi
                        ? "Hòa hợp năng lượng bản mệnh vào các trải bài AI"
                        : "Infuse natal energy into AI readings"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowAiContext(!allowAiContext)}
                    className={`w-9 h-5 shrink-0 rounded-full transition-colors relative cursor-pointer ${
                      allowAiContext ? "bg-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white transition-transform block mt-0.5 ${
                        allowAiContext ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </section>

              {/* Section 02: Preferred Deck Edition (AI Voice Persona removed to match Web) */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "02. BỘ BÀI TAROT MẶC ĐỊNH" : "02. PREFERRED TAROT DECK"}
                  </span>
                  <Link href="/app/decks" className="text-[10px] font-mono text-primary hover:underline font-semibold">
                    {isVi ? "Xem Bộ Sưu Tập →" : "Gallery →"}
                  </Link>
                </div>

                <div className="space-y-2">
                  {deckOptions.map((deck) => (
                    <button
                      key={deck.id}
                      type="button"
                      onClick={() => setSelectedDeck(deck.id)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        selectedDeck === deck.id
                          ? "border-primary bg-emerald-50/50 text-slate-900 ring-1 ring-primary"
                          : "border-[#E2E8F0] hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{deck.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {deck.id} · 78 {isVi ? "Lá Bài" : "Cards"}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          selectedDeck === deck.id ? "bg-primary text-white font-bold" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {deck.badge}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveChanges}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>{saving ? (isVi ? "Đang lưu..." : "Saving...") : "Save"}</span>
                  </button>
                </div>
              </section>

              {/* Section 03: Wallet & Billing Summary */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "03. VÍ CRYSTAL (SUPABASE)" : "03. CRYSTAL WALLET (SUPABASE)"}
                  </span>
                  <Link href="/app/billing" className="text-[10px] font-mono text-primary hover:underline font-semibold">
                    {isVi ? "Quản Lý Nạp Thẻ →" : "Manage Billing →"}
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      {isVi ? "Số Dư Khả Dụng" : "Available Balance"}
                    </span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-headline font-bold text-2xl text-slate-900">{credits}</span>
                      <span className="text-xs font-mono font-bold text-primary">CR</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClaimDaily}
                    disabled={claimedDaily}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                      claimedDaily
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-emerald-700 shadow-xs"
                    }`}
                  >
                    {claimedDaily
                      ? isVi
                        ? "Đã Điểm Danh ✓"
                        : "Claimed ✓"
                      : isVi
                      ? "+10 CR Điểm Danh Ngày"
                      : "+10 CR Daily Claim"}
                  </button>
                </div>
              </section>

              {/* Section 04: Language & Quick Links */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "04. ỨNG DỤNG & QUYỀN RIÊNG TƯ" : "04. APPLICATION & PRIVACY"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {isVi ? "Ngôn Ngữ Ứng Dụng" : "Application Language"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isVi ? "Chuyển đổi song ngữ (Anh / Việt)" : "Bilingual switch (EN / VI)"}
                    </span>
                  </div>
                  <div className="flex items-center border border-[#E2E8F0] rounded text-xs font-mono overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setLocale("en")}
                      className={`px-2.5 py-1 ${
                        !isVi ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocale("vi")}
                      className={`px-2.5 py-1 ${
                        isVi ? "bg-primary text-white font-bold" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      VI
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2">
                  <Link
                    href="/app/journal"
                    className="px-3 py-2 border border-[#E2E8F0] bg-[#FAF9F6] hover:bg-slate-100 rounded-lg text-xs font-mono font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                    <span>{isVi ? "Lịch Nhật Ký" : "Journal"}</span>
                  </Link>
                  <Link
                    href="/app/auth"
                    className="px-3 py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">login</span>
                    <span>{isVi ? "Đăng Nhập / Đổi TK" : "Login / Switch"}</span>
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav activeTab="profile" />
      </main>
    </div>
  );
}
