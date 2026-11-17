"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { authApi } from "@/services/authApi";
import { isValidEmail } from "@/utils/authValidation";

interface ForgotPasswordViewProps {
  platform: "web" | "app";
}

export default function ForgotPasswordView({ platform }: ForgotPasswordViewProps) {
  const { locale } = useLanguage();
  const isVi = locale === "vi";
  const authBase = platform === "app" ? "/app/auth" : "/auth";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!isValidEmail(email)) {
      setErrorMsg(isVi ? "Vui lòng nhập địa chỉ email hợp lệ." : "Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    const res = await authApi.forgotPassword(email.trim(), platform, locale);
    setSubmitting(false);

    if (!res.ok && res.status === 429) {
      setErrorMsg(
        isVi
          ? "Bạn đã yêu cầu quá nhiều lần. Vui lòng đợi vài phút rồi thử lại."
          : "Too many requests. Please wait a few minutes and try again."
      );
      return;
    }

    setSubmittedMsg(
      isVi
        ? "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu (có hiệu lực 30 phút)."
        : "If an account exists with that email, we have sent a password reset link (valid for 30 minutes)."
    );
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs w-full max-w-md mx-auto">
      <div className="flex items-center space-x-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
          {isVi ? "KHÔI PHỤC MẬT KHẨU" : "PASSWORD RECOVERY"}
        </span>
      </div>

      <h1 className="font-headline font-bold text-2xl text-slate-900 mb-2">
        {isVi ? "Quên Mật Khẩu?" : "Forgot Your Password?"}
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
        {isVi
          ? "Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu an toàn một lần."
          : "Enter your registered email address and we will send a secure one-time password reset link."}
      </p>

      {submittedMsg ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 leading-relaxed">
            {submittedMsg}
          </div>
          <Link
            href={authBase}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#047857] text-white py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>{isVi ? "Quay Lại Đăng Nhập" : "Back to Sign In"}</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
              {isVi ? "Địa Chỉ Email" : "Email Address"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-[#047857] text-white py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {submitting
              ? isVi
                ? "Đang gửi liên kết..."
                : "Sending link..."
              : isVi
              ? "Gửi Liên Kết Đặt Lại Mật Khẩu"
              : "Send Reset Link"}
          </button>

          <div className="pt-2 text-center">
            <Link href={authBase} className="text-xs text-slate-500 hover:text-primary transition-colors">
              {isVi ? "← Quay lại Đăng Nhập" : "← Back to Sign In"}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
