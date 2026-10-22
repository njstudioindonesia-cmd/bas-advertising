"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Fatal Global Error]:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#071322] text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0B1E36] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-bold">Terjadi Gangguan Sistem Fatal</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Aplikasi mengalami kendala saat memuat struktur halaman utama.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => reset()}
              className="py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <RefreshCw size={14} /> Muat Ulang Aplikasi
            </button>
            <a
              href="/"
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs block text-center"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
