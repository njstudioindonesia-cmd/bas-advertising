import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { InvoiceRecord, InvoiceSnapshot } from "./types";

/**
 * Format nomor invoice resmi: INV/CTK/YYYY/MM/XXXXXX
 */
export function generateInvoiceNumber(sequenceNum?: number): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const seq = sequenceNum
    ? String(sequenceNum).padStart(6, "0")
    : Math.floor(100000 + Math.random() * 900000).toString();

  return `INV/CTK/${year}/${month}/${seq}`;
}

/**
 * Token aman acak untuk akses invoice publik tanpa login
 */
export function generatePublicToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function createOrGetInvoice(
  orderId: string,
  snapshot: InvoiceSnapshot
): Promise<InvoiceRecord> {
  const invoiceNo = snapshot.invoiceNo || generateInvoiceNumber();
  const publicToken = generatePublicToken();
  const now = new Date().toISOString();

  try {
    const { data: existing } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        invoiceNo: existing.invoice_no,
        publicToken: existing.public_token,
        orderId: existing.order_id,
        issuedAt: existing.issued_at,
        paidAt: existing.paid_at,
        snapshot: existing.snapshot as InvoiceSnapshot,
      };
    }

    const { data: created, error } = await supabaseAdmin
      .from("invoices")
      .insert({
        invoice_no: invoiceNo,
        public_token: publicToken,
        order_id: orderId,
        issued_at: now,
        paid_at: snapshot.paidAt || null,
        snapshot,
      })
      .select("*")
      .maybeSingle();

    if (!error && created) {
      return {
        id: created.id,
        invoiceNo: created.invoice_no,
        publicToken: created.public_token,
        orderId: created.order_id,
        issuedAt: created.issued_at,
        paidAt: created.paid_at,
        snapshot: created.snapshot as InvoiceSnapshot,
      };
    }
  } catch (err) {
    console.warn("[INVOICES] Gagal menyimpan ke DB, menggunakan fallback in-memory:", err);
  }

  return {
    id: `inv_${Date.now()}`,
    invoiceNo,
    publicToken,
    orderId,
    issuedAt: now,
    snapshot,
  };
}
