"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, ArrowUpRight, CheckCircle2, Loader2, Send } from "lucide-react";

export default function Hubungi() {
  const [settings, setSettings] = useState<Record<string, any>>({
    "contact.address": "Jl. Percetakan Modern No.88, Kota Padang, Sumatera Barat",
    "contact.whatsapp": "6281234567890",
    "contact.email": "hello@basadvertising.com",
    "contact.hours": "Senin - Sabtu: 08:30 - 21:00 WIB",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!fullName) {
      setErrorMsg("Harap masukkan nama Anda.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg("Harap masukkan pesan atau kebutuhan cetak Anda.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Simpan ke database Supabase
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.error || "Gagal menyimpan pesan");
      }

      setSubmitted(true);

      // 2. Format pesan WhatsApp dan arahkan ke WhatsApp resmi Cetak.inc
      const waNumber = settings["contact.whatsapp"] || "6281234567890";
      const cleanWa = waNumber.replace(/[^0-9]/g, "");
      const waText = encodeURIComponent(
        `*HALO CETAK.INC (KONSULTASI CETAK)*\n\n` +
        `*Nama:* ${fullName}\n` +
        `*No. HP/WA:* ${formData.phone || "-"}\n` +
        `*Email:* ${formData.email || "-"}\n\n` +
        `*Pesan / Kebutuhan Cetak:*\n${formData.message}\n\n` +
        `Mohon informasi estimasi biaya & pengerjaannya. Terima kasih!`
      );

      const waUrl = `https://wa.me/${cleanWa}?text=${waText}`;
      setTimeout(() => {
        window.open(waUrl, "_blank");
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="pt-20 md:pt-40 pb-28 md:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          
          {/* LEFT - TEXT & INFO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-accent mb-6 block">
              Hubungi Kami
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-brand-dark mb-6 sm:mb-8 tracking-tight">
              Wujudkan Cetak <br/> Berkualitas Tinggi.
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mb-8 sm:mb-12 max-w-md leading-relaxed font-light">
              Punya ide desain baru, kebutuhan branding outlet, atau tender skala besar? Tim Cetak.inc siap membantu dengan kalkulasi harga akurat dan kualitas standar industri.
            </p>

            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-[#F97316] flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-1">Studio & Workshop</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-sm">
                    {settings["contact.address"]}
                  </p>
                  <p className="text-xs text-[#F97316] font-medium mt-1">
                    {settings["contact.hours"]}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-[#F97316] flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-1">Phone / WhatsApp</h3>
                  <p className="text-gray-500 font-light text-sm">+{settings["contact.whatsapp"]}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-[#F97316] flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-1">Email Resmi</h3>
                  <p className="text-gray-500 font-light text-sm">{settings["contact.email"]}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT - FORM */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="bg-[#F8F9FA] rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-brand-dark tracking-tight">Kirim Pesan & Konsultasi</h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">Pesan Anda langsung tersimpan ke sistem dan diteruskan ke WhatsApp konsultan cetak.</p>
              
              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-800">Pesan Berhasil Terkirim!</h3>
                  <p className="text-xs text-emerald-700">
                    Terima kasih telah menghubungi Cetak.inc. WhatsApp Anda telah dibuka secara otomatis untuk melanjutkan diskusi langsung bersama tim kami.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
                    }}
                    className="text-xs font-semibold text-emerald-700 underline mt-2 hover:text-emerald-900"
                  >
                    Kirim pesan lain
                  </button>
                </div>
              ) : (
                <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-3 rounded-xl font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Depan *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" 
                        placeholder="Contoh: Rian" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Belakang</label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" 
                        placeholder="Contoh: Pratama" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp *</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" 
                        placeholder="0812xxxxxxx" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email (Opsional)</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" 
                        placeholder="rian@bisnis.com" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rincian Kebutuhan Cetak / Pertanyaan *</label>
                    <textarea 
                      rows={4} 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all resize-none" 
                      placeholder="Jelaskan kebutuhan Anda (jenis produk, jumlah pesanan, ukuran, atau deadline pengerjaan)..."
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Mengirim...
                      </>
                    ) : (
                      <>
                        Kirim Pesan & Konsultasi <Send size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
