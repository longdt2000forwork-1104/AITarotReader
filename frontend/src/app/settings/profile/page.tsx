"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditorialHeader from "@/components/EditorialHeader";
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

function SeekerProfileContent() {
  const { locale, setLocale } = useLanguage();
  const { logout } = useAuth();
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth("/auth");
  const router = useRouter();
  const isVi = locale === "vi";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const [profile, setProfile] = useState<MysticProfileDto | null>(null);
  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);

  const [birthDate, setBirthDate] = useState("1998-04-12");
  const [credits, setCredits] = useState(0);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setClaimedDaily(isDailyRewardClaimedToday(user?.id));
    async function loadData() {
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
        console.error("Failed to load profile & wallet from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
        setSaveToast(
          res.data.alreadyClaimed
            ? isVi
              ? "Hôm nay bạn đã điểm danh nhận +10 CR rồi."
              : "You have already claimed today's +10 CR blessing."
            : isVi
            ? "+10 CR Phước lành buổi sớm đã được cộng!"
            : "+10 CR Daily Blessing claimed!"
        );
        setTimeout(() => setSaveToast(null), 3000);
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
          zodiacSign: natal?.zodiacCode,
          birthDate: birthDate || undefined,
          lifePathNumber: natal?.lifePathNumber,
          locale,
        });

        if (res.code === 200 && res.data) {
          setProfile(res.data);
          isDirtyRef.current = false;
          setAutoSaveStatus("saved");
          if (showToast) {
            setSaveToast(isVi ? "Hồ sơ & Ngày sinh đã được lưu vào Supabase!" : "Settings saved to Supabase!");
            setTimeout(() => setSaveToast(null), 3500);
          }
        }
      } catch (err) {
        console.error("Error updating profile:", err);
        setAutoSaveStatus("idle");
      } finally {
        setSaving(false);
      }
    },
    [birthDate, isVi, locale]
  );

  const handleSaveChanges = async () => {
    if (saving) return;
    await persistProfile(true);
  };

  useEffect(() => {
    if (loading || !isAuthenticated || !isDirtyRef.current) return;
    const timer = setTimeout(() => {
      persistProfile(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [birthDate, loading, isAuthenticated, persistProfile]);

  const handleBirthDateChange = (val: string) => {
    isDirtyRef.current = true;
    setAutoSaveStatus("idle");
    setBirthDate(val);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const zodiacOptions = [
    { code: "ARIES", vi: "Bạch Dương", en: "Aries", symbol: "♈", cardVi: "IV Hoàng Đế", cardEn: "IV The Emperor" },
    { code: "TAURUS", vi: "Kim Ngưu", en: "Taurus", symbol: "♉", cardVi: "V Giáo Hoàng", cardEn: "V The Hierophant" },
    { code: "GEMINI", vi: "Song Tử", en: "Gemini", symbol: "♊", cardVi: "VI Người Tình", cardEn: "VI The Lovers" },
    { code: "CANCER", vi: "Cự Giải", en: "Cancer", symbol: "♋", cardVi: "VII Cỗ Xe", cardEn: "VII The Chariot" },
    { code: "LEO", vi: "Sư Tử", en: "Leo", symbol: "♌", cardVi: "VIII Sức Mạnh", cardEn: "VIII Strength" },
    { code: "VIRGO", vi: "Xử Nữ", en: "Virgo", symbol: "♍", cardVi: "IX Ẩn Sĩ", cardEn: "IX The Hermit" },
    { code: "LIBRA", vi: "Thiên Bình", en: "Libra", symbol: "♎", cardVi: "XI Công Lý", cardEn: "XI Justice" },
    { code: "SCORPIO", vi: "Bọ Cạp", en: "Scorpio", symbol: "♏", cardVi: "XIII Tử Thần", cardEn: "XIII Death" },
    { code: "SAGITTARIUS", vi: "Nhân Mã", en: "Sagittarius", symbol: "♐", cardVi: "XIV Tiết Chế", cardEn: "XIV Temperance" },
    { code: "CAPRICORN", vi: "Ma Kết", en: "Capricorn", symbol: "♑", cardVi: "XV Ác Quỷ", cardEn: "XV The Devil" },
    { code: "AQUARIUS", vi: "Bảo Bình", en: "Aquarius", symbol: "♒", cardVi: "XVII Ngôi Sao", cardEn: "XVII The Star" },
    { code: "PISCES", vi: "Song Ngư", en: "Pisces", symbol: "♓", cardVi: "XVIII Mặt Trăng", cardEn: "XVIII The Moon" },
  ];

  const natalPreview = calculateNatalPreview(birthDate);
  const derivedZodiacCode =
    natalPreview?.zodiacCode || profile?.zodiacSign?.toUpperCase() || "ARIES";
  const currentZodiac =
    zodiacOptions.find((z) => z.code === derivedZodiacCode) || zodiacOptions[0];
  const lifePath = natalPreview?.lifePathNumber ?? profile?.lifePathNumber ?? 7;
  const displayName = user?.fullName || user?.email?.split("@")[0] || (isVi ? "Người Tìm Kiếm" : "Seeker");

  const loginMethodLabel = (() => {
    const hasPwd = Boolean(user?.hasPassword);
    const hasGgl = Boolean(user?.hasGoogle);
    if (hasPwd && hasGgl) return isVi ? "Email & Mật khẩu + Google" : "Email & Password + Google";
    if (hasGgl) return "Google";
    return isVi ? "Email & Mật khẩu" : "Email & Password";
  })();

  if (authLoading || !isAuthenticated) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col">
        <EditorialHeader activeTab="settings" />
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-mono text-slate-500">
          {isVi ? "Đang kiểm tra phiên đăng nhập..." : "Checking authentication..."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] antialiased min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-body">
      <EditorialHeader activeTab="settings" credits={credits} />

      {saveToast && (
        <div className="sticky top-16 z-50 bg-emerald-600 text-white text-xs font-mono font-medium px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{saveToast}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col xl:flex-row w-full max-w-[1440px] mx-auto border-x border-[#E2E8F0] bg-white">
        <main className="flex-1 bg-[#FAF9F6] p-6 lg:p-8 overflow-y-auto xl:border-r border-[#E2E8F0]">
          <div className="max-w-[880px] mx-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2E8F0]">
              <div>
                <h1 className="font-headline font-bold text-2xl text-slate-900 tracking-tight">
                  {isVi ? "HỒ SƠ NGƯỜI TÌM KIẾM · SUPABASE" : "SEEKER PROFILE · SUPABASE VAULT"}
                </h1>
                <p className="text-xs font-mono uppercase text-slate-500 tracking-wider mt-0.5">
                  {isVi
                    ? "Bản Đồ Ngày Sinh & Hiệu Chuẩn Chiêm Tinh (FR-1.2)"
                    : "Natal Blueprint & Astrological Calibration (FR-1.2)"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>{isVi ? "Đăng xuất" : "Sign Out"}</span>
                </button>
              </div>
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
                {/* CARD 01: Seeker Identity & Auth Methods */}
                <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">01.</span>
                      <h2 className="font-headline font-bold text-base text-slate-900">
                        {isVi ? "Danh Tính & Phương Thức Đăng Nhập" : "Seeker Identity & Login Methods"}
                      </h2>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">badge</span>
                  </div>

                  <div className="flex items-start space-x-4">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="w-14 h-14 rounded-full border-2 border-primary object-cover shrink-0"
                      />
                    ) : (
                      <div className="relative w-14 h-14 rounded-full border-2 border-primary bg-slate-50 flex items-center justify-center shrink-0">
                        <span className="font-headline font-bold text-xl text-primary">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-headline font-bold text-lg text-slate-900">{displayName}</h3>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-mono text-[10px] uppercase tracking-wider font-semibold">
                          {wallet?.tier === "PRO" || user?.tier === "PRO"
                            ? isVi
                              ? "HỘI VIÊN ARCHIVAL PRO"
                              : "ARCHIVAL PRO SUBSCRIBER"
                            : isVi
                            ? "TÀI KHOẢN TIÊU CHUẨN"
                            : "STANDARD SEEKER"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {user?.email}
                        </span>
                        {user?.emailVerified && (
                          <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-primary">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>{isVi ? "Email đã xác thực" : "Email Verified"}</span>
                          </span>
                        )}
                      </div>

                      {/* Login Method Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-mono uppercase text-slate-500">
                          {isVi ? "Phương thức đăng nhập:" : "Sign-in methods:"}
                        </span>
                        {user?.hasPassword && (
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-700">
                            {isVi ? "Email & Mật khẩu" : "Email & Password"}
                          </span>
                        )}
                        {user?.hasGoogle && (
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-mono text-primary font-semibold">
                            Google OAuth
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">({loginMethodLabel})</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs text-slate-600 flex-wrap gap-2">
                        <span>
                          {isVi ? "Số dư hiện tại:" : "Available balance:"}{" "}
                          <strong className="text-primary font-mono">{credits} CR</strong>
                        </span>
                        <div className="flex items-center space-x-1 bg-[#FAF9F6] border border-[#E2E8F0] px-2.5 py-1 rounded text-xs font-mono">
                          <span>{isVi ? "Ngôn ngữ:" : "Language:"}</span>
                          <button
                            type="button"
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
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">02.</span>
                      <h2 className="font-headline font-bold text-base text-slate-900">
                        {isVi ? "Bản Đồ Ngày Sinh & Hiệu Chuẩn Chiêm Tinh (FR-1.2)" : "Mystic Blueprint & Natal Calibration (FR-1.2)"}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
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
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {isVi ? "ĐỐI CHIẾU THỰC TẾ" : "NATAL CORRELATION"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    {isVi
                      ? "Được AI phân tích để hòa hợp nguyên mẫu các lá bài với năng lượng bản mệnh của bạn."
                      : "Synthesized by the AI Engine to harmonize card archetypes with your core energetic decans."}
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
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {isVi
                        ? "Tự động tính Cung & Số đường đời theo ngày sinh"
                        : "Sun sign & Life Path auto-derived from birth date"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center space-x-3">
                      <div className="w-10 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center font-headline font-bold text-lg text-primary">
                        {currentZodiac.symbol}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500">
                          {isVi
                            ? `Cung Mặt Trời · ${currentZodiac.symbol} ${currentZodiac.vi}`
                            : `Sun Sign · ${currentZodiac.symbol} ${currentZodiac.en}`}
                        </span>
                        <div className="font-headline font-bold text-sm text-slate-900">
                          {isVi ? currentZodiac.cardVi : currentZodiac.cardEn}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg flex items-center space-x-3">
                      <div className="w-10 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center font-headline font-bold text-lg text-slate-700">
                        {lifePath}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500">
                          {isVi ? `Số Đường Đời · ${lifePath}` : `Life Path · ${lifePath}`}
                        </span>
                        <div className="font-headline font-bold text-sm text-slate-900">
                          {isVi ? "Chỉ Số Bản Mệnh" : "Natal Numerology"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex justify-end">
                    <button
                      type="button"
                      disabled={saving || loading}
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      <span>
                        {saving
                          ? isVi
                            ? "Đang lưu ngày sinh..."
                            : "Saving birth date..."
                          : isVi
                          ? "Lưu ngày sinh & bản mệnh"
                          : "Save Birth Date & Blueprint"}
                      </span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>

        {/* ZONE 2: RIGHT COLUMN (Membership & Wallet) */}
        <aside className="flex w-full xl:w-[360px] shrink-0 bg-white p-6 flex-col justify-between overflow-y-auto border-t xl:border-t-0 border-[#E2E8F0]">
          <div className="space-y-6">
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
                  ? "Không giới hạn rút bài hàng ngày, đào sâu hỏi đáp AI và lưu trữ Nhật Ký Lịch Ngày đồng bộ trên Web & Mobile."
                  : "Unlimited daily draws, deep AI follow-up inquiry, and full Calendar Journal syncing across Web & Mobile."}
              </p>
              <Link
                href="/pricing"
                className="mt-4 block text-center py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {isVi ? "Quản Lý Gói Hội Viên" : "Manage Membership Plan"}
              </Link>
            </div>

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
                  {wallet?.tier || user?.tier || "FREE"}
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
                  disabled={claimedDaily || claimingDaily}
                  onClick={handleClaimDaily}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-colors ${
                    claimedDaily || claimingDaily
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-emerald-700"
                  }`}
                >
                  {claimingDaily
                    ? isVi
                      ? "Đang nhận..."
                      : "Claiming..."
                    : claimedDaily
                    ? isVi
                      ? "Đã nhận ✓"
                      : "Claimed ✓"
                    : isVi
                    ? "Nhận"
                    : "Claim"}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] text-[10px] font-mono text-slate-400 flex justify-between items-center">
            <span>AITAROT VAULT</span>
            <span>SUPABASE CLOUD PG17</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SeekerProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <SeekerProfileContent />
    </Suspense>
  );
}
