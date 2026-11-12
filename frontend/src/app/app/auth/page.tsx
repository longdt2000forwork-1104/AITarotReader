"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileAuthOnboardingPage() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [tab, setTab] = useState<"signin" | "register">("register");
  const [displayName, setDisplayName] = useState("Aria Nguyen");
  const [email, setEmail] = useState("aria.nguyen@studio.vn");
  const [password, setPassword] = useState("••••••••••••");
  const [otp, setOtp] = useState("842-190");
  const [birthDate, setBirthDate] = useState("1998-04-12");
  const [focusAreas, setFocusAreas] = useState<string[]>([
    "Creative Ideation",
    "Career & Strategy",
  ]);
  const [allowAiContext, setAllowAiContext] = useState(true);

  const toggleFocus = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else {
      if (focusAreas.length < 3) {
        setFocusAreas([...focusAreas, area]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/app/home");
  };

  const domainLabels: Record<string, { en: string; vi: string }> = {
    "Creative Ideation": { en: "Creative Ideation", vi: "Ý Tưởng Sáng Tạo" },
    "Career & Strategy": { en: "Career & Strategy", vi: "Sự Nghiệp & Chiến Lược" },
    "Relationships": { en: "Relationships", vi: "Mối Quan Hệ" },
    "Personal Growth": { en: "Personal Growth", vi: "Phát Triển Bản Thân" },
  };

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <main className="w-full max-w-[430px] sm:max-w-md bg-[#FAF9F6] min-h-screen flex flex-col relative pb-32 border-x border-[#E2E8F0] shadow-sm overflow-x-hidden">
        {/* Top Header */}
        <header className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-40 w-full gap-2">
          <Link
            href="/app/home"
            className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 -ml-1.5 sm:-ml-2 rounded-lg hover:bg-slate-100 text-xs text-slate-600 hover:text-on-surface font-medium transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>{isVi ? "Thánh Địa" : "Sanctuary"}</span>
          </Link>
          <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
            <span className="material-symbols-outlined text-primary text-base shrink-0">auto_awesome</span>
            <span className="font-headline font-bold text-xs tracking-tight text-slate-900 uppercase truncate">
              {isVi ? "Xác Thực" : "Authentication"}
            </span>
          </div>
          <div className="flex items-center border border-[#E2E8F0] rounded text-[10px] font-mono overflow-hidden shrink-0">
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-1 font-bold ${
                !isVi ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("vi")}
              className={`px-2 py-1 font-bold ${
                isVi ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              VI
            </button>
          </div>
        </header>

        {/* 3. Hero Specimen Card Display */}
        <div className="px-6 pt-5 pb-3 flex items-center gap-4 bg-white border-b border-[#E2E8F0]">
          <div className="w-16 h-22 bg-[#FAF9F6] border border-[#CBD5E1] rounded p-1 flex flex-col items-center justify-between shadow-2xs shrink-0">
            <span className="text-[9px] font-mono font-bold text-slate-500">I</span>
            <span className="material-symbols-outlined text-primary text-2xl">auto_fix_high</span>
            <span className="text-[8px] font-mono text-primary font-bold uppercase">
              {isVi ? "Ảo Thuật" : "Magician"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-0.5">
              {isVi ? "TIÊN TRI CHUẨN MỰC (SCR-M09)" : "CANONICAL ORACLE (SCR-M09)"}
            </span>
            <h1 className="font-headline font-bold text-lg text-slate-900 leading-tight">
              {tab === "register"
                ? isVi
                  ? "Khai Mở Kho Tàng Người Tìm Kiếm"
                  : "Awaken Your Seeker Vault"
                : isVi
                ? "Trở Lại Thánh Địa Huyền Bí"
                : "Return to the Sanctuary"}
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isVi
                ? "Đồng bộ hóa các phiên trải bài, hiệu chuẩn chiêm tinh và số dư crystal."
                : "Synchronize your readings, natal calibrations, and crystal ledger."}
            </p>
          </div>
        </div>

        {/* 4. Segmented Tab Switcher */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setTab("signin")}
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
              onClick={() => setTab("register")}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                tab === "register"
                  ? "bg-white text-slate-900 shadow-xs text-primary"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {isVi ? "02 · Tạo Tài Khoản" : "02 · Create Account"}
            </button>
          </div>
        </div>

        {/* 5. Auth Form */}
        <form onSubmit={handleSubmit} className="px-6 py-3 space-y-4">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => router.push("/app/home")}
            className="w-full py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-center space-x-2.5 shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" fill="#4285F4" />
              <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853" />
              <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
              <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
            </svg>
            <span>{isVi ? "Tiếp tục với Google" : "Continue with Google"}</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-[#E2E8F0]" />
            <span className="absolute bg-[#FAF9F6] px-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
              {isVi ? "Hoặc tiếp tục với email" : "Or continue with email"}
            </span>
          </div>

          {tab === "register" && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                {isVi ? "Tên Hiển Thị" : "Display Name"}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                {isVi ? "Mật Khẩu" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs tracking-widest focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                {isVi ? "Mã Xác Thực OTP" : "OTP Code"}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Onboarding Natal Calibration (When in Register Mode) */}
          {tab === "register" && (
            <div className="pt-2 border-t border-[#E2E8F0] space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                {isVi ? "BƯỚC 02: HIỆU CHUẨN CHIÊM TINH HỌC" : "STEP 02: NATAL CALIBRATION"}
              </span>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                  {isVi
                    ? "Ngày Sinh (Tự động tính Cung Hoàng Đạo & Số Đường Đời)"
                    : "Date of Birth (Calculates Zodiac & Life Path)"}
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Natal Specimen Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                  <span className="text-[9px] font-mono text-primary font-bold block">
                    {isVi ? "CUNG MẶT TRỜI · ♈ BẠCH DƯƠNG" : "SUN SIGN · ♈ ARIES"}
                  </span>
                  <span className="font-headline font-bold text-slate-900 block mt-0.5">
                    {isVi ? "IV Hoàng Đế" : "IV The Emperor"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isVi ? "Ý Chí Khai Phá" : "Cardinal Will"}
                  </span>
                </div>
                <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                  <span className="text-[9px] font-mono text-primary font-bold block">
                    {isVi ? "SỐ ĐƯỜNG ĐỜI · 07" : "LIFE PATH · 07"}
                  </span>
                  <span className="font-headline font-bold text-slate-900 block mt-0.5">
                    {isVi ? "IX Ẩn Sĩ" : "IX The Hermit"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isVi ? "Ngọn Đèn Dẫn Lối" : "Inner Guidance"}
                  </span>
                </div>
              </div>

              {/* Focus Domains */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                  {isVi ? "Lĩnh Vực Trọng Tâm Muốn Thấu Suốt" : "Inquiry Focus Domains"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Creative Ideation",
                    "Career & Strategy",
                    "Relationships",
                    "Personal Growth",
                  ].map((domain) => {
                    const active = focusAreas.includes(domain);
                    const label = isVi ? domainLabels[domain]?.vi || domain : domain;
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => toggleFocus(domain)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                          active
                            ? "bg-primary text-white font-semibold"
                            : "bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {label} {active && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Context Switch */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {isVi ? "Bộ Nhớ Ngữ Cảnh AI" : "AI Contextual Memory"}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block">
                    {isVi
                      ? "Tích hợp Bạch Dương Decan II & LP 7 vào luận giải bài AI"
                      : "Infuse Aries Decan II & LP 7 into AI readings"}
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
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-[#047857] text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs mt-2"
          >
            {tab === "register"
              ? isVi
                ? "Hoàn Tất Đăng Ký & Nhận +15 CR →"
                : "Complete Enrollment & Claim +15 CR →"
              : isVi
              ? "Đăng Nhập Vào Thánh Địa →"
              : "Sign In to Archival Sanctuary →"}
          </button>
        </form>

        {/* 6. Guest Mode Link */}
        <div className="px-6 pt-3 text-center">
          <Link
            href="/app/home"
            className="text-xs text-slate-500 hover:text-primary transition-colors font-mono underline"
          >
            {isVi ? "Tiếp tục với tư cách Khách Vãng Lai →" : "Continue as Guest Seeker →"}
          </Link>
        </div>
      </main>
    </div>
  );
}
