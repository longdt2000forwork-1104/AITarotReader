"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { apiClient } from "@/services/apiClient";
import { WalletBalanceDto } from "@/types/api";

export default function MobileBillingPage() {
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const [wallet, setWallet] = useState<WalletBalanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimedDaily, setClaimedDaily] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBalance() {
      try {
        setLoading(true);
        const res = await apiClient.wallet.getBalance();
        if (res.data) {
          setWallet(res.data);
        }
      } catch (err) {
        console.error("Failed to load mobile wallet balance:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBalance();
  }, []);

  const handleClaimDaily = async () => {
    if (claimedDaily) return;
    try {
      const res = await apiClient.wallet.claimDailyReward();
      if (res.code === 200 && res.data) {
        setWallet(res.data);
        setClaimedDaily(true);
        setToastMessage(isVi ? "+10 CR Phước lành hàng ngày đã cộng vào Supabase!" : "+10 CR Daily reward deposited!");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error claiming daily reward:", err);
    }
  };

  const balance = wallet?.balance ?? 45;
  const isPro = wallet?.tier === "PRO";

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{isVi ? "Thánh Địa" : "Sanctuary"}</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface">
          {isVi ? "SỔ CÁI & CRYSTAL" : "LEDGER & CREDITS"}
        </span>

        {/* Language Switcher */}
        <div className="flex items-center border border-outline-variant rounded text-[10px] font-mono overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-2 py-0.5 transition-colors ${
              !isVi ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:text-on-surface"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("vi")}
            className={`px-2 py-0.5 transition-colors ${
              isVi ? "bg-primary text-white font-bold" : "text-slate-500 hover:text-on-surface"
            }`}
          >
            VI
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-mono font-medium px-4 py-2 text-center flex items-center justify-center gap-2 sticky top-12 z-50 shadow-md">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="p-5 bg-white border border-outline-variant rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              {isVi ? "SỐ DƯ CRYSTAL HIỆN TẠI (SUPABASE)" : "CURRENT CRYSTAL BALANCE (SUPABASE)"}
            </span>
            <div className="text-2xl font-headline font-bold text-on-surface flex items-center gap-2 mt-0.5">
              <span>{loading ? "..." : `${balance} Crystal`}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                isPro
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-amber-600 bg-amber-50 border-amber-200"
              }`}>
                {isPro ? (isVi ? "GÓI PRO ĐANG HOẠT ĐỘNG" : "PRO ACTIVE") : (isVi ? "GÓI MIỄN PHÍ" : "FREE TIER")}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isVi
                ? "Hạn mức pha lê miễn phí nạp lại vào nửa đêm mỗi ngày."
                : "Daily free allowance refilled every midnight."}
            </div>
          </div>
          <button
            type="button"
            disabled={claimedDaily}
            onClick={handleClaimDaily}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              claimedDaily
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {claimedDaily
              ? (isVi ? "Đã nhận ✓" : "Claimed ✓")
              : (isVi ? "+10 CR Điểm Danh" : "+10 CR Daily Free")}
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className="p-5 bg-white border-2 border-primary rounded-lg space-y-3 relative shadow-sm">
          <div className="absolute top-0 right-4 -translate-y-1/2 bg-primary text-white text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold">
            {isVi ? "KHUYÊN DÙNG" : "RECOMMENDED"}
          </div>
          <div>
            <span className="text-[10px] font-mono text-primary font-semibold">
              {isVi ? "GÓI ĐĂNG KÝ HỘI VIÊN" : "SUBSCRIPTION PLAN"}
            </span>
            <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
              {isVi ? "Hội Viên Lưu Trữ Archival Pro (179.000đ/tháng)" : "Archival Pro Membership ($6.99/mo)"}
            </h3>
            <p className="text-xs text-[#475569] mt-1">
              {isVi
                ? "Hỏi đáp đào sâu vô hạn, mở khóa toàn bộ 5 bộ bài Tarot lịch sử, xuất poster/PDF 300 DPI độ phân giải cao."
                : "Unlimited follow-up questions, all 5 Tarot deck editions unlocked, high-res PDF/poster exports."}
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">check</span>
              <span>{isVi ? "150 Crystal Thưởng Hàng Tháng" : "150 Monthly Bonus Credits"}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">check</span>
              <span>
                {isVi ? "Quyền dùng bộ bài Swiss Geometric & Thủy Mặc Sumi-e" : "Access to Swiss Geometric & Sumi-e decks"}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">check</span>
              <span>{isVi ? "Ưu tiên đường truyền AI tốc độ cao nhất" : "Priority low-latency streaming"}</span>
            </li>
          </ul>
          <button className="w-full py-3 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm transition-colors">
            {isVi ? "Nâng Cấp Lên Archival Pro (179.000đ)" : "Upgrade to Archival Pro ($6.99)"}
          </button>
        </div>

        {/* Credit Packs */}
        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            {isVi ? "GÓI CRYSTAL MUA LẺ (NẠP DÙNG DẦN)" : "PAY-AS-YOU-GO CREDIT PACKS"}
          </span>
          <div className="space-y-2">
            {[
              {
                credits: 50,
                price: isVi ? "49.000đ" : "$1.99",
                per: isVi ? "~980đ / crystal" : "$0.040 / credit",
              },
              {
                credits: 170,
                price: isVi ? "129.000đ" : "$4.99",
                per: isVi ? "~758đ / crystal" : "$0.029 / credit",
                popular: true,
              },
              {
                credits: 480,
                price: isVi ? "299.000đ" : "$11.99",
                per: isVi ? "~622đ / crystal" : "$0.025 / credit",
              },
            ].map((pack, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border border-outline-variant rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-sm text-on-surface">
                      +{pack.credits} {isVi ? "Crystal" : "Credits"}
                    </span>
                    {pack.popular && (
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                        {isVi ? "TIẾT KIỆM NHẤT" : "BEST VALUE"}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{pack.per}</div>
                </div>
                <button className="px-3 py-1.5 text-xs font-semibold border border-outline-variant rounded-lg hover:bg-slate-50 text-on-surface">
                  {pack.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MobileBottomNav activeTab="profile" />
    </div>
  );
}
