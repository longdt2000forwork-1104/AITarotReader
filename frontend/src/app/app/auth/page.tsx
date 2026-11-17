"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/authApi";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  calculateNatalPreview,
  isValidEmail,
  passwordsMatch,
  validatePassword,
} from "@/utils/authValidation";

function sanitizeNextUrl(nextParam: string | null, fallback: string): string {
  if (!nextParam) return fallback;
  if (nextParam.startsWith("/") && !nextParam.startsWith("//")) {
    return nextParam;
  }
  return fallback;
}

function MobileAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = sanitizeNextUrl(searchParams.get("next"), "/app/home");

  const { locale, setLocale } = useLanguage();
  const { user, status, login, register, loginWithGoogle } = useAuth();
  const isVi = locale === "vi";

  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [birthDate, setBirthDate] = useState("1998-04-12");
  const [focusAreas, setFocusAreas] = useState<string[]>([
    "Creative Ideation",
    "Career & Strategy",
  ]);
  const [allowAiContext, setAllowAiContext] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsVerificationEmail, setNeedsVerificationEmail] = useState<string | null>(null);
  const [registerSuccessEmail, setRegisterSuccessEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(nextUrl);
    }
  }, [status, user, router, nextUrl]);

  const natal = calculateNatalPreview(birthDate);
  const pwdCheck = validatePassword(password);

  const toggleFocus = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else if (focusAreas.length < 3) {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const domainLabels: Record<string, { en: string; vi: string }> = {
    "Creative Ideation": { en: "Creative Ideation", vi: "Ý Tưởng Sáng Tạo" },
    "Career & Strategy": { en: "Career & Strategy", vi: "Sự Nghiệp & Chiến Lược" },
    Relationships: { en: "Relationships", vi: "Mối Quan Hệ" },
    "Personal Growth": { en: "Personal Growth", vi: "Phát Triển Bản Thân" },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResendMessage(null);
    setNeedsVerificationEmail(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setErrorMsg(isVi ? "Địa chỉ email không hợp lệ." : "Please enter a valid email address.");
      return;
    }

    if (tab === "signin") {
      if (!password) {
        setErrorMsg(isVi ? "Vui lòng nhập mật khẩu." : "Please enter your password.");
        return;
      }
      setSubmitting(true);
      const res = await login(trimmedEmail, password);
      setSubmitting(false);

      if (res.ok) {
        router.replace(nextUrl);
        return;
      }

      if (res.code === "ERR_EMAIL_NOT_VERIFIED") {
        setNeedsVerificationEmail(trimmedEmail);
        setErrorMsg(
          isVi
            ? "Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc gửi lại link."
            : "Your email is not verified yet. Please check your inbox or resend the link."
        );
      } else if (res.code === "ERR_TOO_MANY_REQUESTS" || res.status === 429) {
        setErrorMsg(
          isVi
            ? "Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút."
            : "Too many login attempts. Please wait a few minutes."
        );
      } else {
        setErrorMsg(
          isVi ? "Email hoặc mật khẩu không chính xác." : "Invalid email or password."
        );
      }
      return;
    }

    if (!displayName.trim()) {
      setErrorMsg(isVi ? "Vui lòng nhập tên hiển thị." : "Please enter your display name.");
      return;
    }
    if (!pwdCheck.valid) {
      setErrorMsg(
        isVi ? "Mật khẩu phải có ít nhất 8 ký tự." : "Password must be at least 8 characters."
      );
      return;
    }
    if (!passwordsMatch(password, confirmPassword)) {
      setErrorMsg(isVi ? "Mật khẩu xác nhận không khớp." : "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const res = await register({
      email: trimmedEmail,
      password,
      displayName: displayName.trim(),
      birthDate: birthDate || undefined,
      focusAreas,
      allowAiContext,
      locale,
      platform: "app",
    });
    setSubmitting(false);

    if (res.ok) {
      setRegisterSuccessEmail(trimmedEmail);
      return;
    }

    if (res.code === "ERR_USER_EXISTS" || res.status === 409) {
      setErrorMsg(
        isVi
          ? "Email này đã được đăng ký. Vui lòng chuyển sang Đăng Nhập."
          : "This email is already registered. Please sign in."
      );
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (resending) return;
    setResending(true);
    setResendMessage(null);
    const res = await authApi.resendVerification(targetEmail, "app", locale);
    setResending(false);
    setResendMessage(
      res.ok
        ? isVi
          ? "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư."
          : "Verification email sent. Please check your inbox."
        : res.message
    );
  };

  const handleGoogleIdToken = async (idToken: string) => {
    setErrorMsg(null);
    setSubmitting(true);
    const res = await loginWithGoogle(idToken, "app", locale);
    setSubmitting(false);
    if (res.ok) {
      router.replace(nextUrl);
    } else {
      setErrorMsg(
        res.message || (isVi ? "Đăng nhập Google thất bại." : "Google authentication failed.")
      );
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <main className="w-full max-w-[430px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-28 border-x border-[#E2E8F0] shadow-sm">
        {/* Brand Bar & Language Switch */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[#E2E8F0] bg-white sticky top-0 z-30">
          <Link href="/app/home" className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            <span className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">
              {isVi ? "AITAROT · THÁNH ĐỊA" : "AITAROT · SANCTUARY"}
            </span>
          </Link>
          <div className="flex items-center border border-[#E2E8F0] rounded text-[11px] font-mono overflow-hidden">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-0.5 font-bold ${
                !isVi ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("vi")}
              className={`px-2 py-0.5 font-bold ${
                isVi ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              VI
            </button>
          </div>
        </div>

        {/* Hero Specimen Card Display */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-4 bg-white border-b border-[#E2E8F0]">
          <div className="w-14 h-20 bg-[#FAF9F6] border border-[#CBD5E1] rounded p-1 flex flex-col items-center justify-between shadow-2xs shrink-0">
            <span className="text-[9px] font-mono font-bold text-slate-500">I</span>
            <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
            <span className="text-[8px] font-mono text-primary font-bold uppercase">
              {isVi ? "Ảo Thuật" : "Magician"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-0.5">
              {isVi ? "XÁC THỰC TÀI KHOẢN (SCR-M09)" : "SEEKER AUTH (SCR-M09)"}
            </span>
            <h1 className="font-headline font-bold text-base text-slate-900 leading-tight">
              {tab === "register"
                ? isVi
                  ? "Tạo Tài Khoản Người Tìm Kiếm"
                  : "Create Your Seeker Vault"
                : isVi
                ? "Đăng Nhập Vào Thánh Địa"
                : "Sign In to Sanctuary"}
            </h1>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {isVi
                ? "Đồng bộ phiên trải bài, nhật ký và ví Tinh Thể giữa Web & Android."
                : "Sync readings, journal reflections, and Crystals across Web & Android."}
            </p>
          </div>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="px-5 pt-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMsg(null);
                setRegisterSuccessEmail(null);
              }}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                tab === "signin"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {isVi ? "01 · Đăng Nhập" : "01 · Sign In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setErrorMsg(null);
                setNeedsVerificationEmail(null);
              }}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                tab === "register"
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {isVi ? "02 · Đăng Ký" : "02 · Register"}
            </button>
          </div>
        </div>

        {registerSuccessEmail ? (
          <div className="mx-5 mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <h2 className="font-headline font-bold text-base text-slate-900">
              {isVi ? "Kiểm Tra Email Để Xác Thực" : "Verify Your Email"}
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isVi
                ? `Liên kết xác thực đã được gửi tới ${registerSuccessEmail}. Mở liên kết trong email trước khi đăng nhập.`
                : `A verification link has been sent to ${registerSuccessEmail}. Please verify before signing in.`}
            </p>
            {resendMessage && (
              <p className="text-xs text-primary font-medium bg-white border border-emerald-200 rounded p-2">
                {resendMessage}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={resending}
                onClick={() => handleResendVerification(registerSuccessEmail)}
                className="w-full py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-800"
              >
                {resending
                  ? isVi
                    ? "Đang gửi lại..."
                    : "Resending..."
                  : isVi
                  ? "Gửi Lại Email Xác Thực"
                  : "Resend Verification Email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegisterSuccessEmail(null);
                  setTab("signin");
                }}
                className="w-full py-2 bg-primary text-white rounded-lg text-xs font-semibold"
              >
                {isVi ? "Chuyển Sang Đăng Nhập" : "Go to Sign In"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-3 space-y-3.5">
            {/* Google Sign-In */}
            <GoogleSignInButton
              locale={locale}
              disabled={submitting}
              onIdToken={handleGoogleIdToken}
              onError={(msg) => setErrorMsg(msg)}
            />

            <div className="relative flex items-center justify-center my-2">
              <div className="w-full border-t border-[#E2E8F0]" />
              <span className="absolute bg-[#FAF9F6] px-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                {isVi ? "Hoặc dùng Email & Mật Khẩu" : "Or use Email & Password"}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1.5">
                <p>{errorMsg}</p>
                {needsVerificationEmail && (
                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => handleResendVerification(needsVerificationEmail)}
                    className="font-semibold underline text-rose-900"
                  >
                    {resending
                      ? isVi
                        ? "Đang gửi lại..."
                        : "Resending..."
                      : isVi
                      ? "Gửi lại email xác thực"
                      : "Resend verification email"}
                  </button>
                )}
                {resendMessage && <p className="text-primary font-medium">{resendMessage}</p>}
              </div>
            )}

            {tab === "register" && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                  {isVi ? "Tên Hiển Thị" : "Display Name"}
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={isVi ? "Nhập tên của bạn" : "Your display name"}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                {isVi ? "Địa Chỉ Email" : "Email Address"}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                {isVi ? "Mật Khẩu" : "Password"}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={tab === "register" ? 8 : 1}
                  autoComplete={tab === "register" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === "register" ? (isVi ? "Tối thiểu 8 ký tự" : "Min 8 characters") : "••••••••"}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 pr-9 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-slate-400"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {tab === "register" && (
              <>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                    {isVi ? "Xác Nhận Mật Khẩu" : "Confirm Password"}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isVi ? "Nhập lại mật khẩu" : "Re-enter password"}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Natal Calibration */}
                <div className="pt-2 border-t border-[#E2E8F0] space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                    {isVi ? "BƯỚC 02: HIỆU CHUẨN CHIÊM TINH (TÙY CHỌN)" : "STEP 02: NATAL CALIBRATION (OPTIONAL)"}
                  </span>

                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  />

                  {natal && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                        <span className="text-[9px] font-mono text-primary font-bold block">
                          {isVi ? `CUNG · ${natal.symbol}` : `SUN SIGN · ${natal.symbol}`}
                        </span>
                        <span className="font-headline font-bold text-slate-900 block mt-0.5">
                          {isVi ? natal.zodiacVi : natal.zodiacEn}
                        </span>
                      </div>
                      <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                        <span className="text-[9px] font-mono text-primary font-bold block">
                          {isVi ? "SỐ ĐƯỜNG ĐỜI" : "LIFE PATH"}
                        </span>
                        <span className="font-headline font-bold text-slate-900 block mt-0.5">
                          {isVi ? `Số ${natal.lifePathNumber}` : `Number ${natal.lifePathNumber}`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(domainLabels).map((domain) => {
                      const active = focusAreas.includes(domain);
                      const label = isVi ? domainLabels[domain].vi : domainLabels[domain].en;
                      return (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => toggleFocus(domain)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                            active
                              ? "bg-primary text-white font-semibold"
                              : "bg-white border border-[#E2E8F0] text-slate-600"
                          }`}
                        >
                          {label} {active && "✓"}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {isVi ? "Bộ Nhớ Ngữ Cảnh AI" : "AI Contextual Memory"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isVi ? "Hòa quyện cung & số chủ đạo vào luận giải" : "Include Zodiac & Life Path in AI"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowAiContext(!allowAiContext)}
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
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs mt-2 disabled:opacity-60"
            >
              {submitting
                ? isVi
                  ? "Đang xử lý..."
                  : "Processing..."
                : tab === "register"
                ? isVi
                  ? "Đăng Ký & Gửi Email Xác Thực →"
                  : "Register & Verify Email →"
                : isVi
                ? "Đăng Nhập Vào Thánh Địa →"
                : "Sign In to Sanctuary →"}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <Link href="/app/auth/forgot-password" className="text-slate-500 hover:text-primary font-medium">
                {isVi ? "Quên mật khẩu?" : "Forgot password?"}
              </Link>
              <Link href="/app/home" className="text-slate-500 hover:text-primary font-mono underline">
                {isVi ? "Về Trang Chủ" : "Back Home"}
              </Link>
            </div>
          </form>
        )}
      </main>
      <MobileBottomNav activeTab="auth" />
    </div>
  );
}

export default function MobileAuthOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <MobileAuthContent />
    </Suspense>
  );
}
