"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  MessageCircle,
  CreditCard,
  Building2,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useCart, parsePriceToNumber } from "@/context/CartContext";

export default function KeranjangPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    validateCartWithServer,
    totalItems, 
    subtotal, 
    formatRupiah 
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"kirim" | "pickup">("kirim");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings from backend
  const [settings, setSettings] = useState<Record<string, any>>({
    "contact.whatsapp": "6281234567890",
    "checkout.paymentMethods": [
      { id: "QRIS", name: "QRIS Instant", enabled: true, details: "Scan QRIS via GoPay, OVO, Dana, BCA, Livin" },
      { id: "Transfer Bank", name: "Transfer Bank", enabled: true, details: "BCA 1234-567-890 a/n BAS Advertising" },
      { id: "COD / Kasir", name: "Bayar di Workshop / Kasir", enabled: true, details: "Pembayaran langsung saat ambil pesanan" }
    ],
    "checkout.deliveryMethods": [
      { id: "kirim", name: "Kirim ke Alamat", enabled: true, note: "Kurir lokal Padang & Ekspedisi" },
      { id: "pickup", name: "Ambil di Toko / Workshop", enabled: true, note: "Gratis tanpa ongkir" }
    ],
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

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage("Silakan isi nama lengkap dan nomor WhatsApp Anda.");
      return;
    }

    if (deliveryType === "kirim" && !address.trim()) {
      setErrorMessage("Harap cantumkan alamat pengiriman di Kota Padang atau sekitarnya.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Validasi keranjang dengan live DB terlebih dahulu
      await validateCartWithServer();

      // 2. Siapkan payload order
      const orderPayload = {
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
      };

      let orderCode = `BAS-${Date.now().toString().slice(-6)}`;
      let finalTotal = formatRupiah(subtotal);

      // Simpan ke API pesanan
      try {
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        const orderData = await orderRes.json();
        if (orderData.success && orderData.order) {
          orderCode = orderData.order.code;
          finalTotal = formatRupiah(orderData.order.subtotal);
        }
      } catch (err) {
        console.warn("Penyimpanan pesanan database offline, lanjut via WA langsung:", err);
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

      // Dapatkan nomor WA dari database settings
      let targetWa = String(settings["contact.whatsapp"] || "6281234567890").replace(/[^0-9]/g, "");
      if (targetWa.startsWith("0")) targetWa = "62" + targetWa.slice(1);

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${targetWa}?text=${encodedMessage}`;

      clearCart();
      window.open(waUrl, "_blank");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses pesanan. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentOptions = Array.isArray(settings["checkout.paymentMethods"])
    ? settings["checkout.paymentMethods"].filter((p: any) => p.enabled)
    : [
        { id: "QRIS", name: "QRIS Instant", details: "Scan QRIS via GoPay, OVO, Dana, BCA, Livin" },
        { id: "Transfer Bank", name: "Transfer Bank", details: "BCA 1234-567-890 a/n BAS Advertising" },
        { id: "COD / Kasir", name: "Bayar di Workshop / Kasir", details: "Pembayaran langsung saat ambil pesanan" }
      ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-20 md:pt-36 pb-28 md:pb-24">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link href="/produk" className="hover:text-[#F97316] flex items-center gap-1 font-medium bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs">
            <ArrowLeft size={14} /> Lanjut Belanja
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">Keranjang Belanja</span>
        </div>

        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E1B4B] mb-4 sm:mb-8 tracking-tight">
          Keranjang & Checkout Pembelian
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 mx-auto mb-4">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Belum ada produk cetak yang Anda tambahkan. Silakan lihat katalog produk lengkap kami.
            </p>
            <Link 
              href="/produk" 
              className="bg-[#1E1B4B] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2 hover:bg-[#F97316] transition-colors shadow-sm"
            >
              Mulai Belanja Produk <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <h2 className="font-extrabold text-sm sm:text-base text-gray-900">
                    Daftar Pesanan ({totalItems} item)
                  </h2>
                  <button 
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Kosongkan
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item) => {
                    const unitPrice = parsePriceToNumber(item.product.price);
                    const itemTotal = unitPrice * item.quantity;
                    const img = item.product.imageUrl || item.product.img || "/images/branding/dragon_cup.png";

                    return (
                      <div key={item.product.id} className="py-3 sm:py-4 flex gap-3 sm:gap-4 items-center">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                          <Image 
                            src={img} 
                            alt={item.product.title} 
                            fill 
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-grow min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                            {item.product.category}
                          </span>
                          <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                            {item.product.title}
                          </h3>
                          <div className="text-xs font-extrabold text-[#F97316] mt-0.5">
                            {item.product.price} <span className="text-[10px] text-gray-400 font-normal">{item.product.unit || "/ pcs"}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[10px] text-gray-500 italic mt-0.5 truncate">
                              Catatan: {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/60 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white transition-all active:scale-90"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white transition-all active:scale-90"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-xs font-black text-gray-900">
                            {formatRupiah(itemTotal)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form & Total Sticky Card */}
            <div className="lg:col-span-5 space-y-4">
              <form onSubmit={handleCheckoutSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
                <h2 className="font-extrabold text-base text-gray-900 pb-2 border-b border-gray-100">
                  Data Pemesan & Pengiriman
                </h2>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Nama */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Lengkap Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama (Cafe & Resto Padang)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                  />
                </div>

                {/* Metode Penerimaan */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Metode Pengambilan / Pengiriman
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("kirim")}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center gap-2 ${
                        deliveryType === "kirim" 
                          ? "border-[#F97316] bg-orange-50/50 text-[#F97316]" 
                          : "border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      <Truck size={15} /> Kirim ke Alamat
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs font-bold flex items-center gap-2 ${
                        deliveryType === "pickup" 
                          ? "border-[#F97316] bg-orange-50/50 text-[#F97316]" 
                          : "border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      <Building2 size={15} /> Ambil di Toko
                    </button>
                  </div>
                </div>

                {/* Alamat bila kirim */}
                {deliveryType === "kirim" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Alamat Pengiriman (Kota Padang & Sekitarnya) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Jalan, No. Rumah/Ruko, Kelurahan, Kecamatan di Kota Padang..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                    />
                  </div>
                )}

                {/* Metode Pembayaran */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Metode Pembayaran
                  </label>
                  <div className="space-y-2">
                    {paymentOptions.map((opt: any) => (
                      <label 
                        key={opt.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === opt.id 
                            ? "border-[#F97316] bg-orange-50/40" 
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === opt.id}
                          onChange={() => setPaymentMethod(opt.id)}
                          className="mt-0.5 text-[#F97316] focus:ring-[#F97316]"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">{opt.name}</span>
                          {opt.details && (
                            <span className="text-[10px] text-gray-500 block">{opt.details}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Catatan Tambahan / Link Desain */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Catatan Tambahan / Link Google Drive Desain (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Link GDrive file cetak / catatan ukuran khusus..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
                  />
                </div>

                {/* Subtotal & Tombol Pesan */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-xs font-semibold text-gray-500">Total Pembelian:</span>
                    <span className="text-xl sm:text-2xl font-black text-[#F97316]">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Mencatat Pesanan...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={18} />
                        <span>Kirim & Konfirmasi Pesanan via WhatsApp</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Pesanan dicatat resmi di sistem & tim kami akan membalas langsung di WhatsApp.
                  </p>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
