"use client";

import Link from "next/link";
import EditorialHeader from "@/components/EditorialHeader";
import { useLanguage } from "@/context/LanguageContext";

export default function DecksArchivePage() {
  const { locale, t } = useLanguage();

  const decks = [
    {
      id: "ED-01",
      name: "Rider-Waite-Smith 1909",
      descEn: "Original Pamela Colman Smith hand-drawn linework & watercolor restore.",
      descVi: "Phục chế nét vẽ tay và màu nước kinh điển của họa sĩ Pamela Colman Smith năm 1909.",
      statusEn: "DEFAULT · FREE",
      statusVi: "MẶC ĐỊNH · MIỄN PHÍ",
      badgeEn: "CANONICAL",
      badgeVi: "KINH ĐIỂN",
      active: true,
    },
    {
      id: "ED-02",
      name: "Sunlit Botanical Herbarium",
      descEn: "Warm Alabaster press, medicinal flora, golden woodcut botanical engraving.",
      descVi: "Thảo mộc trị liệu, sắc màu ấm áp cùng kỹ thuật khắc gỗ thực vật phủ hoàng kim.",
      statusEn: "UNLOCKED · ACTIVE",
      statusVi: "ĐÃ MỞ · ĐANG DÙNG",
      badgeEn: "FEATURED",
      badgeVi: "NỔI BẬT",
      active: false,
    },
    {
      id: "ED-03",
      name: "Swiss Geometric Construct",
      descEn: "Minimalist Bauhaus typography, precise vector grids, chromatic modernism.",
      descVi: "Typography trường phái Bauhaus tối giản, lưới vector chính xác và hiện đại.",
      statusEn: "PRO EXCLUSIVE",
      statusVi: "DÀNH CHO PRO",
      badgeEn: "MODERN",
      badgeVi: "HIỆN ĐẠI",
      active: false,
    },
    {
      id: "ED-04",
      name: "Marseille 1760 Heritage",
      descEn: "Nicolas Conver woodblock archive, pure primary heraldic inks, French tradition.",
      descVi: "Bản khắc gỗ Nicolas Conver 1760, màu mực nguyên bản theo truyền thống Tarot Pháp.",
      statusEn: "PRO EXCLUSIVE",
      statusVi: "DÀNH CHO PRO",
      badgeEn: "HISTORICAL",
      badgeVi: "LỊCH SỬ",
      active: false,
    },
    {
      id: "ED-05",
      name: "Kyoto Sumi-e Ink Wash",
      descEn: "Atmospheric Japanese calligraphy ink, negative space, gold leaf dusting.",
      descVi: "Thư pháp mực thủy mặc Nhật Bản, khoảng trống tĩnh lặng cùng bụi lá vàng Kyoto.",
      statusEn: "PRO EXCLUSIVE",
      statusVi: "DÀNH CHO PRO",
      badgeEn: "EASTERN",
      badgeVi: "PHƯƠNG ĐÔNG",
      active: false,
    },
  ];

  return (
    <>
      <EditorialHeader activeTab="decks" />

      {/* WEB — CURATED DECK EDITIONS & 78-CARD CONTACT SHEET (SCR-W06) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto border-x border-outline-variant flex flex-col bg-white">
        {/* Header Strip */}
        <section className="p-6 lg:p-8 bg-[#FAF9F6] border-b border-outline-variant">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                {t.decks.kicker}
              </span>
              <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">
                {t.decks.title}
              </h1>
              <p className="font-body text-xs text-[#475569] mt-1 max-w-2xl">
                {t.decks.desc}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">
                {locale === "vi" ? "Bộ bài: ED-01 RWS 1909" : "Active Deck: ED-01 RWS 1909"}
              </span>
              <Link
                href="/catalog-picker"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm"
              >
                {t.decks.viewContact}
              </Link>
            </div>
          </div>
        </section>

        {/* 5-Deck Style Comparison Strip for Single Card (XVII The Star) */}
        <section className="p-6 bg-white border-b border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              {locale === "vi"
                ? "ĐỐI CHIẾU THẨM MỸ 5 BỘ BÀI · XVII THE STAR (NGÔI SAO)"
                : "CROSS-EDITION VISUAL COMPARISON · XVII THE STAR"}
            </span>
            <span className="text-[11px] font-mono text-primary">
              {locale === "vi" ? "5 PHONG CÁCH NGHỆ THUẬT" : "COMPARE ALL 5 ART STYLES"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-[#FAF9F6] border border-outline-variant rounded-lg p-3 flex flex-col justify-between hover:border-primary transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 pb-1 border-b border-slate-200">
                    <span>{deck.id}</span>
                    <span className="text-primary font-semibold">
                      {locale === "vi" ? deck.badgeVi : deck.badgeEn}
                    </span>
                  </div>
                  <div className="w-full aspect-[2/3] bg-white border border-slate-200 rounded overflow-hidden flex flex-col items-center justify-center relative group-hover:shadow-sm">
                    {deck.id === "ED-01" ? (
                      <img
                        src="/decks/rider-waite-1909/cards/17_the_star.webp"
                        alt="XVII The Star - Rider-Waite-Smith 1909"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="p-3 text-center flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">
                          star
                        </span>
                        <span className="text-[10px] font-headline font-bold text-on-surface mt-2 text-center">
                          XVII THE STAR
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <div className="font-headline font-bold text-xs text-on-surface truncate">{deck.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {locale === "vi" ? deck.statusVi : deck.statusEn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 Decks Selection Table */}
        <section className="p-6 bg-[#FAF9F6]">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-4">
            {locale === "vi"
              ? "DANH SÁCH 5 BỘ BÀI LƯU TRỮ CHUẨN MỰC"
              : "SELECT DECK EDITION TO EXPLORE CONTACT SHEET"}
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="p-5 bg-white border border-outline-variant rounded-lg space-y-3 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] font-semibold text-primary">{deck.id}</span>
                    <h3 className="font-headline font-bold text-base text-on-surface">{deck.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {locale === "vi" ? "78 LÁ BÀI" : "78 CARDS"}
                  </span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {locale === "vi" ? deck.descVi : deck.descEn}
                </p>
                <div className="pt-3 border-t border-outline-variant flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-500">
                    {locale === "vi" ? deck.statusVi : deck.statusEn}
                  </span>
                  <Link href="/catalog-picker" className="text-primary font-semibold hover:underline">
                    {locale === "vi" ? "Xem 78 Lá →" : "View 78 Cards →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
