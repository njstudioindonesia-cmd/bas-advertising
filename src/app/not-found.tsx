import Link from "next/link";
import { ArrowLeft, Home, Search, Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#F8F9FA]">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-5 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto shadow-sm">
          <Search size={32} />
        </div>

        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            Error 404
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight pt-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            Halaman yang Anda tuju mungkin telah dipindahkan, berganti nama, atau tautan tidak valid.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-[#0B1E36] hover:bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            <Home size={14} /> Ke Beranda
          </Link>
          <Link
            href="/produk"
            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Package size={14} /> Lihat Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
