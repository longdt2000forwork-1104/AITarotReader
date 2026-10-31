"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthOnboardingPage() {
  const { locale, setLocale } = useLanguage();
  const [tab, setTab] = useState<"signin" | "register">("register");
  const [displayName, setDisplayName] = useState("Aria M. Nguyen");
  const [email, setEmail] = useState("aria.nguyen@studio.vn");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("842-190");
  
  // Natal blueprint state
  const [day, setDay] = useState(12);
  const [month, setMonth] = useState(4);
  const [year, setYear] = useState(1998);
  const [focusAreas, setFocusAreas] = useState<string[]>([
    "Creative Ideation",
    "Career & Strategy",
  ]);
  const [aiContextEnabled, setAiContextEnabled] = useState(true);

  const toggleFocus = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else {
      if (focusAreas.length < 3) {
        setFocusAreas([...focusAreas, area]);
      }
    }
  };

  const domainOptions = [
    "Creative Ideation",
    "Career & Strategy",
    "Relationships & Harmony",
    "Personal Growth",
    "Financial Clarity",
  ];

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] antialiased min-h-screen flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Top Global Utility Bar (SCR-W07 Header) */}
      <header className="w-full h-14 bg-white border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between z-30 select-none">
        {/* Left Identity Cluster */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" opacity="0.9" />
              <circle cx="12" cy="12" fill="#FAF9F6" r="2.5" />
            </svg>
            <span className="font-headline font-bold text-sm tracking-tight text-[#0F172A] uppercase">
              AITAROT // ARCHIVE & ORACLE
            </span>
          </Link>
          <span className="text-slate-300">|</span>
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-primary">SCR-W07</span>
            <span className="text-slate-400">· AUTHENTICATION & MYSTIC ONBOARDING</span>
          </div>
        </div>

        {/* Right Utility Cluster */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center border border-outline-variant rounded bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                locale === "en" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              EN
            </button>
            <button
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
            <span>Back to Editorial Portal</span>
          </Link>
        </div>
      </header>

      {/* 2. Main Body: 2-Column Desktop Split Screen (1280px container layout) */}
      <main className="w-full flex-1 max-w-[1440px] mx-auto grid grid-cols-12 min-h-[calc(100vh-56px)] bg-[#FAF9F6]">
        {/* LEFT COLUMN: Authentic Enrollment & OAuth Vault */}
        <section className="col-span-12 lg:col-span-5 bg-white border-r border-[#E2E8F0] p-6 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Segmented Tab Switcher */}
            <nav className="flex items-center space-x-8 border-b border-[#E2E8F0] pb-3 mb-8">
              <button
                type="button"
                onClick={() => setTab("signin")}
                className={`text-xs uppercase tracking-wider font-semibold pb-2 transition-colors cursor-pointer relative ${
                  tab === "signin" ? "text-primary" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                01 · Sign In (Đăng Nhập)
                {tab === "signin" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                className={`text-xs uppercase tracking-wider font-semibold pb-2 transition-colors cursor-pointer relative ${
                  tab === "register" ? "text-primary" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                02 · Create Account (Đăng Ký)
                {tab === "register" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </nav>

            {/* Editorial Headline */}
            <div className="mb-6">
              <h1 className="font-headline text-2xl lg:text-3xl text-[#0F172A] mb-2 font-normal">
                {tab === "register"
                  ? "Enter the Archival Sanctuary"
                  : "Welcome Back, Seeker"}
              </h1>
              <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
                Synchronize your Tarot Journal, unlocked 78-card editions, and Crystal Ledger across Web & Android.
              </p>
            </div>

            {/* Google OAuth 2.0 Button */}
            <button
              type="button"
              className="w-full py-3 px-4 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 text-[#0F172A] text-xs font-medium shadow-xs mb-5 group cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" fill="#4285F4" />
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853" />
                <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
              </svg>
              <span className="group-hover:text-primary transition-colors">Continue with Google (OAuth 2.0)</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-[#E2E8F0]" />
              <span className="absolute bg-white px-3 text-[10px] uppercase tracking-widest text-slate-400 font-mono font-semibold">
                Or enroll with email & 6-digit OTP
              </span>
            </div>

            {/* Form Fields */}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {tab === "register" && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                    Display Name / Tên Hiển Thị
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">person</span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Enter your sanctuary alias"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    placeholder="you@domain.com"
                  />
                  <span className="absolute right-3.5 material-symbols-outlined text-primary text-[18px]">check_circle</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                    Password / Mật Khẩu
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600">
                      6-Digit OTP
                    </label>
                    <span className="text-[10px] text-primary font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Verified ✓
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <span className="absolute right-2 text-[10px] text-slate-400 font-mono">00:48</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#047857] text-white py-3.5 px-6 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer group"
                >
                  <span>
                    {tab === "register"
                      ? "Complete Enrollment & Claim +15 Welcome Credits"
                      : "Sign In to Archival Sanctuary"}
                  </span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-600">
              <span
                onClick={() => setTab(tab === "register" ? "signin" : "register")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                {tab === "register" ? (
                  <>
                    Already registered? <strong className="text-slate-900 underline font-semibold">Sign In</strong>
                  </>
                ) : (
                  <>
                    New Seeker? <strong className="text-slate-900 underline font-semibold">Create Sanctuary Account</strong>
                  </>
                )}
              </span>
              <span className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                Forgot Password?
              </span>
            </div>
          </div>

          {/* Trust Stamp */}
          <div className="pt-8 text-[11px] text-slate-400 flex items-start space-x-2">
            <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0 mt-0.5">verified_user</span>
            <p className="leading-tight">
              End-to-end encrypted mystic vault. Zero advertising telemetry. RWS 1909 canonical alignment.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Mystic Profile & Natal Blueprint Calibration */}
        <section className="col-span-12 lg:col-span-7 bg-[#FAF9F6] p-6 lg:p-12 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-primary uppercase">
                  STEP 02 // PERSONAL MYSTIC PROFILE (FR-1.2 & FR-1.3)
                </span>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border border-slate-200">
                LIVE NATAL CALIBRATION
              </span>
            </div>

            <div>
              <h2 className="font-headline text-2xl text-[#0F172A] mb-1">
                Personal Natal & Inquiry Blueprint
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Used by the AI Synthesis Engine to harmonize card archetypes and reading interpretations with your celestial and numerological rhythm.
              </p>
            </div>

            {/* Interactive Birth Calibration Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono font-semibold tracking-wider text-[#0F172A] uppercase flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                  <span>Date of Birth (DD / MM / YYYY) & Natal Ascendant</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">UTC+07:00</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Day */}
                <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                  <span className="block text-[10px] font-mono uppercase font-semibold text-slate-500 mb-0.5">Day / Ngày</span>
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-xl text-[#0F172A] font-bold">{day}</span>
                    <span className="text-xs text-primary font-medium">Aries Decan II</span>
                  </div>
                </div>
                {/* Month */}
                <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                  <span className="block text-[10px] font-mono uppercase font-semibold text-slate-500 mb-0.5">Month / Tháng</span>
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-xl text-[#0F172A] font-bold">0{month}</span>
                    <span className="text-xs text-slate-600">April</span>
                  </div>
                </div>
                {/* Year */}
                <div className="p-3 bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg">
                  <span className="block text-[10px] font-mono uppercase font-semibold text-slate-500 mb-0.5">Year / Năm</span>
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-xl text-[#0F172A] font-bold">{year}</span>
                    <span className="text-xs text-slate-500 font-mono">Tiger · Hổ</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                  <span>Time of Birth: <strong className="text-slate-900 font-semibold">04:15 ICT</strong> (Indochina Time)</span>
                </div>
                <span className="text-primary hover:underline cursor-pointer font-medium">
                  Refine Natal House & Coordinates →
                </span>
              </div>
            </div>

            {/* 2 Side-by-Side Architectural Specimen Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: Sun Sign Aries / IV The Emperor */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex space-x-4 items-stretch shadow-xs relative overflow-hidden">
                <div className="w-20 h-28 flex-shrink-0 bg-[#FAF9F6] rounded border border-[#E2E8F0] p-1 flex items-center justify-center">
                  <svg className="w-full h-full text-[#1A1C1A]" fill="none" stroke="currentColor" viewBox="0 0 80 110">
                    <rect fill="#FAF9F6" height="106" rx="2" stroke="#6D7A72" strokeWidth="0.8" width="76" x="2" y="2" />
                    <rect height="101" stroke="#BCCAC0" strokeWidth="0.5" width="71" x="4.5" y="4.5" />
                    <path d="M6 55 L24 24 L42 55 L58 32 L74 55 Z" fill="#E3E2E0" stroke="#6D7A72" strokeWidth="0.7" />
                    <path d="M18 52 L62 52 L60 98 L20 98 Z" fill="#FAF9F6" stroke="#1A1C1A" strokeWidth="0.9" />
                    <path d="M30 46 Q40 40 50 46 L53 88 L27 88 Z" fill="#006948" fillOpacity="0.12" stroke="#1A1C1A" strokeWidth="0.8" />
                    <path d="M35 34 L37 28 L40 33 L43 28 L45 34 Z" fill="#8D4B00" stroke="#1A1C1A" strokeWidth="0.7" />
                    <line stroke="#8D4B00" strokeWidth="1.2" x1="28" x2="28" y1="56" y2="78" />
                    <circle cx="28" cy="54" fill="#FAF9F6" r="3" stroke="#8D4B00" strokeWidth="1" />
                    <circle cx="52" cy="66" fill="#8D4B00" fillOpacity="0.3" r="3.5" stroke="#8D4B00" strokeWidth="1" />
                    <text fill="#1A1C1A" fontFamily="Newsreader, serif" fontSize="7" fontWeight="bold" stroke="none" textAnchor="middle" x="40" y="14">IV</text>
                    <text fill="#6D7A72" fontFamily="Be Vietnam Pro, sans-serif" fontSize="4.5" fontWeight="600" stroke="none" textAnchor="middle" x="40" y="103">THE EMPEROR</text>
                  </svg>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">SUN SIGN · ♈ ARIES</span>
                      <span className="text-[10px] text-slate-400 font-mono">DECAN II</span>
                    </div>
                    <h3 className="font-headline text-[16px] text-slate-900 leading-tight mb-1 font-bold">
                      Bạch Dương · The Initiator
                    </h3>
                    <p className="text-[11px] text-slate-600 mb-2">
                      Element: <span className="font-medium text-slate-900">Fire (Cardinal)</span> • Ruler: <span className="font-medium text-slate-900">Mars</span>
                    </p>
                  </div>
                  <div className="p-2 bg-[#FAF9F6] border border-[#E2E8F0] rounded text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Tarot Key: <strong className="text-slate-900 font-semibold">IV The Emperor</strong></span>
                    <span className="text-primary font-bold">Cardinal Will</span>
                  </div>
                </div>
              </div>

              {/* Card B: Life Path 07 / IX The Hermit */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex space-x-4 items-stretch shadow-xs relative overflow-hidden">
                <div className="w-20 h-28 flex-shrink-0 bg-[#FAF9F6] rounded border border-[#E2E8F0] p-1 flex items-center justify-center">
                  <svg className="w-full h-full text-[#1A1C1A]" fill="none" stroke="currentColor" viewBox="0 0 80 110">
                    <rect fill="#FAF9F6" height="106" rx="2" stroke="#6D7A72" strokeWidth="0.8" width="76" x="2" y="2" />
                    <rect height="101" stroke="#BCCAC0" strokeWidth="0.5" width="71" x="4.5" y="4.5" />
                    <path d="M12 96 L35 72 L58 84 L72 96 Z" fill="#E3E2E0" stroke="#6D7A72" strokeWidth="0.8" />
                    <path d="M38 32 C34 32 30 42 28 65 L48 90 L52 65 Z" fill="#565E74" fillOpacity="0.12" stroke="#1A1C1A" strokeWidth="0.8" />
                    <path d="M38 28 C34 28 32 34 35 38 C37 40 42 39 42 34 C42 29 40 28 38 28 Z" fill="#FAF9F6" stroke="#1A1C1A" strokeWidth="0.8" />
                    <line stroke="#8D4B00" strokeWidth="1.2" x1="27" x2="22" y1="38" y2="88" />
                    <path d="M50 36 L55 36 L57 47 L48 47 Z" fill="#FAF9F6" stroke="#1A1C1A" strokeWidth="0.7" />
                    <path d="M52.5 39 L54.5 44 L50.5 44 Z" fill="#8D4B00" stroke="#8D4B00" strokeWidth="0.4" />
                    <path d="M52.5 45 L54.5 40 L50.5 40 Z" fill="#8D4B00" stroke="#8D4B00" strokeWidth="0.4" />
                    <text fill="#1A1C1A" fontFamily="Newsreader, serif" fontSize="7" fontWeight="bold" stroke="none" textAnchor="middle" x="40" y="14">IX</text>
                    <text fill="#6D7A72" fontFamily="Be Vietnam Pro, sans-serif" fontSize="4.5" fontWeight="600" stroke="none" textAnchor="middle" x="40" y="103">THE HERMIT</text>
                  </svg>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">LIFE PATH · 07</span>
                      <span className="text-[10px] text-slate-400 font-mono">(1+2)+4+9=16→7</span>
                    </div>
                    <h3 className="font-headline text-[16px] text-slate-900 leading-tight mb-1 font-bold">
                      Số 7 · The Seeker
                    </h3>
                    <p className="text-[11px] text-slate-600 mb-2">
                      Trí Tuệ & Chiêm Nghiệm • Archetype: <span className="font-medium text-slate-900">Mystic Analyst</span>
                    </p>
                  </div>
                  <div className="p-2 bg-[#FAF9F6] border border-[#E2E8F0] rounded text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Tarot Key: <strong className="text-slate-900 font-semibold">IX The Hermit</strong></span>
                    <span className="text-primary font-bold">Inner Lantern</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Focus Domain Selector */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono font-semibold tracking-wider text-[#0F172A] uppercase flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">filter_center_focus</span>
                  <span>Primary Inquiry Focus (Select 1–3 Domains)</span>
                </label>
                <span className="text-xs text-slate-400">Customizes Prompt Engine & Spreads</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {domainOptions.map((domain) => {
                  const active = focusAreas.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleFocus(domain)}
                      className={`py-2 px-3.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                        active
                          ? "bg-primary text-white shadow-xs"
                          : "bg-[#FAF9F6] border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span>{domain}</span>
                      {active && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
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
                    AI Mystic Context Memory (FR-1.3)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                    Allow AI Tarot Master to weave your Zodiac (Aries) and Life Path (7) into spread syntheses and recurring &ldquo;stalker card&rdquo; alert patterns.
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

          {/* Bottom Subtext / Status Bar */}
          <div className="pt-6 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Engine: GPT-4o & Claude 3.5 Sonnet RWS 1909 Hybrid Calibrator</span>
            </div>
            <div>
              SESSION_ID: <span className="text-slate-900 font-semibold">SANCTUARY-VN-980412</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
