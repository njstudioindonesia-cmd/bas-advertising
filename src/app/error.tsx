"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Cetak.inc Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#F8F9FA]">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 max-w-md w-full text-center space-y-5 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            Terjadi Kendala Teknis
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            Halaman ini mengalami gangguan sementara. Kami telah mencatat log kesalahan ini untuk segera diperbaiki.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-gray-400 bg-gray-50 py-1 px-2 rounded max-w-xs mx-auto">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0B1E36] hover:bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            <RefreshCw size={14} /> Coba Muat Ulang
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Home size={14} /> Ke Beranda
          </Link>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <a
            href="https://wa.me/6282283995544?text=Halo%20Cetak.inc,%20saya%20mengalami%20kendala%20di%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            <MessageCircle size={13} /> Hubungi Bantuan WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
