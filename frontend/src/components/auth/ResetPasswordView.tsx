"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { authApi } from "@/services/authApi";
import { passwordsMatch, validatePassword } from "@/utils/authValidation";

interface ResetPasswordViewProps {
  platform: "web" | "app";
}

export default function ResetPasswordView({ platform }: ResetPasswordViewProps) {
  const { locale } = useLanguage();
  const isVi = locale === "vi";
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const authBase = platform === "app" ? "/app/auth" : "/auth";
  const forgotBase = `${authBase}/forgot-password`;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pwdCheck = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg(
        isVi
          ? "Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token."
          : "Reset link is missing a valid token."
      );
      return;
    }
    if (!pwdCheck.valid) {
      setErrorMsg(
        isVi
          ? "Mật khẩu mới phải có ít nhất 8 ký tự."
          : "New password must be at least 8 characters long."
      );
      return;
    }
    if (!passwordsMatch(newPassword, confirmPassword)) {
      setErrorMsg(
        isVi ? "Mật khẩu xác nhận không khớp." : "Passwords do not match."
      );
      return;
    }

    setSubmitting(true);
    const res = await authApi.resetPassword(token, newPassword);
    setSubmitting(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      setErrorMsg(
        res.code === "ERR_TOKEN_EXPIRED_OR_USED"
          ? isVi
            ? "Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới."
            : "This reset link has expired or already been used. Please request a new one."
          : res.message
      );
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs w-full max-w-md mx-auto">
      <div className="flex items-center space-x-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
          {isVi ? "ĐẶT LẠI MẬT KHẨU" : "RESET PASSWORD"}
        </span>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">lock_reset</span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-slate-900">
            {isVi ? "Đã Cập Nhật Mật Khẩu" : "Password Updated"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isVi
              ? "Mật khẩu mới đã được lưu và mọi phiên đăng nhập cũ đã được thu hồi. Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ."
              : "Your new password has been saved and old sessions have been signed out. You can sign in now."}
          </p>
          <Link
            href={authBase}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#047857] text-white py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>{isVi ? "Đi Tới Đăng Nhập" : "Proceed to Sign In"}</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="font-headline font-bold text-2xl text-slate-900">
            {isVi ? "Thiết Lập Mật Khẩu Mới" : "Create a New Password"}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isVi
              ? "Mật khẩu cần tối thiểu 8 ký tự. Sau khi đặt lại, tất cả thiết bị cũ sẽ cần đăng nhập lại."
              : "Choose at least 8 characters. All previous sessions will be revoked upon reset."}
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-2">
              <p>{errorMsg}</p>
              <Link href={forgotBase} className="inline-block underline font-semibold text-rose-900">
                {isVi ? "Yêu cầu liên kết mới →" : "Request a new link →"}
              </Link>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
              {isVi ? "Mật Khẩu Mới (Tối thiểu 8 ký tự)" : "New Password (Min 8 characters)"}
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E2E8F0] rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">
              {isVi ? "Xác Nhận Mật Khẩu Mới" : "Confirm New Password"}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                ? "Đang cập nhật..."
                : "Updating..."
              : isVi
              ? "Lưu Mật Khẩu Mới"
              : "Save New Password"}
          </button>
        </form>
      )}
    </div>
  );
}
