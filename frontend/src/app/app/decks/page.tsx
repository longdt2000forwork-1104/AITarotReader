"use client";

import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileDecksGalleryPage() {
  const { locale, setLocale } = useLanguage();
  const isVi = locale === "vi";

  const decks = [
    {
      id: "ED-01",
      name: "Rider-Waite-Smith 1909",
      desc: isVi
        ? "Nét vẽ kinh điển & màu nước thủ công nguyên bản của Pamela Colman Smith."
        : "Original Pamela Colman Smith hand-drawn linework & watercolor.",
      status: isVi ? "MẶC ĐỊNH · MIỄN PHÍ" : "DEFAULT · FREE",
      badge: isVi ? "CHUẨN MỰC" : "CANONICAL",
      active: false,
    },
    {
      id: "ED-02",
      name: isVi ? "Thảo Dược Chiêm Tinh (Sunlit Botanical)" : "Sunlit Botanical Herbarium",
      desc: isVi
        ? "Giấy thạch cao ấm áp, thảo dược trị liệu học và nét khắc mộc bản thếp vàng."
        : "Warm Alabaster press, medicinal flora, golden woodcut engraving.",
      status: isVi ? "ĐANG SỬ DỤNG" : "ACTIVE SELECTION",
      badge: isVi ? "HOẠT ĐỘNG" : "ACTIVE",
      active: true,
    },
    {
      id: "ED-03",
      name: isVi ? "Hình Học Tối Giản Thụy Sĩ" : "Swiss Geometric Construct",
      desc: isVi
        ? "Nghệ thuật chữ Bauhaus tối giản, lưới vector chuẩn xác và tính hiện đại biểu cảm."
        : "Minimalist Bauhaus typography, vector grids, chromatic modernism.",
      status: isVi ? "BẢN PRO (150 CR)" : "PRO (150 CR)",
      badge: "PRO",
      active: false,
    },
    {
      id: "ED-04",
      name: isVi ? "Di Sản Marseille 1760" : "Marseille 1760 Heritage",
      desc: isVi
        ? "Bản khắc gỗ lưu trữ Nicolas Conver, màu mực cổ điển nguyên thủy trung cổ."
        : "Nicolas Conver woodblock archive, pure primary heraldic inks.",
      status: isVi ? "BẢN PRO (150 CR)" : "PRO (150 CR)",
      badge: "PRO",
      active: false,
    },
    {
      id: "ED-05",
      name: isVi ? "Thủy Mặc Kyoto Sumi-e" : "Kyoto Sumi-e Ink Wash",
      desc: isVi
        ? "Mực mài thư họa Nhật Bản quyện khói mờ và bụi vàng thủ công tinh tế."
        : "Atmospheric Japanese calligraphy ink, gold leaf dusting.",
      status: isVi ? "BẢN PRO (200 CR)" : "PRO (200 CR)",
      badge: "PRO",
      active: false,
    },
  ];

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-surface flex flex-col border-x border-outline-variant pb-20">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-outline-variant flex items-center justify-between sticky top-0 z-40">
        <Link href="/app/home" className="flex items-center gap-1 text-xs text-slate-500 hover:text-on-surface">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{isVi ? "Thánh Địa" : "Sanctuary"}</span>
        </Link>
        <span className="font-mono text-xs font-semibold text-on-surface">
          {isVi ? "5 PHIÊN BẢN BỘ BÀI" : "5 DECK EDITIONS"}
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

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Active Hero Deck */}
        <div className="bg-white border-2 border-primary rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-100 pb-2">
            <span className="text-primary font-bold">
              {isVi ? "LỰA CHỌN HIỆN TẠI · ED-02" : "ACTIVE SELECTION · ED-02"}
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              {isVi ? "ĐANG DÙNG" : "IN USE"}
            </span>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-20 h-28 bg-[#FAF9F6] border border-amber-200 rounded flex flex-col items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-3xl text-emerald-600">spa</span>
              <span className="text-[8px] font-mono text-emerald-700 font-bold mt-1">HERBARIUM</span>
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="font-headline font-bold text-base text-on-surface">
                {isVi ? "Thảo Dược Chiêm Tinh (Sunlit Botanical)" : "Sunlit Botanical Herbarium"}
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed">
                {isVi
                  ? "78 lá bài in trên nền giấy thạch cao ấm áp kết hợp thảo mộc chữa lành và họa tiết mạ vàng tinh xảo."
                  : "78 cards printed on warm alabaster stock with medicinal herbs and gold foil accents."}
              </p>
              <div className="text-[10px] font-mono text-emerald-700 font-semibold pt-1">
                {isVi ? "Đã Tạo & Kiểm Định 78 Bản Khắc" : "78 Plates Generated & Verified"}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              href="/catalog-picker"
              className="flex-1 py-2 text-center text-xs font-medium border border-outline-variant rounded-lg hover:bg-slate-50"
            >
              {isVi ? "Khám Phá 78 Bản Khắc" : "Browse 78 Plates"}
            </Link>
            <button className="flex-1 py-2 text-center text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover">
              {isVi ? "Đã Chọn ✓" : "Selected ✓"}
            </button>
          </div>
        </div>

        {/* Other 4 Editions */}
        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            {isVi ? "CÁC PHIÊN BẢN KHẢ DỤNG (TÙY Ý CHUYỂN ĐỔI)" : "AVAILABLE EDITIONS (SWITCH FREELY)"}
          </span>

          {decks
            .filter((d) => !d.active)
            .map((deck) => (
              <div
                key={deck.id}
                className="p-4 bg-white border border-outline-variant rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  {deck.id === "ED-01" ? (
                    <img
                      src="/decks/rider-waite-1909/cards/00_the_fool.webp"
                      alt="RWS 1909"
                      className="w-10 h-16 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                    />
                  ) : null}
                  <div className="space-y-1 max-w-[210px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-primary font-semibold">{deck.id}</span>
                      <h3 className="font-headline font-bold text-sm text-on-surface">{deck.name}</h3>
                    </div>
                    <p className="text-[11px] text-[#475569]">{deck.desc}</p>
                    <span className="text-[10px] font-mono text-slate-400 block">{deck.status}</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium border border-outline-variant rounded-lg hover:bg-slate-50 text-on-surface shrink-0">
                  {isVi ? "Chọn" : "Switch"}
                </button>
              </div>
            ))}
        </div>
      </main>

      <MobileBottomNav activeTab="decks" />
    </div>
  );
}
