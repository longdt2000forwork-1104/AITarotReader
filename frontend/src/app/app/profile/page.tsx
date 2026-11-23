"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiClient } from "@/services/apiClient";
import { MysticProfileDto, WalletBalanceDto } from "@/types/api";
import { calculateNatalPreview } from "@/utils/authValidation";
import {
  isDailyRewardClaimedToday,
  markDailyRewardClaimedToday,
} from "@/utils/dailyRewardCache";

function MobileSeekerProfileContent() {
  const { locale, setLocale } = useLanguage();
  const { logout } = useAuth();
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth("/app/auth");
  const router = useRouter();
  const isVi = locale === "vi";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [profile, setProfile] = useState<MysticProfileDto | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);

  const [birthZodiac, setBirthZodiac] = useState("ARIES");
  const [birthDate, setBirthDate] = useState("1998-04-12");

  const [credits, setCredits] = useState(0);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setClaimedDaily(isDailyRewardClaimedToday(user?.id));
    async function fetchProfileAndWallet() {
      try {
        setLoading(true);
        const [profRes, walRes] = await Promise.all([
          apiClient.profile.getMysticProfile(),
          apiClient.wallet.getBalance(),
        ]);
        if (profRes.data) {
          setProfile(profRes.data);
          const normalizedDate = profRes.data.birthDate
            ? String(profRes.data.birthDate).slice(0, 10)
            : "";
          if (normalizedDate) setBirthDate(normalizedDate);
          const z = profRes.data.zodiacSign || profRes.data.birthZodiac;
          if (z) {
            setBirthZodiac(z.toUpperCase());
          } else if (normalizedDate) {
            const n = calculateNatalPreview(normalizedDate);
            if (n) setBirthZodiac(n.zodiacCode);
          }
          isDirtyRef.current = false;
        }
        if (walRes.data) {
          const claimedFromServer = walRes.data.dailyFreeAvailable === false;
          if (claimedFromServer) {
            markDailyRewardClaimedToday(user?.id);
          }
          setWallet(walRes.data);
          setCredits(walRes.data.balance);
          setClaimedDaily(claimedFromServer || isDailyRewardClaimedToday(user?.id));
        } else if (user) {
          setCredits(user.crystalBalance);
        }
      } catch (err) {
        console.error("Failed to load mobile profile & wallet:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndWallet();
  }, [isAuthenticated, user]);

  const handleClaimDaily = async () => {
    if (claimedDaily || claimingDaily) return;
    setClaimingDaily(true);
    try {
      const res = await apiClient.wallet.claimDailyReward();
      if (res.code === 200 && res.data) {
        markDailyRewardClaimedToday(user?.id);
        setCredits(res.data.balance);
        setClaimedDaily(true);
        setToastMessage(
          res.data.alreadyClaimed
            ? isVi
              ? "Hôm nay bạn đã điểm danh nhận +10 CR rồi."
              : "You have already claimed today's +10 CR blessing."
            : isVi
            ? "+10 CR Phước lành buổi sớm đã nhận!"
            : "+10 CR Daily Blessing claimed!"
        );
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error claiming daily reward:", err);
    } finally {
      setClaimingDaily(false);
    }
  };

  const persistProfile = useCallback(
    async (showToast: boolean) => {
      setSaving(true);
      setAutoSaveStatus("saving");
      try {
        const natal = calculateNatalPreview(birthDate);
        const res = await apiClient.profile.updateMysticProfile({
          zodiacSign: birthZodiac,
          birthDate: birthDate || undefined,
          lifePathNumber: natal?.lifePathNumber,
          locale,
        });
        if (res.code === 200 && res.data) {
          setProfile(res.data);
          isDirtyRef.current = false;
          setAutoSaveStatus("saved");
          if (showToast) {
            setToastMessage(isVi ? "Đã lưu hồ sơ & ngày sinh vào Supabase!" : "Profile & birth date saved!");
            setTimeout(() => setToastMessage(null), 3000);
          }
        }
      } catch (err) {
        console.error("Error saving mobile profile:", err);
        setAutoSaveStatus("idle");
      } finally {
        setSaving(false);
      }
    },
    [birthDate, birthZodiac, isVi, locale]
  );

  const handleSaveChanges = async () => {
    if (saving) return;
    await persistProfile(true);
  };

  // Auto-save when user edits birthDate or birthZodiac
  useEffect(() => {
    if (loading || !isAuthenticated || !isDirtyRef.current) return;
    const timer = setTimeout(() => {
      persistProfile(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [birthDate, birthZodiac, loading, isAuthenticated, persistProfile]);

  const handleBirthDateChange = (val: string) => {
    isDirtyRef.current = true;
    setAutoSaveStatus("idle");
    setBirthDate(val);
    const n = calculateNatalPreview(val);
    if (n) {
      setBirthZodiac(n.zodiacCode);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/app/auth");
  };

  const zodiacOptions = [
    { code: "ARIES", vi: "Bạch Dương", symbol: "♈", cardVi: "IV Hoàng Đế", cardEn: "IV The Emperor" },
    { code: "TAURUS", vi: "Kim Ngưu", symbol: "♉", cardVi: "V Giáo Hoàng", cardEn: "V The Hierophant" },
    { code: "GEMINI", vi: "Song Tử", symbol: "♊", cardVi: "VI Người Tình", cardEn: "VI The Lovers" },
    { code: "CANCER", vi: "Cự Giải", symbol: "♋", cardVi: "VII Cỗ Xe", cardEn: "VII The Chariot" },
    { code: "LEO", vi: "Sư Tử", symbol: "♌", cardVi: "VIII Sức Mạnh", cardEn: "VIII Strength" },
    { code: "VIRGO", vi: "Xử Nữ", symbol: "♍", cardVi: "IX Ẩn Sĩ", cardEn: "IX The Hermit" },
    { code: "LIBRA", vi: "Thiên Bình", symbol: "♎", cardVi: "XI Công Lý", cardEn: "XI Justice" },
    { code: "SCORPIO", vi: "Bọ Cạp", symbol: "♏", cardVi: "XIII Tử Thần", cardEn: "XIII Death" },
    { code: "SAGITTARIUS", vi: "Nhân Mã", symbol: "♐", cardVi: "XIV Tiết Chế", cardEn: "XIV Temperance" },
    { code: "CAPRICORN", vi: "Ma Kết", symbol: "♑", cardVi: "XV Ác Quỷ", cardEn: "XV The Devil" },
    { code: "AQUARIUS", vi: "Bảo Bình", symbol: "♒", cardVi: "XVII Ngôi Sao", cardEn: "XVII The Star" },
    { code: "PISCES", vi: "Song Ngư", symbol: "♓", cardVi: "XVIII Mặt Trăng", cardEn: "XVIII The Moon" },
  ];

  const currentZodiac = zodiacOptions.find((z) => z.code === birthZodiac) || zodiacOptions[0];
  const natalPreview = calculateNatalPreview(birthDate);
  const lifePath = natalPreview?.lifePathNumber ?? profile?.lifePathNumber ?? 7;
  const displayName = user?.fullName || user?.email?.split("@")[0] || (isVi ? "Người Tìm Kiếm" : "Seeker");

  if (authLoading || !isAuthenticated) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex justify-center">
        <div className="w-full max-w-[430px] border-x border-[#E2E8F0] flex items-center justify-center text-xs font-mono text-slate-500">
          {isVi ? "Đang kiểm tra đăng nhập..." : "Checking session..."}
        </div>
        <MobileBottomNav activeTab="profile" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <main className="w-full max-w-[430px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-28 border-x border-[#E2E8F0] shadow-sm">
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-mono font-medium px-4 py-2 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Title Bar with Save */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#E2E8F0] bg-white sticky top-0 z-30">
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
            <span>{saving ? (isVi ? "Đang lưu..." : "Saving...") : isVi ? "Lưu" : "Save"}</span>
          </button>
        </div>

        {/* Seeker Identity Card */}
        <div className="p-4 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-14 h-14 rounded-full border-2 border-primary object-cover shrink-0"
              />
            ) : (
              <div className="relative w-14 h-14 rounded-full border-2 border-primary bg-slate-50 flex items-center justify-center shrink-0">
                <span className="font-headline font-bold text-lg text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-headline font-bold text-base text-slate-900 truncate">
                  {displayName}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-[9px] uppercase font-bold shrink-0">
                  {wallet?.tier === "PRO" || user?.tier === "PRO" ? "ARCHIVAL PRO" : isVi ? "TIÊU CHUẨN" : "STANDARD"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>

              {/* Login method badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {user?.hasPassword && (
                  <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-700">
                    {isVi ? "Email & Mật khẩu" : "Email & Password"}
                  </span>
                )}
                {user?.hasGoogle && (
                  <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] font-mono text-primary font-semibold">
                    Google
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
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
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "01. BẢN ĐỒ NGÀY SINH & CHIÊM TINH" : "01. MYSTIC BLUEPRINT"}
                  </span>
                  {autoSaveStatus === "saving" && (
                    <span className="text-[10px] font-mono text-amber-600 font-medium">
                      {isVi ? "Đang lưu..." : "Saving..."}
                    </span>
                  )}
                  {autoSaveStatus === "saved" && (
                    <span className="text-[10px] font-mono text-emerald-600 font-medium inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      {isVi ? "Đã tự động lưu" : "Auto-saved"}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {isVi ? "Ngày Sinh" : "Birth Date"}
                    </span>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded"
                    />
                  </div>

                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {isVi ? "Cung Hoàng Đạo" : "Sun Sign"}
                    </span>
                    <select
                      value={birthZodiac}
                      onChange={(e) => {
                        isDirtyRef.current = true;
                        setAutoSaveStatus("idle");
                        setBirthZodiac(e.target.value);
                      }}
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
                  </div>
                  <div className="p-2.5 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                    <span className="text-[9px] font-mono text-primary font-bold block">
                      {isVi ? `SỐ ĐƯỜNG ĐỜI · ${lifePath}` : `LIFE PATH · ${lifePath}`}
                    </span>
                    <span className="font-headline font-bold text-slate-900 text-sm block mt-0.5">
                      {isVi ? "Bản Mệnh" : "Natal Path"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={saving || loading}
                    onClick={handleSaveChanges}
                    className="w-full py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>
                      {saving
                        ? isVi
                          ? "Đang lưu ngày sinh & bản mệnh..."
                          : "Saving birth date & blueprint..."
                        : isVi
                        ? "Lưu ngày sinh & bản mệnh"
                        : "Save Birth Date & Blueprint"}
                    </span>
                  </button>
                </div>
              </section>

              {/* Section 02: Wallet & Billing Summary */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "02. VÍ CRYSTAL (SUPABASE)" : "02. CRYSTAL WALLET (SUPABASE)"}
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
                    disabled={claimedDaily || claimingDaily}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                      claimedDaily || claimingDaily
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-emerald-700 shadow-xs"
                    }`}
                  >
                    {claimingDaily
                      ? isVi
                        ? "Đang nhận..."
                        : "Claiming..."
                      : claimedDaily
                      ? isVi
                        ? "Đã Điểm Danh ✓"
                        : "Claimed ✓"
                      : isVi
                      ? "+10 CR Điểm Danh Ngày"
                      : "+10 CR Daily Claim"}
                  </button>
                </div>
              </section>

              {/* Section 03: Language & Session */}
              <section className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {isVi ? "03. ỨNG DỤNG & TÀI KHOẢN" : "03. APPLICATION & ACCOUNT"}
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
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>{isVi ? "Đăng Xuất" : "Sign Out"}</span>
                  </button>
                </div>
              </section>
            </>
          )}
        </div>

        <MobileBottomNav activeTab="profile" />
      </main>
    </div>
  );
}

export default function MobileSeekerProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <MobileSeekerProfileContent />
    </Suspense>
  );
}
