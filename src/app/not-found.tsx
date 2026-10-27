import Link from "next/link";
import { ArrowLeft, Home, Search, Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-white">
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-700 flex items-center justify-center mx-auto">
          <Search size={28} />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
            Error 404
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight pt-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Halaman yang Anda tuju mungkin telah dipindahkan, berganti nama, atau tautan tidak valid.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
          >
            <Home size={14} /> Ke Beranda
          </Link>
          <Link
            href="/produk"
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Package size={14} /> Lihat Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
