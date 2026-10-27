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

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-neutral-200/60 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
    >
      <div className="flex justify-around items-center h-14 px-4 max-w-md mx-auto">
        {/* Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 active:scale-95 ${
            pathname === "/" ? "text-neutral-950 font-semibold" : "text-neutral-400 font-medium hover:text-neutral-700"
          }`}
        >
          {pathname === "/" && (
            <span className="absolute top-0 w-8 h-0.5 bg-neutral-950 rounded-full" />
          )}
          <Home size={20} strokeWidth={pathname === "/" ? 2.2 : 1.75} />
          <span className="text-[10px] mt-1 tracking-tight">Beranda</span>
        </Link>

        {/* Katalog */}
        <Link
          href="/produk"
          className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 active:scale-95 ${
            pathname?.startsWith("/produk")
              ? "text-neutral-950 font-semibold"
              : "text-neutral-400 font-medium hover:text-neutral-700"
          }`}
        >
          {pathname?.startsWith("/produk") && (
            <span className="absolute top-0 w-8 h-0.5 bg-neutral-950 rounded-full" />
          )}
          <LayoutGrid size={20} strokeWidth={pathname?.startsWith("/produk") ? 2.2 : 1.75} />
          <span className="text-[10px] mt-1 tracking-tight">Katalog</span>
        </Link>

        {/* WhatsApp Chat Langsung */}
        <a
          href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi & pesan cetak.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 active:scale-95 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <div className="relative">
            <MessageCircle size={20} strokeWidth={2.2} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <span className="text-[10px] mt-1 font-semibold tracking-tight">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
