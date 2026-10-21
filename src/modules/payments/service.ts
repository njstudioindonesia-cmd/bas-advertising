import { supabaseAdmin } from "@/lib/supabase/admin";
import { PaymentRecord, ManualPaymentAccount } from "./types";
import { transitionOrderStatus } from "../orders/service";
import { publishEvent } from "@/lib/events";
import { logAudit } from "@/lib/db/queries/audit";

export const DEFAULT_PAYMENT_ACCOUNTS: ManualPaymentAccount[] = [
  {
    bank: "BCA (Bank Central Asia)",
    accountNumber: "0321948291",
    accountName: "Cetak.inc BAS Advertising",
    instructions: [
      "Transfer sesuai total nominal hingga 3 digit kode unik terakhir.",
      "Simpan dan unggah bukti transfer/screenshot m-banking Anda.",
      "Admin Urang Dalam akan memverifikasi pesanan Anda dalam 5-15 menit.",
    ],
  },
  {
    bank: "Mandiri",
    accountNumber: "1110018274621",
    accountName: "Cetak.inc BAS Advertising",
    instructions: [
      "Transfer antar bank atau via Livin by Mandiri.",
      "Pastikan nama penerima Cetak.inc BAS Advertising.",
    ],
  },
];

/**
 * Menghasilkan kode unik 3 digit (100 - 999) untuk memudahkan rekonsiliasi mutasi bank
 */
export function generateUniqueCode(): number {
  return Math.floor(100 + Math.random() * 899);
}

export async function submitPaymentProof(
  orderId: string,
  amount: number,
  proofUrl: string
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: orderId,
        amount,
        proof_url: proofUrl,
        status: "PENDING",
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.warn("[PAYMENTS] Gagal menyimpan ke DB payments:", error.message);
    }

    // Update order status menjadi MENUNGGU_VERIFIKASI
    await transitionOrderStatus(orderId, "MENUNGGU_VERIFIKASI", {
      id: "customer",
      role: "customer",
      username: "customer",
    });

    return { success: true, paymentId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah bukti bayar" };
  }
}

export async function verifyPayment(
  paymentId: string,
  orderId: string,
  adminUser: { id: string; username: string }
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  try {
    // 1. Update status pembayaran menjadi VERIFIED
    await supabaseAdmin
      .from("payments")
      .update({
        status: "VERIFIED",
        verified_by: adminUser.username,
        verified_at: now,
      })
      .eq("id", paymentId);

    // 2. Transisi status pesanan menjadi DIBAYAR
    const res = await transitionOrderStatus(orderId, "DIBAYAR", {
      id: adminUser.id,
      role: "admin",
      username: adminUser.username,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    logAudit({
      actor: `admin:${adminUser.username}`,
      action: "VERIFY_PAYMENT",
      entity: "payments",
      entityId: paymentId,
      diff: { orderId, status: "VERIFIED" },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memverifikasi pembayaran" };
  }
}
