"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import {
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Layers,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function InvoiceViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const invoiceNoParam = params?.no as string;
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [viewMode, setViewMode] = useState<"invoice" | "receipt" | "spk">("invoice");

  useEffect(() => {
    if (!invoiceNoParam) return;

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : "";
        const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceNoParam)}${query}`);
        const data = await res.json();

        if (data.success && data.data) {
          setInvoice(data.data);

          // Generate QR code secara lokal
          const verifyUrl = typeof window !== "undefined"
            ? `${window.location.origin}/invoice/${encodeURIComponent(data.data.invoiceNo)}${token ? `?token=${token}` : ""}`
            : "";
          if (verifyUrl) {
            const qr = await QRCode.toDataURL(verifyUrl, {
              width: 160,
              margin: 1,
              color: {
                dark: "#0B1E36",
                light: "#FFFFFF",
              },
            });
            setQrCodeDataUrl(qr);
          }
        } else {
          setError(data.error || "Invoice tidak ditemukan");
        }
      } catch (err: any) {
        setError("Gagal memuat dokumen invoice.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceNoParam, token]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    if (!invoice) return;
    const snap = invoice.snapshot;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Halo Kak *${snap.customerName}*,\nBerikut tautan Invoice Resmi Pesanan Cetak.inc (BAS Advertising Padang):\n\n*No. Invoice*: ${invoice.invoiceNo}\n*Kode Pesanan*: ${snap.orderCode}\n*Total*: Rp ${snap.total?.toLocaleString("id-ID")}\n*Status*: ${snap.paymentStatus === "LUNAS" ? "✅ LUNAS" : "⏳ BELUM DIBAYAR"}\n\nLihat dokumen lengkap & cetak PDF:\n${url}\n\nTerima kasih telah mempercayakan cetakan Anda di Cetak.inc!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#0B1E36] border-t-[#F97316] rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-bold text-sm">Menyiapkan Dokumen Cetak.inc...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-md max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto font-bold">
            <AlertCircle size={28} />
          </div>
          <h1 className="font-extrabold text-gray-900 text-lg">Dokumen Tidak Ditemukan</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {error || "Nomor invoice tidak valid atau tautan akses kadaluwarsa."}
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1E36] text-white rounded-xl text-xs font-bold hover:bg-[#122b4c] transition-all"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  const snap = invoice.snapshot;
  const isPaid = snap.paymentStatus === "LUNAS";

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-2 sm:px-4 font-sans text-gray-800">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
        }
      `}</style>

      {/* TOP FLOATING ACTION BAR (NO PRINT) */}
      <div className="no-print max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={18} />
          </a>
          <div>
            <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">Dokumen Digital</span>
            <h2 className="font-extrabold text-xs sm:text-sm text-gray-900">{invoice.invoiceNo}</h2>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode("invoice")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "invoice" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Invoice Resmi
          </button>
          <button
            type="button"
            onClick={() => setViewMode("receipt")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "receipt" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Kwitansi
          </button>
          <button
            type="button"
            onClick={() => setViewMode("spk")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "spk" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            SPK Workshop
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Share2 size={14} /> <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#0B1E36] hover:bg-[#122b4c] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Printer size={14} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* DOCUMENT WRAPPER (A4 SIZED ON DESKTOP & PRINT) */}
      <div className="print-container max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-[2rem] border border-gray-200/80 shadow-xl overflow-hidden p-6 sm:p-10 relative">
        
        {/* WATERMARK STAMP FOR STATUS */}
        <div className="absolute right-8 top-28 sm:top-24 pointer-events-none select-none rotate-[-12deg] opacity-80 z-0">
          {viewMode === "spk" ? (
            <div className="border-4 border-dashed border-blue-600 px-4 py-2 rounded-2xl text-blue-600 font-black text-xl sm:text-2xl tracking-widest uppercase">
              SPK PRODUKSI
            </div>
          ) : isPaid ? (
            <div className="border-4 border-emerald-600 px-5 py-2 rounded-2xl text-emerald-600 font-black text-2xl sm:text-3xl tracking-widest uppercase shadow-sm">
              LUNAS
            </div>
          ) : (
            <div className="border-4 border-red-500 px-4 py-2 rounded-2xl text-red-500 font-black text-xl sm:text-2xl tracking-widest uppercase">
              BELUM DIBAYAR
            </div>
          )}
        </div>

        {/* HEADER SECTION: BRAND & INVOICE META */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-8 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B1E36] text-white flex items-center justify-center font-black text-xl shadow-md">
                C
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1E36] tracking-tight">
                  Cetak<span className="text-[#F97316]">.inc</span>
                </h1>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  BAS ADVERTISING PADANG
                </p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#F97316] shrink-0" />
                <span>Jl. Belanti Baru No. 17, Lolong Belanti, Kec. Padang Utara, Kota Padang</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400 shrink-0" />
                <span>WhatsApp Workshop: +62 822-8399-5544</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Building2 size={13} className="text-gray-400 shrink-0" />
                <span>Titik Workshop: {snap.hubName || "Hub Pusat Kota Padang"}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1.5">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
              {viewMode === "spk" ? "SURAT PERINTAH KERJA" : viewMode === "receipt" ? "KWITANSI PEMBAYARAN" : "INVOICE TAGIHAN"}
            </h2>
            <div className="space-y-0.5 text-xs">
              <p className="text-gray-500">
                Nomor: <strong className="font-mono text-gray-900">{invoice.invoiceNo}</strong>
              </p>
              <p className="text-gray-500">
                Kode Pesanan: <strong className="font-mono text-[#0B1E36]">{snap.orderCode}</strong>
              </p>
              <p className="text-gray-500">
                Tanggal Terbit: <span>{new Date(snap.issuedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
              </p>
              {snap.paidAt && (
                <p className="text-emerald-600 font-semibold">
                  Tanggal Lunas: <span>{new Date(snap.paidAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CUSTOMER & DELIVERY INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs relative z-10">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">
              DITUJUKAN KEPADA:
            </span>
            <h3 className="font-extrabold text-sm text-gray-900">{snap.customerName}</h3>
            <p className="text-gray-600 mt-0.5">{snap.customerPhone}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">
              METODE PENGIRIMAN:
            </span>
            <h3 className="font-extrabold text-sm text-gray-900 capitalize">{snap.deliveryMethod}</h3>
            {snap.deliveryAddress && (
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                Alamat: {snap.deliveryAddress}
              </p>
            )}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="overflow-x-auto my-6 relative z-10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900 text-gray-900 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-2 w-12 text-center">No</th>
                <th className="py-3 px-2">Item Cetakan & Spesifikasi</th>
                <th className="py-3 px-2 text-center w-20">Qty</th>
                {viewMode !== "spk" && (
                  <>
                    <th className="py-3 px-2 text-right w-32">Harga Satuan</th>
                    <th className="py-3 px-2 text-right w-36">Subtotal</th>
                  </>
                )}
                {viewMode === "spk" && (
                  <th className="py-3 px-2 text-center w-36">Status Produksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {snap.items?.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-2 text-center text-gray-400 font-mono">{idx + 1}</td>
                  <td className="py-3.5 px-2">
                    <p className="font-extrabold text-gray-900 text-xs sm:text-sm">{item.name}</p>
                    {item.specs && (
                      <p className="text-gray-500 text-[11px] mt-0.5 whitespace-pre-line leading-relaxed">
                        Spesifikasi: {item.specs}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-center font-bold text-gray-800">{item.qty} pcs</td>
                  {viewMode !== "spk" && (
                    <>
                      <td className="py-3.5 px-2 text-right text-gray-600 font-mono">
                        Rp {item.unitPrice?.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-2 text-right font-bold text-gray-900 font-mono">
                        Rp {item.subtotal?.toLocaleString("id-ID")}
                      </td>
                    </>
                  )}
                  {viewMode === "spk" && (
                    <td className="py-3.5 px-2 text-center">
                      <span className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 font-mono text-[10px] uppercase">
                        Antrean Cetak
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PRICING CALCULATION (HIDDEN IN SPK VIEW) */}
        {viewMode !== "spk" && (
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-gray-100 pt-6 relative z-10">
            {/* Payment Instructions / Account Note */}
            <div className="max-w-xs sm:max-w-sm text-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                INFORMASI PEMBAYARAN:
              </span>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-[11px] text-gray-600 space-y-1">
                <p><strong>Bank Nagari (011)</strong>: 2100021088921 a.n Cetak.inc Padang</p>
                <p><strong>Bank BCA (014)</strong>: 0321948291 a.n BAS Advertising</p>
                <p><strong>Bank Mandiri (008)</strong>: 1110018274621 a.n Cetak.inc</p>
                <p className="text-gray-400 text-[10px] pt-1">
                  *Verifikasi otomatis oleh Admin Urang Dalam setelah bukti bayar terunggah.
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 py-1">
                <span>Subtotal Produk:</span>
                <span className="font-mono font-semibold text-gray-900">
                  Rp {snap.subtotal?.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 py-1">
                <span>Ongkos Kirim ({snap.deliveryMethod}):</span>
                <span className="font-mono font-semibold text-gray-900">
                  {snap.deliveryFee > 0 ? `Rp ${snap.deliveryFee.toLocaleString("id-ID")}` : "GRATIS"}
                </span>
              </div>
              {snap.uniqueCode > 0 && (
                <div className="flex justify-between text-gray-600 py-1">
                  <span>Kode Unik Rekonsiliasi:</span>
                  <span className="font-mono text-emerald-600 font-semibold">
                    +Rp {snap.uniqueCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-black text-gray-900 border-t-2 border-gray-900 pt-2.5 mt-2">
                <span>TOTAL AKHIR:</span>
                <span className="text-base sm:text-lg font-mono text-[#0B1E36]">
                  Rp {snap.total?.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER SECTION: QR CODE & SIGNATURE */}
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-gray-500 relative z-10">
          <div className="flex items-center gap-4">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Verifikasi Dokumen"
                className="w-20 h-20 rounded-xl border border-gray-200 p-1"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px]">
                QR Code
              </div>
            )}
            <div>
              <p className="font-bold text-gray-800 text-[11px]">Verifikasi Keaslian Dokumen</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Scan kode QR ini untuk memvalidasi status pesanan langsung di sistem resmi Cetak.inc.
              </p>
              <p className="font-mono text-[9px] text-gray-400 mt-1">
                Token: {invoice.publicToken?.substring(0, 12)}...
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right min-w-[160px] space-y-1">
            <p className="text-[11px] text-gray-400">Padang, {new Date(snap.issuedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
            <p className="font-bold text-gray-900 text-xs">BAS Advertising / Cetak.inc</p>
            <div className="h-14 flex items-center justify-center sm:justify-end">
              <span className="font-serif italic text-xs text-gray-300 border-b border-gray-300 pb-1 px-4">
                [Tanda Tangan & Stempel Resmi]
              </span>
            </div>
            <p className="text-[10px] text-gray-500">Finance & Workshop Admin</p>
          </div>
        </div>

      </div>
    </div>
  );
}
