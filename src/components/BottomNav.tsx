"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageCircle } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [waNumber, setWaNumber] = useState("6282172725267");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data["contact.whatsapp"]) {
          setWaNumber(String(data.data["contact.whatsapp"]).replace(/[^0-9]/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  let cleanWa = waNumber;
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  } else if (!cleanWa.startsWith("62")) {
    cleanWa = "62" + cleanWa;
  }

  const isHome = pathname === "/";
  const isCatalog = pathname?.startsWith("/produk");

  return (
    <div
      className="md:hidden fixed left-0 right-0 z-40 flex justify-center pointer-events-none px-4"
      style={{ bottom: "max(env(safe-area-inset-bottom, 0px) + 10px, 16px)" }}
    >
      <nav
        aria-label="Floating Mobile Dock"
        className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-neutral-200/80 p-1.5 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.12)] flex items-center gap-1 max-w-sm w-auto transition-all"
      >
        {/* Beranda */}
        <Link
          href="/"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs transition-all duration-300 active:scale-95 ${
            isHome
              ? "bg-neutral-950 text-white shadow-sm font-semibold"
              : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 font-medium"
          }`}
        >
          <Home size={16} strokeWidth={isHome ? 2.2 : 1.8} />
          <span>Beranda</span>
        </Link>

        {/* Katalog */}
        <Link
          href="/produk"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs transition-all duration-300 active:scale-95 ${
            isCatalog
              ? "bg-neutral-950 text-white shadow-sm font-semibold"
              : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 font-medium"
          }`}
        >
          <LayoutGrid size={16} strokeWidth={isCatalog ? 2.2 : 1.8} />
          <span>Katalog</span>
        </Link>

        {/* WhatsApp Direct Hub */}
        <a
          href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi & pesan cetak.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold shadow-sm shadow-emerald-600/25 transition-all duration-300"
        >
          <div className="relative">
            <MessageCircle size={16} className="fill-white/20" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-ping" />
          </div>
          <span>WhatsApp</span>
        </a>
      </nav>
    </div>
  );
}
