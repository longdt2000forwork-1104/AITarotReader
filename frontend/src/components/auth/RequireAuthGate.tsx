"use client";

import React, { Suspense } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useLanguage } from "@/context/LanguageContext";

interface RequireAuthGateProps {
  authPath?: "/auth" | "/app/auth";
  children: React.ReactNode;
}

function AuthGateInner({ authPath = "/auth", children }: RequireAuthGateProps) {
  const { isAuthenticated } = useRequireAuth(authPath);
  const { locale } = useLanguage();
  const isVi = locale === "vi";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">
            {isVi ? "Đang xác thực phiên đăng nhập..." : "Verifying session..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RequireAuthGate(props: RequireAuthGateProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <AuthGateInner {...props} />
    </Suspense>
  );
}
