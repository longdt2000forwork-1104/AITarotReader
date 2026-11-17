import { Suspense } from "react";
import EditorialHeader from "@/components/EditorialHeader";
import ForgotPasswordView from "@/components/auth/ForgotPasswordView";

export default function WebForgotPasswordPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] min-h-screen flex flex-col">
      <EditorialHeader activeTab="auth" />
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={<div className="text-xs font-mono text-slate-500">Loading...</div>}>
          <ForgotPasswordView platform="web" />
        </Suspense>
      </main>
    </div>
  );
}
