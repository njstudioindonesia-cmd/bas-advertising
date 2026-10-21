import { WhatsAppMessageInput } from "./types";

/**
 * Normalisasi nomor HP Indonesia ke format internasional (62xxx)
 */
export function formatIndonesianPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Membuat link WhatsApp siap kirim (wa.me)
 */
export function createWhatsAppLink(input: WhatsAppMessageInput): string {
  const phone = formatIndonesianPhone(input.phone);
  let text = input.customMessage || "";

  if (!text) {
    text = `Halo ${input.customerName || "Kak"}, konfirmasi pesanan Cetak.inc dengan kode *${input.orderCode || "-"}*.`;
    if (input.status) {
      text += ` Status saat ini: *${input.status}*.`;
    }
    if (input.total) {
      text += ` Total: *Rp ${input.total.toLocaleString("id-ID")}*.`;
    }
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
