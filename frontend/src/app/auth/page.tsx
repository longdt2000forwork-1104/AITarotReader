"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/authApi";
import GoogleSignInButton from "@/components/GoogleSignInButton";
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

function WebAuthContent() {
  const { locale, setLocale } = useLanguage();
  const { user, status, login, register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = sanitizeNextUrl(searchParams.get("next"), "/");
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
  const [aiContextEnabled, setAiContextEnabled] = useState(true);

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

  const domainOptions = [
    { id: "Creative Ideation", labelEn: "Creative Ideation", labelVi: "Ý Tưởng Sáng Tạo" },
    { id: "Career & Strategy", labelEn: "Career & Strategy", labelVi: "Sự Nghiệp & Chiến Lược" },
    { id: "Relationships & Harmony", labelEn: "Relationships & Harmony", labelVi: "Mối Quan Hệ & Gắn Kết" },
    { id: "Personal Growth", labelEn: "Personal Growth", labelVi: "Phát Triển Bản Thân" },
    { id: "Financial Clarity", labelEn: "Financial Clarity", labelVi: "Tài Chính & Định Hướng" },
  ];

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
            ? "Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư hoặc gửi lại liên kết xác thực."
            : "Your email is not verified yet. Please check your inbox or resend the verification email."
        );
      } else if (res.code === "ERR_TOO_MANY_REQUESTS" || res.status === 429) {
        setErrorMsg(
          isVi
            ? "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi vài phút."
            : "Too many login attempts. Please wait a few minutes."
        );
      } else {
        setErrorMsg(
          isVi
            ? "Email hoặc mật khẩu không chính xác."
            : "Invalid email or password."
        );
      }
      return;
    }

    // Register mode
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
      setErrorMsg(
        isVi ? "Mật khẩu xác nhận không khớp." : "Passwords do not match."
      );
      return;
    }

    setSubmitting(true);
    const res = await register({
      email: trimmedEmail,
      password,
      displayName: displayName.trim(),
      birthDate: birthDate || undefined,
      focusAreas,
      allowAiContext: aiContextEnabled,
      locale,
      platform: "web",
    });
    setSubmitting(false);

    if (res.ok) {
      setRegisterSuccessEmail(trimmedEmail);
      return;
    }

    if (res.code === "ERR_USER_EXISTS" || res.status === 409) {
      setErrorMsg(
        isVi
          ? "Email này đã được đăng ký. Vui lòng chuyển sang Đăng Nhập hoặc dùng Quên Mật Khẩu."
          : "This email is already registered. Please sign in or reset your password."
      );
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (resending) return;
    setResending(true);
    setResendMessage(null);
    const res = await authApi.resendVerification(targetEmail, "web", locale);
    setResending(false);
    setResendMessage(
      res.ok
        ? isVi
          ? "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư (kể cả mục Spam)."
          : "Verification email sent. Please check your inbox and spam folder."
        : res.message
    );
  };

  const handleGoogleIdToken = async (idToken: string) => {
    setErrorMsg(null);
    setSubmitting(true);
    const res = await loginWithGoogle(idToken, "web", locale);
    setSubmitting(false);
    if (res.ok) {
      router.replace(nextUrl);
    } else {
      setErrorMsg(
        res.message ||
          (isVi ? "Đăng nhập Google thất bại." : "Google authentication failed.")
      );
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] antialiased min-h-screen flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Top Global Utility Bar (SCR-W07 Header) */}
      <header className="w-full h-14 bg-white border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between z-30 select-none">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" opacity="0.9" />
              <circle cx="12" cy="12" fill="#FAF9F6" r="2.5" />
            </svg>
            <span className="font-headline font-bold text-sm tracking-tight text-[#0F172A] uppercase">
              AITAROT · {isVi ? "LƯU TRỮ & CHIÊM BÁI" : "ARCHIVE & ORACLE"}
            </span>
          </Link>
          <span className="text-slate-300">|</span>
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-primary">SCR-W07</span>
            <span className="text-slate-400">
              · {isVi ? "XÁC THỰC & KHỞI TẠO HỒ SƠ" : "AUTHENTICATION & MYSTIC ONBOARDING"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center border border-outline-variant rounded bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                locale === "en" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("vi")}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                locale === "vi" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              VI
            </button>
          </div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-slate-700 hover:text-primary transition-colors font-medium text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>{isVi ? "Về Trang Chủ" : "Back to Editorial Portal"}</span>
          </Link>
        </div>
      </header>

      {/* 2. Main Body: 2-Column Desktop Split Screen */}
      <main className="w-full flex-1 max-w-[1440px] mx-auto grid grid-cols-12 min-h-[calc(100vh-56px)] bg-[#FAF9F6]">
        {/* LEFT COLUMN: Authentication & OAuth Vault */}
        <section className="col-span-12 lg:col-span-5 bg-white border-r border-[#E2E8F0] p-6 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Segmented Tab Switcher */}
            <nav className="flex items-center space-x-8 border-b border-[#E2E8F0] pb-3 mb-8">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setErrorMsg(null);
                  setRegisterSuccessEmail(null);
                }}
                className={`text-xs uppercase tracking-wider font-semibold pb-2 transition-colors cursor-pointer relative ${
                  tab === "signin" ? "text-primary" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isVi ? "01 · Đăng Nhập" : "01 · Sign In"}
                {tab === "signin" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setErrorMsg(null);
                  setNeedsVerificationEmail(null);
                }}
                className={`text-xs uppercase tracking-wider font-semibold pb-2 transition-colors cursor-pointer relative ${
                  tab === "register" ? "text-primary" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isVi ? "02 · Đăng Ký Tài Khoản" : "02 · Create Account"}
                {tab === "register" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </nav>

            {/* Editorial Headline */}
            <div className="mb-6">
              <h1 className="font-headline text-2xl lg:text-3xl text-[#0F172A] mb-2 font-normal">
                {tab === "register"
                  ? isVi
                    ? "Bước Vào Thánh Địa Lưu Trữ"
                    : "Enter the Archival Sanctuary"
                  : isVi
                  ? "Chào Mừng Trở Lại, Người Tìm Kiếm"
                  : "Welcome Back, Seeker"}
              </h1>
              <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
                {isVi
                  ? "Đồng bộ Nhật Ký Tarot, lá bài hàng ngày và ví Tinh Thể trên mọi thiết bị Web & Di Động."
                  : "Synchronize your Tarot Journal, daily draws, and Crystal Ledger across Web & Android."}
              </p>
            </div>

            {registerSuccessEmail ? (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">mark_email_read</span>
                  <div className="space-y-1">
                    <h2 className="font-headline font-bold text-lg text-slate-900">
                      {isVi ? "Kiểm Tra Hộp Thư Email" : "Check Your Email Inbox"}
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {isVi
                        ? `Chúng tôi đã gửi liên kết xác thực tới ${registerSuccessEmail}. Vui lòng mở liên kết để kích hoạt tài khoản trước khi đăng nhập.`
                        : `We sent a verification link to ${registerSuccessEmail}. Please open it to activate your account before signing in.`}
                    </p>
                  </div>
                </div>
                {resendMessage && (
                  <p className="text-xs text-primary font-medium bg-white border border-emerald-200 rounded-lg p-2.5">
                    {resendMessage}
                  </p>
                )}
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => handleResendVerification(registerSuccessEmail)}
                    className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 transition-colors disabled:opacity-50"
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
                    className="px-4 py-2 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {isVi ? "Chuyển Sang Đăng Nhập" : "Go to Sign In"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Google OAuth 2.0 Button */}
                <div className="mb-5">
                  <GoogleSignInButton
                    locale={locale}
                    disabled={submitting}
                    onIdToken={handleGoogleIdToken}
                    onError={(msg) => setErrorMsg(msg)}
                  />
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="w-full border-t border-[#E2E8F0]" />
                  <span className="absolute bg-white px-3 text-[10px] uppercase tracking-widest text-slate-400 font-mono font-semibold">
                    {isVi ? "Hoặc sử dụng Email & Mật Khẩu" : "Or continue with Email & Password"}
                  </span>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-2">
                    <p>{errorMsg}</p>
                    {needsVerificationEmail && (
                      <button
                        type="button"
                        disabled={resending}
                        onClick={() => handleResendVerification(needsVerificationEmail)}
                        className="inline-flex items-center gap-1 font-semibold underline text-rose-900 hover:text-primary"
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
                    {resendMessage && (
                      <p className="text-primary font-medium">{resendMessage}</p>
                    )}
                  </div>
                )}

                {/* Form Fields */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {tab === "register" && (
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                        {isVi ? "Tên Hiển Thị Của Bạn" : "Display Name"}
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">person</span>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                          placeholder={isVi ? "Nhập tên hoặc biệt danh của bạn" : "Enter your display name"}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                      {isVi ? "Địa Chỉ Email" : "Email Address"}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        placeholder="you@domain.com"
                      />
                      {isValidEmail(email) && (
                        <span className="absolute right-3.5 material-symbols-outlined text-primary text-[18px]">
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                      {isVi ? "Mật Khẩu" : "Password"}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={tab === "register" ? 8 : 1}
                        autoComplete={tab === "register" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={tab === "register" ? (isVi ? "Tối thiểu 8 ký tự" : "At least 8 characters") : "••••••••"}
                        className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-700"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {tab === "register" && password.length > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono">
                        <span className={pwdCheck.minLength ? "text-primary" : "text-amber-700"}>
                          {pwdCheck.minLength
                            ? isVi
                              ? "✓ Đạt tối thiểu 8 ký tự"
                              : "✓ At least 8 characters"
                            : isVi
                            ? "Cần tối thiểu 8 ký tự"
                            : "Minimum 8 characters required"}
                        </span>
                        <span className="text-slate-400">
                          {pwdCheck.hasLetter && pwdCheck.hasNumber
                            ? isVi
                              ? "Mạnh"
                              : "Strong"
                            : isVi
                            ? "Nên có chữ & số"
                            : "Mix letters & numbers"}
                        </span>
                      </div>
                    )}
                  </div>

                  {tab === "register" && (
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                        {isVi ? "Xác Nhận Mật Khẩu" : "Confirm Password"}
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={isVi ? "Nhập lại mật khẩu" : "Re-enter password"}
                          className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        {confirmPassword.length > 0 && passwordsMatch(password, confirmPassword) && (
                          <span className="absolute right-3.5 material-symbols-outlined text-primary text-[18px]">
                            check_circle
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary hover:bg-[#047857] text-white py-3.5 px-6 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer group disabled:opacity-60"
                    >
                      <span>
                        {submitting
                          ? isVi
                            ? "Đang xử lý..."
                            : "Processing..."
                          : tab === "register"
                          ? isVi
                            ? "Đăng Ký & Gửi Email Xác Thực"
                            : "Create Account & Send Verification"
                          : isVi
                          ? "Đăng Nhập Vào Thánh Địa"
                          : "Sign In to Archival Sanctuary"}
                      </span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      setTab(tab === "register" ? "signin" : "register");
                      setErrorMsg(null);
                    }}
                    className="hover:text-primary cursor-pointer transition-colors text-left"
                  >
                    {tab === "register" ? (
                      <>
                        {isVi ? "Đã có tài khoản?" : "Already registered?"}{" "}
                        <strong className="text-slate-900 underline font-semibold">
                          {isVi ? "Đăng Nhập" : "Sign In"}
                        </strong>
                      </>
                    ) : (
                      <>
                        {isVi ? "Người tìm kiếm mới?" : "New Seeker?"}{" "}
                        <strong className="text-slate-900 underline font-semibold">
                          {isVi ? "Tạo Tài Khoản Mới" : "Create Account"}
                        </strong>
                      </>
                    )}
                  </button>
                  <Link
                    href="/auth/forgot-password"
                    className="text-slate-500 hover:text-primary transition-colors font-medium"
                  >
                    {isVi ? "Quên Mật Khẩu?" : "Forgot Password?"}
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Trust Stamp */}
          <div className="pt-8 text-[11px] text-slate-400 flex items-start space-x-2">
            <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0 mt-0.5">verified_user</span>
            <p className="leading-tight">
              {isVi
                ? "Phiên đăng nhập bảo vệ bằng cookie HttpOnly & chuẩn mã hóa Supabase PostgreSQL."
                : "Sessions protected via HttpOnly cookies and encrypted Supabase PostgreSQL storage."}
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Mystic Profile & Natal Blueprint Calibration */}
        <section className="col-span-12 lg:col-span-7 bg-[#FAF9F6] p-6 lg:p-12 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-primary uppercase">
                  {isVi ? "BƯỚC 02: HỒ SƠ CHIÊM TINH CÁ NHÂN" : "STEP 02: PERSONAL MYSTIC PROFILE"}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border border-slate-200">
                {isVi ? "HIỆU CHUẨN TRỰC TIẾP" : "LIVE NATAL CALIBRATION"}
              </span>
            </div>

            <div>
              <h2 className="font-headline text-2xl text-[#0F172A] mb-1">
                {isVi ? "Bản Đồ Ngày Sinh & Định Hướng Chiêm Nghiệm" : "Personal Natal & Inquiry Blueprint"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {isVi
                  ? "Thông tin ngày sinh và lĩnh vực trọng tâm sẽ được lưu kèm khi đăng ký để cá nhân hóa các bài luận giải Tarot."
                  : "Your birth date and inquiry focus are saved on registration to personalize your AI Tarot synthesis."}
              </p>
            </div>

            {/* Interactive Birth Calibration Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold tracking-wider text-[#0F172A] uppercase flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                  <span>{isVi ? "Ngày Sinh Của Bạn (Tùy chọn)" : "Date of Birth (Optional)"}</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">UTC+07:00</span>
              </div>

              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full sm:w-64 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />

              {natal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl p-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono block mb-1">
                      {isVi ? `CUNG MẶT TRỜI · ${natal.symbol}` : `SUN SIGN · ${natal.symbol}`}
                    </span>
                    <h3 className="font-headline text-lg text-slate-900 font-bold">
                      {isVi ? natal.zodiacVi : natal.zodiacEn}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {isVi ? `Nguyên tố: ${natal.elementVi}` : `Element: ${natal.elementEn}`}
                    </p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#E2E8F0] rounded-xl p-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono block mb-1">
                      {isVi ? "SỐ ĐƯỜNG ĐỜI" : "LIFE PATH NUMBER"}
                    </span>
                    <h3 className="font-headline text-lg text-slate-900 font-bold">
                      {isVi ? `Con Số ${natal.lifePathNumber}` : `Number ${natal.lifePathNumber}`}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {isVi ? "Tự động tính từ ngày sinh" : "Calculated automatically from birth date"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Inquiry Focus Domain Selector */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono font-semibold tracking-wider text-[#0F172A] uppercase flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">filter_center_focus</span>
                  <span>{isVi ? "Lĩnh Vực Trọng Tâm (Chọn 1–3)" : "Primary Inquiry Focus (Select 1–3)"}</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {domainOptions.map((domain) => {
                  const active = focusAreas.includes(domain.id);
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => toggleFocus(domain.id)}
                      className={`py-2 px-3.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                        active
                          ? "bg-primary text-white shadow-xs"
                          : "bg-[#FAF9F6] border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span>{isVi ? domain.labelVi : domain.labelEn}</span>
                      {active && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Context Guardrail Toggle */}
            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4.5 flex items-center justify-between">
              <div className="flex items-start space-x-3 pr-4">
                <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">psychology</span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 font-mono uppercase tracking-wider">
                    {isVi ? "Ký Ức Ngữ Cảnh Huyền Học AI (FR-1.3)" : "AI Mystic Context Memory (FR-1.3)"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                    {isVi
                      ? "Cho phép AI Tarot kết nối Cung hoàng đạo và Số Đường Đời của bạn vào các bài luận giải."
                      : "Allow AI Tarot Reader to weave your Zodiac and Life Path into spread syntheses."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiContextEnabled(!aiContextEnabled)}
                className="relative inline-flex items-center cursor-pointer flex-shrink-0"
              >
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    aiContextEnabled ? "bg-primary" : "bg-slate-300"
                  }`}
                />
                <div
                  className={`absolute w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                    aiContextEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{isVi ? "Chuẩn mực lưu trữ RWS 1909" : "RWS 1909 Canonical Archive"}</span>
            </div>
            <span>SCR-W07</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AuthOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <WebAuthContent />
    </Suspense>
  );
}
