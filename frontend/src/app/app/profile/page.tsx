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
  const [profile, setProfile] = useState<MysticProfileDto | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);
  const [allowAiContext, setAllowAiContext] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<"MYSTIC_SAGE" | "IDEA_SPARK" | "GENTLE_FRIEND">("IDEA_SPARK");
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

  const handleUpdatePersona = async (persona: "MYSTIC_SAGE" | "IDEA_SPARK" | "GENTLE_FRIEND") => {
    setSelectedPersona(persona);
    try {
      const res = await apiClient.profile.updateMysticProfile({ personaCode: persona });
      if (res.code === 200 || res.data) {
        setToastMessage(isVi ? "Đã cập nhật giọng đọc AI!" : "Voice persona updated!");
        setTimeout(() => setToastMessage(null), 2500);
      }
    } catch (err) {
      console.error("Error updating persona:", err);
    }
  };

  const handleToggleAiContext = async () => {
    const nextVal = !allowAiContext;
    setAllowAiContext(nextVal);
    try {
      await apiClient.profile.updateMysticProfile({
        aiContextNotes: nextVal
          ? "Harmonize readings with natal birth zodiac decans and active archival deck."
          : "Standard objective card analysis without astrological bias."
      });
      setToastMessage(isVi ? "Đã lưu cài đặt ngữ cảnh AI!" : "AI Context preference saved!");
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error("Error updating AI context:", err);
    }
  };

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

        {/* Top Header */}
        <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
          <Link
            href="/app/home"
            className="flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 text-xs text-slate-600 hover:text-on-surface font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>{isVi ? "Thánh Địa" : "Sanctuary"}</span>
          </Link>
          <span className="font-mono text-xs font-semibold text-on-surface">
            {isVi ? "HỒ SƠ NGƯỜI TÌM KIẾM" : "SEEKER PROFILE"}
          </span>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            SUPABASE
          </span>
        </header>

        {/* 3. Seeker Identity Card */}
        <div className="p-4 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-14 h-14 rounded-full border-2 border-primary bg-slate-50 flex items-center justify-center shrink-0">
              <span className="font-headline font-bold text-lg text-primary">
                {profile?.birthZodiac?.slice(0, 2).toUpperCase() || "SK"}
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
              {/* Section 01: Mystic Blueprint */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "01. BẢN ĐỒ CHIÊM TINH HỌC" : "01. MYSTIC BLUEPRINT"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {profile?.birthDate || "12/04/1998"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                    <span className="text-[9px] font-mono text-primary font-bold block">
                      {isVi ? `CUNG MẶT TRỜI · ${profile?.birthZodiac || "BẠCH DƯƠNG"}` : `SUN SIGN · ${profile?.birthZodiac || "ARIES"}`}
                    </span>
                    <span className="font-headline font-bold text-slate-900 text-sm block mt-0.5">
                      {isVi ? "IV Hoàng Đế" : "IV The Emperor"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isVi ? "Ý Chí Khai Phá" : "Cardinal Will"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                    <span className="text-[9px] font-mono text-primary font-bold block">
                      {isVi ? "SỐ ĐƯỜNG ĐỜI · 07" : "LIFE PATH · 07"}
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
                  <div>
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
                    onClick={handleToggleAiContext}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
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

              {/* Section 02: Deck & Reader Persona */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "02. CẤU HÌNH BỘ BÀI & GIỌNG ĐỌC" : "02. DECK & VOICE CONFIGURATION"}
                  </span>
                  <Link href="/app/decks" className="text-[10px] font-mono text-primary hover:underline font-semibold">
                    {isVi ? "Đổi Bộ Bài →" : "Change Deck →"}
                  </Link>
                </div>

                <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {isVi ? "Bộ Bài Lưu Trữ Hiện Tại" : "Current Archival Deck"}
                    </span>
                    <div className="font-headline font-bold text-xs text-slate-900">
                      {profile?.preferredDeckId || "ED-01"}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-primary text-white font-bold rounded">
                    {isVi ? "ĐANG DÙNG" : "ACTIVE"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                    {isVi ? "Hình Tượng Giọng Đọc Mặc Định" : "Default Reader Persona"}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { code: "MYSTIC_SAGE", name: isVi ? "Nhà Huyền Bí" : "Classic Mystic" },
                      { code: "IDEA_SPARK", name: isVi ? "Khai Sáng Ý Tưởng" : "Idea Spark" },
                      { code: "GENTLE_FRIEND", name: isVi ? "Người Bạn Ôn Hòa" : "Gentle Friend" },
                    ].map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleUpdatePersona(p.code as any)}
                        className={`py-2 px-1 rounded-lg border text-center transition-all ${
                          selectedPersona === p.code
                            ? "border-primary bg-emerald-50 text-slate-900 font-bold"
                            : "border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-[11px] leading-tight">{p.name}</span>
                      </button>
                    ))}
                  </div>
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
                      ? (isVi ? "Đã Điểm Danh ✓" : "Claimed ✓")
                      : (isVi ? "+10 CR Điểm Danh Ngày" : "+10 CR Daily Claim")}
                  </button>
                </div>
              </section>

              {/* Section 04: Language & Export Data */}
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

                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {isVi ? "Xuất Dữ Liệu Nhật Ký" : "Export Journal Data"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isVi ? "Tệp JSON mã hóa lịch sử trải bài" : "Encrypted readings JSON"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(isVi ? "Đang xuất tệp lưu trữ JSON từ Supabase..." : "Exporting JSON archive from Supabase...")}
                    className="px-2.5 py-1 border border-[#E2E8F0] bg-[#FAF9F6] hover:bg-slate-100 rounded text-xs font-mono text-slate-700"
                  >
                    {isVi ? "Xuất JSON" : "Export JSON"}
                  </button>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2.5">
                  <Link
                    href="/settings/profile"
                    className="px-3 py-2.5 border border-[#E2E8F0] bg-[#FAF9F6] hover:bg-slate-100 rounded-xl text-xs font-medium text-slate-800 flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-base text-primary">badge</span>
                    <span>{isVi ? "Hồ Sơ Chi Tiết" : "Full Profile"}</span>
                  </Link>
                  <Link
                    href="/app/auth"
                    className="px-3 py-2.5 bg-primary hover:bg-[#047857] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>{isVi ? "Đổi Tài Khoản" : "Switch Account"}</span>
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
