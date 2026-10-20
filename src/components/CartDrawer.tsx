"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  MessageCircle,
  CreditCard,
  Building2,
  QrCode,
  Loader2
} from "lucide-react";
import { useCart, parsePriceToNumber } from "@/context/CartContext";

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    validateCartWithServer,
    totalItems, 
    subtotal, 
    formatRupiah 
  } = useCart();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"kirim" | "pickup">("kirim");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [settings, setSettings] = useState<Record<string, any>>({
    "contact.whatsapp": "6281234567890",
    "checkout.waTemplate": "*HALO PUSAT CETAK PADANG, SAYA INGIN PESAN:*\n----------------------------------------\n*No. Pesanan:* {code}\n*Nama:* {nama}\n*WhatsApp:* {phone}\n*Metode:* {metode}\n*Alamat:* {alamat}\n*Pembayaran:* {pembayaran}\n*Catatan:* {catatan}\n----------------------------------------\n*RINCIAN PESANAN:*\n{items}\n----------------------------------------\n*TOTAL:* *{total}*\n----------------------------------------\nMohon diproses, terima kasih!"
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {});
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Silakan isi nama dan nomor WhatsApp Anda.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Validasi live dengan server
      await validateCartWithServer();

      // 2. Simpan order ke database
      let orderCode = `BAS-${Date.now().toString().slice(-6)}`;
      let finalTotal = formatRupiah(subtotal);

      try {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryMethod: deliveryType,
            address: deliveryType === "kirim" ? address.trim() : "Ambil di Workshop Padang",
            paymentMethod,
            note: orderNotes.trim() || undefined,
            items: cart.map(it => ({
              productId: it.product.id,
              qty: it.quantity,
              designNote: it.notes || undefined,
            })),
          }),
        });

        const orderData = await orderRes.json();
        if (orderData.success && orderData.order) {
          orderCode = orderData.order.code;
          finalTotal = formatRupiah(orderData.order.subtotal);
        }
      } catch (err) {
        console.warn("Simpan order DB offline, lanjut via WA:", err);
      }

      // 3. Susun rincian item teks
      const itemsText = cart.map((item, idx) => {
        const itemPrice = parsePriceToNumber(item.product.price);
        const itemTotal = itemPrice * item.quantity;
        return `${idx + 1}. *${item.product.title}*\n   Qty: ${item.quantity} ${item.product.unit || "pcs"} x ${item.product.price} = *${formatRupiah(itemTotal)}*${item.notes ? `\n   Catatan: ${item.notes}` : ""}`;
      }).join("\n");

      // 4. Susun pesan dari template
      const template = settings["checkout.waTemplate"] || "";
      const message = template
        .replace("{code}", orderCode)
        .replace("{nama}", customerName.trim())
        .replace("{phone}", customerPhone.trim())
        .replace("{metode}", deliveryType === "kirim" ? "Kirim ke Alamat" : "Ambil di Workshop")
        .replace("{alamat}", deliveryType === "kirim" ? address.trim() : "Ambil di Workshop")
        .replace("{pembayaran}", paymentMethod)
        .replace("{catatan}", orderNotes.trim() || "-")
        .replace("{items}", itemsText)
        .replace("{total}", finalTotal);

      let targetWa = String(settings["contact.whatsapp"] || "6281234567890").replace(/[^0-9]/g, "");
      if (targetWa.startsWith("0")) targetWa = "62" + targetWa.slice(1);

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${targetWa}?text=${encodedMessage}`;

      setStep("success");
      clearCart();
      window.open(waUrl, "_blank");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => setStep("cart"), 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-[100dvh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1E1B4B] text-sm sm:text-base">
                      {step === "checkout" ? "Konfirmasi Pesanan" : step === "success" ? "Pesanan Terkirim!" : "Keranjang Belanja"}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      {step === "cart" ? `${totalItems} item dipilih` : "Pusat Cetak Padang"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
                {/* STEP 1: CART ITEMS */}
                {step === "cart" && (
                  <>
                    {cart.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 mb-3">
                          <ShoppingBag size={30} />
                        </div>
                        <h3 className="font-bold text-[#1E1B4B] text-base mb-1">Keranjang Masih Kosong</h3>
                        <p className="text-xs text-gray-400 max-w-xs mb-5">
                          Belum ada produk cetak atau merchandise yang Anda masukkan ke keranjang.
                        </p>
                        <button
                          onClick={handleClose}
                          className="bg-[#F97316] hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Eksplor Katalog Produk
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item) => {
                          const unitPrice = parsePriceToNumber(item.product.price);
                          const itemTotal = unitPrice * item.quantity;
                          const img = item.product.imageUrl || item.product.img || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop";

                          return (
                            <motion.div
                              layout
                              key={item.product.id}
                              className="bg-white border border-gray-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:border-orange-200 transition-colors"
                            >
                              {/* Product Thumbnail */}
                              <div className="relative w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                <Image
                                  src={img}
                                  alt={item.product.title}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                  <div className="flex justify-between items-start gap-1">
                                    <h4 className="font-semibold text-xs text-[#1E1B4B] truncate leading-tight">
                                      {item.product.title}
                                    </h4>
                                    <button
                                      onClick={() => removeFromCart(item.product.id)}
                                      className="text-gray-300 hover:text-red-500 p-0.5 transition-colors shrink-0"
                                      title="Hapus dari keranjang"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {item.product.price} {item.product.unit || "/ pcs"}
                                  </span>
                                  {item.notes && (
                                    <p className="text-[10px] text-gray-500 italic truncate mt-0.5">
                                      Catatan: {item.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/60 p-0.5">
                                    <button
                                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                      className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded hover:bg-white transition-colors"
                                    >
                                      <Minus size={10} />
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold text-gray-800">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                      className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded hover:bg-white transition-colors"
                                    >
                                      <Plus size={10} />
                                    </button>
                                  </div>

                                  <div className="text-xs font-bold text-[#F97316]">
                                    {formatRupiah(itemTotal)}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* STEP 2: CHECKOUT FORM */}
                {step === "checkout" && (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Rian Pratama"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Pengambilan / Pengiriman
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryType("kirim")}
                          className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-1.5 transition-all ${
                            deliveryType === "kirim" 
                              ? "border-[#F97316] bg-orange-50/50 text-[#F97316]" 
                              : "border-gray-200 text-gray-600 bg-white"
                          }`}
                        >
                          <Truck size={14} /> Kirim Alamat
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryType("pickup")}
                          className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-1.5 transition-all ${
                            deliveryType === "pickup" 
                              ? "border-[#F97316] bg-orange-50/50 text-[#F97316]" 
                              : "border-gray-200 text-gray-600 bg-white"
                          }`}
                        >
                          <Building2 size={14} /> Ambil di Workshop
                        </button>
                      </div>
                    </div>

                    {deliveryType === "kirim" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Alamat Pengiriman (Padang & Sekitarnya) *
                        </label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Jalan, No. Rumah/Ruko, Kelurahan..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Metode Pembayaran
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        {["QRIS", "Transfer Bank", "COD / Kasir"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m)}
                            className={`p-2 rounded-xl border text-center font-bold text-[11px] truncate transition-all ${
                              paymentMethod === m 
                                ? "border-[#F97316] bg-orange-50/50 text-[#F97316]" 
                                : "border-gray-200 text-gray-600 bg-white"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Catatan Desain / Ukuran (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Link Google Drive desain..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                      />
                    </div>
                  </form>
                )}

                {/* STEP 3: SUCCESS */}
                {step === "success" && (
                  <div className="py-16 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="font-bold text-[#1E1B4B] text-lg mb-1">Pesanan Dialihkan ke WhatsApp</h3>
                    <p className="text-xs text-gray-500 max-w-xs mb-6">
                      Rincian pesanan resmi Anda telah terbuka di WhatsApp. Silakan tekan tombol kirim di WhatsApp untuk konfirmasi dengan tim Pusat Cetak Padang.
                    </p>
                    <button
                      onClick={handleClose}
                      className="bg-[#0B1E36] hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
                    >
                      Selesai & Tutup
                    </button>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              {cart.length > 0 && step !== "success" && (
                <div 
                  className="p-4 sm:p-5 border-t border-gray-100 bg-slate-50 space-y-2.5 shrink-0"
                  style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 14px)" }}
                >
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-gray-500">Estimasi Total ({totalItems} item):</span>
                    <span className="text-lg font-black text-[#F97316]">{formatRupiah(subtotal)}</span>
                  </div>

                  {step === "cart" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={clearCart}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200 shrink-0"
                        title="Kosongkan Keranjang"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => setStep("checkout")}
                        className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs sm:text-sm active:scale-98"
                      >
                        Lanjut ke Pembelian <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStep("cart")}
                        className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        Kembali
                      </button>
                      <button
                        onClick={handleCheckoutSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-[#25D366] hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs sm:text-sm active:scale-98 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle size={17} />
                            <span>Kirim ke WhatsApp</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
