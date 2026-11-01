"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileAuthOnboardingPage() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();

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

  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] font-body min-h-screen flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <main className="w-full max-w-[412px] bg-[#FAF9F6] min-h-screen flex flex-col relative pb-32 border-x border-[#E2E8F0] shadow-sm">
        {/* 1. Android Status Bar */}
        <header className="w-full pt-3 px-6 pb-2 flex justify-between items-center text-slate-800 select-none">
          <span className="font-mono text-xs font-bold">09:41</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="material-symbols-outlined text-[16px]">signal_cellular_4_bar</span>
            <span className="material-symbols-outlined text-[16px]">wifi</span>
            <span className="material-symbols-outlined text-[18px]">battery_full</span>
          </div>
        </header>

        {/* 2. Brand Bar & Language Switch */}
        <div className="px-6 py-2 flex items-center justify-between border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            <span className="font-headline font-bold text-sm tracking-tight text-slate-900 uppercase">
              AITAROT // SANCTUARY
            </span>
          </div>
          <div className="flex items-center border border-[#E2E8F0] rounded text-[11px] font-mono overflow-hidden">
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-0.5 font-bold ${
                locale === "en" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("vi")}
              className={`px-2 py-0.5 font-bold ${
                locale === "vi" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              VI
            </button>
          </div>
        </div>

        {/* 3. Hero Specimen Card Display */}
        <div className="px-6 pt-5 pb-3 flex items-center gap-4 bg-white border-b border-[#E2E8F0]">
          <div className="w-16 h-22 bg-[#FAF9F6] border border-[#CBD5E1] rounded p-1 flex flex-col items-center justify-between shadow-2xs shrink-0">
            <span className="text-[9px] font-mono font-bold text-slate-500">I</span>
            <span className="material-symbols-outlined text-primary text-2xl">auto_fix_high</span>
            <span className="text-[8px] font-mono text-primary font-bold uppercase">Magician</span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block mb-0.5">
              CANONICAL ORACLE (SCR-M09)
            </span>
            <h1 className="font-headline font-bold text-lg text-slate-900 leading-tight">
              {tab === "register" ? "Awaken Your Seeker Vault" : "Return to the Sanctuary"}
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Synchronize your readings, natal calibrations, and crystal ledger.
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
              01 · Sign In
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
              02 · Create Account
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
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-[#E2E8F0]" />
            <span className="absolute bg-[#FAF9F6] px-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
              Or continue with email
            </span>
          </div>

          {tab === "register" && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                Display Name / Tên Hiển Thị
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
              Email Address
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
                Password
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
                OTP Code
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
                STEP 02 // NATAL CALIBRATION
              </span>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                  Date of Birth (Calculates Zodiac & Life Path)
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
                  <span className="text-[9px] font-mono text-primary font-bold block">SUN SIGN · ♈ ARIES</span>
                  <span className="font-headline font-bold text-slate-900 block mt-0.5">IV The Emperor</span>
                  <span className="text-[10px] text-slate-500 font-mono">Cardinal Will</span>
                </div>
                <div className="p-2 bg-white border border-[#E2E8F0] rounded-lg">
                  <span className="text-[9px] font-mono text-primary font-bold block">LIFE PATH · 07</span>
                  <span className="font-headline font-bold text-slate-900 block mt-0.5">IX The Hermit</span>
                  <span className="text-[10px] text-slate-500 font-mono">Inner Guidance</span>
                </div>
              </div>

              {/* Focus Domains */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                  Inquiry Focus Domains
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Creative Ideation",
                    "Career & Strategy",
                    "Relationships",
                    "Personal Growth",
                  ].map((domain) => {
                    const active = focusAreas.includes(domain);
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
                        {domain} {active && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Context Switch */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">AI Contextual Memory</span>
                  <span className="text-[10px] text-slate-500 leading-tight block">
                    Infuse Aries Decan II & LP 7 into AI readings
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
              ? "Complete Enrollment & Claim +15 CR →"
              : "Sign In to Archival Sanctuary →"}
          </button>
        </form>

        {/* 6. Guest Mode Link */}
        <div className="px-6 pt-3 text-center">
          <Link
            href="/app/home"
            className="text-xs text-slate-500 hover:text-primary transition-colors font-mono underline"
          >
            Continue as Guest Seeker →
          </Link>
        </div>
      </main>
    </div>
  );
}
