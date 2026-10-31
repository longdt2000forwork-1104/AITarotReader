import Link from "next/link";

interface MobileBottomNavProps {
  activeTab?: "home" | "oracle" | "journal" | "profile";
}

export default function MobileBottomNav({
  activeTab = "home",
}: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface border-t border-outline-variant max-w-screen-md mx-auto shadow-sm">
      <Link
        href="/app/home"
        className={`flex flex-col items-center justify-center py-1 ${
          activeTab === "home" ? "text-primary font-semibold" : "text-on-surface-variant font-normal"
        }`}
      >
        <span className="material-symbols-outlined text-xl">spa</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">Sanctuary</span>
      </Link>
      <Link
        href="/app/readings/new"
        className={`flex flex-col items-center justify-center py-1 ${
          activeTab === "oracle" ? "text-primary font-semibold" : "text-on-surface-variant font-normal"
        }`}
      >
        <span className="material-symbols-outlined text-xl">style</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">Oracle</span>
      </Link>
      <Link
        href="/app/decks"
        className={`flex flex-col items-center justify-center py-1 ${
          activeTab === "journal" ? "text-primary font-semibold" : "text-on-surface-variant font-normal"
        }`}
      >
        <span className="material-symbols-outlined text-xl">menu_book</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">Decks & Journal</span>
      </Link>
      <Link
        href="/app/billing"
        className={`flex flex-col items-center justify-center py-1 ${
          activeTab === "profile" ? "text-primary font-semibold" : "text-on-surface-variant font-normal"
        }`}
      >
        <span className="material-symbols-outlined text-xl">person</span>
        <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">Profile & CR</span>
      </Link>
    </nav>
  );
}

