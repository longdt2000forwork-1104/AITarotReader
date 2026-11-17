"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { authApi } from "@/services/authApi";

interface VerifyEmailViewProps {
  platform: "web" | "app";
}

export default function VerifyEmailView({ platform }: VerifyEmailViewProps) {
  const { locale } = useLanguage();
  const isVi = locale === "vi";
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const authBase = platform === "app" ? "/app/auth" : "/auth";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let active = true;
    async function runVerify() {
      if (!token) {
        if (active) {
          setStatus("error");
          setErrorMsg(
            isVi
              ? "Thiếu mã xác thực trong liên kết. Vui lòng kiểm tra lại email của bạn."
              : "Verification token is missing from the link."
          );
        }
        return;
      }

      const res = await authApi.verifyEmail(token);
      if (!active) return;

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(
          res.code === "ERR_TOKEN_EXPIRED_OR_USED"
            ? isVi
              ? "Liên kết xác thực đã hết hạn hoặc đã được sử dụng trước đó."
              : "This verification link has expired or has already been used."
            : res.message
        );
      }
    }

    runVerify();
    return () => {
      active = false;
    };
  }, [token, isVi]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim() || resending) return;
    setResending(true);
    setResendMsg(null);
    const res = await authApi.resendVerification(resendEmail.trim(), platform, locale);
    setResending(false);
    setResendMsg(
      res.ok
        ? isVi
          ? "Nếu tài khoản tồn tại và chưa xác thực, email mới đã được gửi."
          : "If the account exists and is unverified, a new verification email has been sent."
        : res.message
    );
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs w-full max-w-md mx-auto">
      <div className="flex items-center space-x-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
          {isVi ? "XÁC THỰC EMAIL" : "EMAIL VERIFICATION"}
        </span>
      </div>

      {status === "verifying" && (
        <div className="py-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-medium">
            {isVi ? "Đang xác thực địa chỉ email của bạn..." : "Verifying your email address..."}
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-slate-900">
            {isVi ? "Email Đã Được Xác Thực" : "Email Verified"}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isVi
              ? "Tài khoản của bạn đã sẵn sàng. Bạn có thể đăng nhập để bắt đầu lật bài và lưu trữ nhật ký."
              : "Your account is active. You can now sign in to flip your daily card and save readings."}
          </p>
          <Link
            href={authBase}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#047857] text-white py-3 px-5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>{isVi ? "Đăng Nhập Ngay" : "Sign In Now"}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined text-2xl">error_outline</span>
          </div>
          <h1 className="font-headline font-bold text-xl text-slate-900">
            {isVi ? "Không Thể Xác Thực Email" : "Verification Failed"}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg p-3">
            {errorMsg}
          </p>

          <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-[#E2E8F0]">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600">
              {isVi ? "Gửi lại email xác thực" : "Resend verification email"}
            </label>
            <input
              type="email"
              required
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button
              type="submit"
              disabled={resending}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {resending
                ? isVi
                  ? "Đang gửi..."
                  : "Sending..."
                : isVi
                ? "Gửi Lại Liên Kết Xác Thực"
                : "Resend Verification Link"}
            </button>
            {resendMsg && (
              <p className="text-xs text-primary bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                {resendMsg}
              </p>
            )}
          </form>

          <div className="pt-2 text-center">
            <Link href={authBase} className="text-xs text-primary hover:underline font-medium">
              {isVi ? "Quay lại trang Đăng nhập" : "Back to Sign In"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
