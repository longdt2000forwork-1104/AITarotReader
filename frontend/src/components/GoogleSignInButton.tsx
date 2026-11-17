"use client";

import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { getGoogleWebClientId, isNativeCapacitor, signInWithNativeGoogle } from "@/services/googleSignIn";

interface GoogleSignInButtonProps {
  locale: "vi" | "en";
  disabled?: boolean;
  onIdToken: (idToken: string) => Promise<void> | void;
  onError: (message: string) => void;
}

export default function GoogleSignInButton({
  locale,
  disabled = false,
  onIdToken,
  onError,
}: GoogleSignInButtonProps) {
  const isVi = locale === "vi";
  const [isNative, setIsNative] = useState(false);
  const [busy, setBusy] = useState(false);
  const clientId = getGoogleWebClientId();

  useEffect(() => {
    setIsNative(isNativeCapacitor());
  }, []);

  const handleNativeSignIn = async () => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      const idToken = await signInWithNativeGoogle();
      await onIdToken(idToken);
    } catch (err: any) {
      onError(
        err?.message ||
          (isVi ? "Đăng nhập Google thất bại. Vui lòng thử lại." : "Google sign-in failed. Please try again.")
      );
    } finally {
      setBusy(false);
    }
  };

  if (isNative) {
    return (
      <button
        type="button"
        onClick={handleNativeSignIn}
        disabled={busy || disabled}
        className="w-full py-2.5 px-4 bg-white border border-[#CBD5E1] hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-center space-x-2.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
      >
        <GoogleLogo />
        <span>
          {busy
            ? isVi
              ? "Đang kết nối Google..."
              : "Connecting Google..."
            : isVi
            ? "Tiếp tục với Google"
            : "Continue with Google"}
        </span>
      </button>
    );
  }

  if (!clientId) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onError(
            isVi
              ? "Chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID cho đăng nhập Google."
              : "Google Sign-In requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be configured."
          )
        }
        className="w-full py-2.5 px-4 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 text-[#0F172A] text-xs font-medium shadow-xs cursor-pointer"
      >
        <GoogleLogo />
        <span>{isVi ? "Tiếp tục với Google" : "Continue with Google"}</span>
      </button>
    );
  }

  return (
    <div className={`w-full flex justify-center ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (credentialResponse.credential) {
            await onIdToken(credentialResponse.credential);
          } else {
            onError(
              isVi
                ? "Không nhận được mã xác thực từ Google."
                : "Did not receive credential from Google."
            );
          }
        }}
        onError={() => {
          onError(
            isVi
              ? "Đăng nhập Google thất bại hoặc đã bị hủy."
              : "Google sign-in failed or was cancelled."
          );
        }}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="360"
      />
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" fill="#4285F4" />
      <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853" />
      <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
    </svg>
  );
}
