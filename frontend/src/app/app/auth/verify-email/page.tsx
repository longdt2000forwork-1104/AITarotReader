import { Suspense } from "react";
import Link from "next/link";
import VerifyEmailView from "@/components/auth/VerifyEmailView";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function AppVerifyEmailPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#FAF9F6] border-x border-[#E2E8F0] flex flex-col pb-24">
        <header className="px-4 py-3 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
          <Link href="/app/auth" className="text-xs text-slate-600 hover:text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Auth</span>
          </Link>
          <span className="font-headline font-bold text-sm uppercase tracking-tight text-slate-900">
            AITAROT · SANCTUARY
          </span>
          <span className="w-10" />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Suspense fallback={<div className="text-xs font-mono text-slate-500">Loading...</div>}>
            <VerifyEmailView platform="app" />
          </Suspense>
        </main>
      </div>
      <MobileBottomNav activeTab="auth" />
    </div>
  );
}
