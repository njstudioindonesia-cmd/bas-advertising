"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
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

  // Format nomor WhatsApp: jika mulai dari 08... ubah jadi 628...
  let cleanWa = waNumber;
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  } else if (!cleanWa.startsWith("62")) {
    cleanWa = "62" + cleanWa;
  }

  const message = encodeURIComponent("Halo Cetak.inc, saya ingin konsultasi dan pesan cetak.");
  const waUrl = `https://wa.me/${cleanWa}?text=${message}`;

  return (
    <aside aria-label="Kontak WhatsApp Langsung" className="hidden md:block fixed bottom-6 right-6 z-50">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi WhatsApp Cetak.inc"
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/30"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle size={24} className="fill-white text-[#25D366]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
        </div>
        <span className="hidden md:inline font-bold text-xs tracking-wide">
          Chat WhatsApp
        </span>
      </a>
    </aside>
  );
}
