"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { MysticProfileDto, WalletBalanceDto } from "@/types/api";

export default function SeekerProfilePage() {
  const { locale, setLocale, t } = useLanguage();
  const isVi = locale === "vi";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const [profile, setProfile] = useState<MysticProfileDto | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);

  // Form State
  const [allowAiContext, setAllowAiContext] = useState(true);
  const [stalkerAlerts, setStalkerAlerts] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<"MYSTIC_SAGE" | "IDEA_SPARK" | "GENTLE_FRIEND">("IDEA_SPARK");
  const [selectedDeck, setSelectedDeck] = useState("ED-02");
  const [birthZodiac, setBirthZodiac] = useState("Aries");
  const [birthDate, setBirthDate] = useState("1998-04-12");
  const [credits, setCredits] = useState(45);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profRes, walRes] = await Promise.all([
          apiClient.profile.getMysticProfile(),
          apiClient.wallet.getBalance()
        ]);

        if (profRes.data) {
          setProfile(profRes.data);
          if (profRes.data.preferredDeckId) setSelectedDeck(profRes.data.preferredDeckId);
          if (profRes.data.birthZodiac) setBirthZodiac(profRes.data.birthZodiac);
          if (profRes.data.birthDate) setBirthDate(profRes.data.birthDate);
          if (profRes.data.personaCode) {
            const mapped = profRes.data.personaCode === "MYSTIC_SAGE"
              ? "MYSTIC_SAGE"
              : profRes.data.personaCode === "GENTLE_FRIEND"
              ? "GENTLE_FRIEND"
              : "IDEA_SPARK";
            setSelectedPersona(mapped);
          }
        }

        if (walRes.data) {
          setWallet(walRes.data);
          setCredits(walRes.data.balance);
        }
      } catch (err) {
        console.error("Failed to load profile & wallet from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleClaimDaily = async () => {
    if (claimedDaily) return;
    try {
      const res = await apiClient.wallet.claimDailyReward();
      if (res.code === 200 && res.data) {
        setCredits(res.data.balance);
        setClaimedDaily(true);
        setSaveToast(isVi ? "+10 CR Phước lành buổi sớm đã được cộng!" : "+10 CR Daily Blessing claimed!");
        setTimeout(() => setSaveToast(null), 3000);
      }
    } catch (err) {
      console.error("Error claiming daily reward:", err);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await apiClient.profile.updateMysticProfile({
        preferredDeckId: selectedDeck,
        birthZodiac: birthZodiac,
        birthDate: birthDate,
        personaCode: selectedPersona,
        aiContextNotes: allowAiContext
          ? "Harmonize readings with natal birth zodiac decans and active archival deck."
          : "Standard objective card analysis without astrological bias."
      });

      if (res.code === 200 || res.data) {
        setProfile(res.data);
        setSaveToast(isVi ? "Hồ sơ & Thiết lập đã được lưu vào Supabase!" : "Settings saved to Supabase!");
        setTimeout(() => setSaveToast(null), 3500);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
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

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] antialiased min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-body">
      <EditorialHeader activeTab="settings" credits={credits} />

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="sticky top-16 z-50 bg-emerald-600 text-white text-xs font-mono font-medium px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main 3-Zone Architecture Container */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto border-x border-[#E2E8F0] bg-white">
        {/* ZONE 1: LEFT RAIL NAVIGATION (240px) */}
        <aside className="hidden lg:flex w-[240px] shrink-0 bg-white border-r border-[#E2E8F0] flex-col justify-between p-4 min-h-[calc(100vh-64px)]">
          <div>
            <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
              <div className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">
                ✦ AITAROT · VAULT
              </div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mt-0.5">
                {isVi ? "Bảng Điều Khiển · SCR-W08" : "Seeker Console · SCR-W08"}
              </div>
              <div className="mt-3 inline-flex items-center space-x-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-mono text-primary font-semibold">
                  {isVi ? "SUPABASE · TRỰC TUYẾN" : "SUPABASE · LIVE"}
                </span>
              </div>
            </div>

            <nav className="space-y-1 text-xs font-mono">
              <Link
                href="/"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">spa</span>
                  <span>{isVi ? "Chỉ Số Ngày" : "Daily Index"}</span>
                </span>
                <span className="text-[10px] text-slate-400">24h</span>
              </Link>
              <Link
                href="/workbench/demo-session"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">style</span>
                  <span>{isVi ? "Bàn Trải Bài" : "Workbench"}</span>
                </span>
              </Link>
              <Link
                href="/catalog-picker"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">grid_view</span>
                  <span>{isVi ? "Tra Cứu 78 Lá" : "78-Card Input"}</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">78</span>
              </Link>
              <Link
                href="/decks-archive"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">collections_bookmark</span>
                  <span>{isVi ? "Kho 5 Bộ Bài" : "5 Decks Archive"}</span>
                </span>
                <span className="text-[10px] text-primary bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">5 ED</span>
              </Link>
              <Link
                href="/journal"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">menu_book</span>
                  <span>{isVi ? "Nhật Ký Nghiệm Lý" : "Archive Journal"}</span>
                </span>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-slate-400">store</span>
                  <span>{isVi ? "Bảng Giá & Gói Phí" : "Pricing & Store"}</span>
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">CR</span>
              </Link>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 text-primary font-semibold border-l-2 border-primary pl-2.5">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-primary">person</span>
                  <span>{isVi ? "Hồ Sơ Của Bạn" : "Seeker Profile"}</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </nav>
          </div>

          {/* Rail Colophon */}
          <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
            <div className="flex items-center space-x-2 mb-1 text-xs font-semibold text-slate-900 font-mono">
              <span className="material-symbols-outlined text-primary text-base">park</span>
              <span>{isVi ? "Bộ Bài Ưu Thích" : "Preferred Deck"}</span>
            </div>
            <div className="text-xs text-slate-800 font-medium">{selectedDeck}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {isVi ? "Đồng bộ Supabase PostgreSQL" : "Synced with Supabase Cloud"}
            </div>
          </div>
        </aside>

        {/* ZONE 2: CENTER COLUMN */}
        <main className="flex-1 bg-[#FAF9F6] p-6 lg:p-8 overflow-y-auto max-w-[780px] border-r border-[#E2E8F0]">
          {/* Top Context Banner */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2E8F0]">
            <div>
              <h1 className="font-headline font-bold text-2xl text-slate-900 tracking-tight">
                {isVi ? "HỒ SƠ NGƯỜI TÌM KIẾM · SUPABASE" : "SEEKER PROFILE · SUPABASE VAULT"}
              </h1>
              <p className="text-xs font-mono uppercase text-slate-500 tracking-wider mt-0.5">
                {isVi
                  ? "Bản Đồ Ngày Sinh & Ký Ức Ngữ Cảnh AI (FR-1.2 & FR-1.3)"
                  : "Natal Blueprint & AI Contextual Memory Studio (FR-1.2 & FR-1.3)"}
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>{saving ? (isVi ? "Đang lưu..." : "Saving...") : (isVi ? "Lưu Thiết Lập" : "Save Changes")}</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs font-mono text-slate-500">
                {isVi ? "Đang tải hồ sơ từ Supabase..." : "Loading profile from Supabase..."}
              </span>
            </div>
          ) : (
            <>
              {/* CARD 01: Seeker Identity & Account Credentials */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">01.</span>
                    <h2 className="font-headline font-bold text-base text-slate-900">
                      {isVi ? "Danh Tính & Thông Tin Tài Khoản" : "Seeker Identity & Credentials"}
                    </h2>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">badge</span>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="relative w-14 h-14 rounded-full border-2 border-primary bg-slate-50 flex items-center justify-center shrink-0">
                    <span className="font-headline font-bold text-xl text-primary">
                      {profile?.birthZodiac?.slice(0, 2).toUpperCase() || "SK"}
                    </span>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                      <span className="material-symbols-outlined text-[12px]">spa</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-headline font-bold text-lg text-slate-900">
                        {isVi ? "Người Tìm Kiếm Chân Lý" : "Seeker of Truth"}
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold">
                        {wallet?.tier === "PRO" ? (isVi ? "HỘI VIÊN ARCHIVAL PRO" : "ARCHIVAL PRO SUBSCRIBER") : (isVi ? "TÀI KHOẢN TIÊU CHUẨN" : "STANDARD SEEKER")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        seeker@aitarotreader.com
                      </span>
                      <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-primary">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>{isVi ? "Đã liên kết Supabase Auth" : "Supabase Auth Connected"}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs text-slate-600 flex-wrap gap-2">
                      <span>
                        {isVi ? "Số dư hiện tại:" : "Available balance:"}{" "}
                        <strong className="text-primary font-mono">{credits} CR</strong>
                      </span>
                      <div className="flex items-center space-x-1 bg-[#FAF9F6] border border-[#E2E8F0] px-2.5 py-1 rounded text-xs font-mono">
                        <span>{isVi ? "Ngôn ngữ:" : "Language:"}</span>
                        <button
                          onClick={() => setLocale(locale === "en" ? "vi" : "en")}
                          className="font-bold text-primary hover:underline"
                        >
                          {locale === "en" ? "English (EN)" : "Tiếng Việt (VI)"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CARD 02: Mystic Blueprint & Natal Calibration */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">02.</span>
                    <h2 className="font-headline font-bold text-base text-slate-900">
                      {isVi ? "Bản Đồ Ngày Sinh & Hiệu Chuẩn Chiêm Tinh (FR-1.2)" : "Mystic Blueprint & Natal Calibration (FR-1.2)"}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {isVi ? "ĐỐI CHIẾU THỰC TẾ" : "NATAL CORRELATION"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  {isVi
                    ? "Được AI phân tích để hòa hợp nguyên mẫu các lá bài và tiến trình trải bài với năng lượng bản mệnh của bạn."
                    : "Synthesized by the AI Engine to harmonize card archetypes and reading trajectories with your core energetic decans."}
                </p>

                <div className="bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg p-3 mb-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-white border border-[#E2E8F0] flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">calendar_month</span>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-500">
                        {isVi ? "Ngày Sinh Của Bạn" : "Date of Birth"}
                      </div>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">
                      {isVi ? "Cung Hoàng Đạo" : "Sun Zodiac Sign"}
                    </div>
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

                {/* Specimen summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center space-x-3">
                    <div className="w-10 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center font-headline font-bold text-lg text-primary">
                      {currentZodiac.symbol}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">
                        {isVi ? `Cung Mặt Trời · ${currentZodiac.symbol} ${currentZodiac.vi}` : `Sun Sign · ${currentZodiac.symbol} ${currentZodiac.code}`}
                      </span>
                      <div className="font-headline font-bold text-sm text-slate-900">
                        {isVi ? currentZodiac.cardVi : currentZodiac.cardEn}
                      </div>
                      <span className="text-[10px] text-primary font-mono">
                        {isVi ? "Năng Lượng Bản Mệnh Tương Hợp" : "Harmonized Natal Archetype"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center space-x-3">
                    <div className="w-10 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center font-headline font-bold text-lg text-slate-700">
                      IX
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">
                        {isVi ? "Số Đường Đời · 07 Người Tìm Kiếm" : "Life Path · 07 Seeker"}
                      </span>
                      <div className="font-headline font-bold text-sm text-slate-900">
                        {isVi ? "IX Ẩn Sĩ (The Hermit)" : "IX The Hermit"}
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">
                        {isVi ? "Ngọn Đèn Nội Tâm · Trí Tuệ" : "Inner Lantern · Wisdom"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* CARD 03: Preferred Deck Edition & Voice Persona */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">03.</span>
                    <h2 className="font-headline font-bold text-base text-slate-900">
                      {isVi ? "Bộ Bài & Giọng Đọc AI (FR-2.4 & FR-3.1)" : "Deck Edition & Voice Persona (FR-2.4 & FR-3.1)"}
                    </h2>
                  </div>
                </div>

                {/* Deck Selector */}
                <div className="mt-3">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-2">
                    {isVi ? "Bộ Bài Mặc Định Ưa Thích" : "Preferred Archival Deck"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "ED-01", name: "Rider-Waite-Smith 1909", badge: isVi ? "KINH ĐIỂN" : "CANONICAL" },
                      { id: "ED-02", name: "Sunlit Botanical Herbarium", badge: isVi ? "THẢO MỘC" : "BOTANICAL" },
                      { id: "ED-03", name: "Swiss Geometric Construct", badge: "PRO" },
                      { id: "ED-04", name: "Marseille 1760 Heritage", badge: "PRO" },
                      { id: "ED-05", name: "Kyoto Sumi-e Ink Wash", badge: "PRO" },
                    ].map((deck) => (
                      <button
                        key={deck.id}
                        type="button"
                        onClick={() => setSelectedDeck(deck.id)}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                          selectedDeck === deck.id
                            ? "border-primary bg-emerald-50/50 text-slate-900 ring-1 ring-primary"
                            : "border-[#E2E8F0] hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{deck.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{deck.id} · 78 {isVi ? "Lá Bài" : "Cards"}</div>
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
                </div>

                {/* Reader Persona Selector */}
                <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-2">
                    {isVi ? "Giọng Đọc Luận Giải Mặc Định" : "Default Synthesis Voice Persona"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        code: "MYSTIC_SAGE",
                        title: isVi ? "Hiền Triết Huyền Bí" : "Mystic Sage",
                        desc: isVi ? "Cổ điển, chiêm nghiệm, thấu thị" : "Esoteric, poetic, archetypal",
                      },
                      {
                        code: "IDEA_SPARK",
                        title: isVi ? "Tia Sáng Sáng Tạo" : "Idea Spark",
                        desc: isVi ? "Chiến lược, trực diện, kích hoạt" : "Tactical, direct, creative catalyst",
                      },
                      {
                        code: "GENTLE_FRIEND",
                        title: isVi ? "Người Bạn Ôn Nhu" : "Gentle Friend",
                        desc: isVi ? "Đồng cảm, vỗ về, chánh niệm" : "Compassionate, mindful, reassuring",
                      },
                    ].map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => setSelectedPersona(p.code as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          selectedPersona === p.code
                            ? "border-primary bg-emerald-50 text-slate-900 ring-1 ring-primary"
                            : "border-[#E2E8F0] hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{p.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* CARD 04: AI Context Guardrail & Memory Management */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">04.</span>
                    <h2 className="font-headline font-bold text-base text-slate-900">
                      {isVi ? "Kiểm Soát Ngữ Cảnh & Ký Ức AI (FR-1.3)" : "AI Context Guardrail & Memory (FR-1.3)"}
                    </h2>
                  </div>
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {isVi ? "Cho Phép Nạp Dữ Liệu Ngày Sinh Bản Mệnh" : "Allow Natal Decan Context Injection"}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {isVi
                          ? `Kết hợp ${currentZodiac.vi} và Số Đường Đời 7 vào các bài luận giải AI.`
                          : `Weaves ${currentZodiac.code} & Life Path 7 into reading synthesis and advice.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowAiContext(!allowAiContext)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        allowAiContext ? "bg-primary" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          allowAiContext ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveChanges}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>{saving ? (isVi ? "Đang lưu..." : "Saving...") : (isVi ? "Lưu Toàn Bộ Cấu Hình Vào Supabase" : "Save All Settings To Supabase")}</span>
                  </button>
                </div>
              </section>
            </>
          )}
        </main>

        {/* ZONE 3: RIGHT COLUMN */}
        <aside className="hidden xl:flex w-[360px] shrink-0 bg-white p-6 flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Membership Pass */}
            <div className="p-5 rounded-xl border-2 border-primary bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/30 relative shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  {isVi ? "THẺ HỘI VIÊN THÁNH ĐỊA" : "SANCTUARY PASS"}
                </span>
                <span className="material-symbols-outlined text-primary text-lg">verified</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-slate-900">
                {isVi ? "Thẻ Archival Pro" : "Archival Pro Pass"}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isVi
                  ? "Không giới hạn rút bài hàng ngày, xuất file in 300 DPI không đóng dấu mờ, mở khóa toàn bộ 5 bộ bài."
                  : "Unlimited daily draws, watermark-free 300 DPI exports, 5 full Tarot editions unlocked."}
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">{isVi ? "Tự động gia hạn:" : "Auto-renews:"}</span>
                <span className="font-bold text-slate-900">{isVi ? "30 Tháng 11, 2026" : "Nov 30, 2026"}</span>
              </div>
              <Link
                href="/pricing"
                className="mt-3 block text-center py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {isVi ? "Quản Lý Gói Hội Viên" : "Manage Membership Plan"}
              </Link>
            </div>

            {/* Crystals Ledger Balance Box */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  {isVi ? "Số Dư Tinh Thể (Supabase)" : "Crystal Balance (Supabase)"}
                </span>
                <span className="material-symbols-outlined text-amber-600 text-lg">toll</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-headline font-bold text-3xl text-slate-900">{credits}</span>
                <span className="text-xs font-mono font-bold text-primary">CR</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">
                  {wallet?.tier || "FREE"}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    {isVi ? "+10 CR Điểm Danh Hàng Ngày" : "+10 CR Daily Login"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {isVi ? "Khả dụng sau mỗi nửa đêm" : "Available every midnight"}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={claimedDaily}
                  onClick={handleClaimDaily}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-colors ${
                    claimedDaily
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-emerald-700"
                  }`}
                >
                  {claimedDaily ? (isVi ? "Đã nhận ✓" : "Claimed ✓") : (isVi ? "Nhận" : "Claim")}
                </button>
              </div>

              <Link
                href="/pricing"
                className="mt-3 block text-center py-1.5 border border-[#E2E8F0] bg-white hover:bg-slate-50 rounded text-xs font-mono text-slate-700 transition-colors"
              >
                {isVi ? "Mua Thêm Túi Tinh Thể →" : "Purchase Credit Pouches →"}
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] text-[10px] font-mono text-slate-400 flex justify-between items-center">
            <span>AITAROT VAULT v2.3</span>
            <span>SUPABASE CLOUD PG17</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
