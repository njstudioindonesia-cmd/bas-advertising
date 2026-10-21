import { supabaseAdmin } from "@/lib/supabase/admin";
import { Order, OrderStatus } from "./types";
import { canTransitionOrder, normalizeOrderStatus } from "./state-machine";
import { UserRole } from "../auth/types";
import { publishEvent } from "@/lib/events";
import { logAudit } from "@/lib/db/queries/audit";

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data: ord, error: ordErr } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (ordErr || !ord) return null;

    return {
      id: ord.id,
      code: ord.code,
      customerName: ord.customer_name,
      customerPhone: ord.customer_phone,
      deliveryMethod: ord.delivery_method,
      address: ord.address,
      destLat: ord.dest_lat,
      destLng: ord.dest_lng,
      destAddress: ord.dest_address,
      destNote: ord.dest_note,
      deliveryFee: Number(ord.delivery_fee || 0),
      paymentMethod: ord.payment_method,
      paymentStatus: ord.payment_status || "UNPAID",
      uniqueCode: ord.unique_code || 0,
      hubId: ord.hub_id,
      note: ord.note,
      subtotal: Number(ord.subtotal),
      status: ord.status as OrderStatus,
      items: (ord.order_items || []).map((it: any) => ({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        productName: it.product_name,
        price: Number(it.product_price),
        qty: it.qty,
        subtotal: Number(it.subtotal),
        designNote: it.design_note,
      })),
      idempotencyKey: ord.idempotency_key,
      createdAt: ord.created_at,
      updatedAt: ord.updated_at,
    };
  } catch (err) {
    console.error("[ORDERS MODULE] Gagal getOrderById:", err);
    return null;
  }
}

export async function transitionOrderStatus(
  orderId: string,
  targetStatus: OrderStatus,
  user: { id: string; role: UserRole; username: string }
): Promise<{ success: boolean; newStatus?: OrderStatus; error?: string }> {
  const current = await getOrderById(orderId);
  if (!current) {
    return { success: false, error: "Pesanan tidak ditemukan." };
  }

  const check = canTransitionOrder(current.status, targetStatus, user.role);
  if (!check.allowed) {
    return { success: false, error: check.error };
  }

  const now = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: targetStatus,
    updated_at: now,
  };

  if (targetStatus === "DIBAYAR") {
    updatePayload.payment_status = "PAID";
  } else if (targetStatus === "PEMBAYARAN_DITOLAK") {
    updatePayload.payment_status = "REJECTED";
  }

  const { error: updErr } = await supabaseAdmin
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId);

  if (updErr) {
    return { success: false, error: `Gagal memperbarui status: ${updErr.message}` };
  }

  // Audit Log
  logAudit({
    actor: `${user.role}:${user.username}`,
    action: "TRANSITION_ORDER_STATUS",
    entity: "orders",
    entityId: orderId,
    diff: {
      from: current.status,
      to: targetStatus,
    },
  });

  // Outbox Event
  if (check.rule?.emitEvent) {
    await publishEvent(check.rule.emitEvent, {
      orderId,
      orderCode: current.code,
      fromStatus: current.status,
      toStatus: targetStatus,
      hubId: current.hubId,
      customerPhone: current.customerPhone,
      timestamp: now,
    });
  }

  return { success: true, newStatus: targetStatus };
}
