import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrderInput } from "@/lib/validators";

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string | null;
  nameSnapshot: string;
  priceSnapshot: number;
  unitSnapshot: string | null;
  qty: number;
  designNote: string | null;
  total: number;
}

export interface OrderRecord {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  address: string | null;
  paymentMethod: string;
  note: string | null;
  subtotal: number;
  status: string;
  items: OrderItemRecord[];
  createdAt: string;
}

export function generateOrderCode(): string {
  const d = new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BAS-${yyyymmdd}-${randomSuffix}`;
}

export async function createOrder(
  input: OrderInput
): Promise<{ order: OrderRecord | null; error?: string }> {
  try {
    const productIds = input.items.map((i) => i.productId);
    const { data: prods, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price, unit")
      .in("id", productIds);

    if (pErr) {
      return { order: null, error: `Database error: ${pErr.message}` };
    }

    const prodMap = new Map<string, any>((prods || []).map((p: any) => [p.id, p]));

    const itemsToInsert: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of input.items) {
      const prod = prodMap.get(item.productId);
      const unitPrice = prod ? Number(prod.price) : 0;
      const prodName = prod ? prod.name : "Produk Custom";
      const itemSubtotal = unitPrice * item.qty;
      calculatedSubtotal += itemSubtotal;

      const itemId = "item-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      itemsToInsert.push({
        id: itemId,
        product_id: item.productId,
        product_name: prodName,
        product_price: unitPrice,
        qty: item.qty,
        subtotal: itemSubtotal,
        design_note: item.designNote || null,
      });
    }

    const orderId = "ord-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const orderCode = generateOrderCode();
    const now = new Date().toISOString();

    const { error: ordErr } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      code: orderCode,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      delivery_method: input.deliveryMethod,
      address: input.address || null,
      payment_method: input.paymentMethod,
      note: input.note || null,
      subtotal: calculatedSubtotal,
      status: "BARU",
      created_at: now,
      updated_at: now,
    });

    if (ordErr) {
      return { order: null, error: ordErr.message };
    }

    // Insert order items
    const finalItems = itemsToInsert.map((item) => ({
      ...item,
      order_id: orderId,
      created_at: now,
    }));

    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(finalItems);
    if (itemsErr) {
      console.error("[SUPABASE] Gagal simpan order_items:", itemsErr.message);
    }

    const createdOrder: OrderRecord = {
      id: orderId,
      code: orderCode,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryMethod: input.deliveryMethod,
      address: input.address || null,
      paymentMethod: input.paymentMethod,
      note: input.note || null,
      subtotal: calculatedSubtotal,
      status: "BARU",
      items: finalItems.map((it) => ({
        id: it.id,
        orderId,
        productId: it.product_id,
        nameSnapshot: it.product_name,
        priceSnapshot: it.product_price,
        unitSnapshot: "/ pcs",
        qty: it.qty,
        designNote: it.design_note,
        total: it.subtotal,
      })),
      createdAt: now,
    };

    return { order: createdOrder };
  } catch (err: any) {
    return { order: null, error: err.message || "Gagal membuat pesanan" };
  }
}

export async function getOrders(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: OrderRecord[]; total: number }> {
  try {
    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "SEMUA") {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      const start = options.offset || 0;
      query = query.range(start, start + options.limit - 1);
    }

    const { data, count, error } = await query;
    if (error || !data) {
      console.error("[SUPABASE] Gagal memuat pesanan:", error?.message);
      return { orders: [], total: 0 };
    }

    const orders: OrderRecord[] = data.map((o: any) => ({
      id: o.id,
      code: o.code,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      deliveryMethod: o.delivery_method,
      address: o.address,
      paymentMethod: o.payment_method,
      note: o.note,
      subtotal: Number(o.subtotal) || 0,
      status: o.status,
      items: (o.order_items || []).map((it: any) => ({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        nameSnapshot: it.product_name,
        priceSnapshot: Number(it.product_price) || 0,
        unitSnapshot: "/ pcs",
        qty: it.qty,
        designNote: it.design_note,
        total: Number(it.subtotal) || 0,
      })),
      createdAt: o.created_at,
    }));

    return {
      orders,
      total: count !== null ? count : orders.length,
    };
  } catch (err: any) {
    console.error("[SUPABASE_ERR] Error getOrders:", err);
    return { orders: [], total: 0 };
  }
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .or(`id.eq.${id},code.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      code: data.code,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      deliveryMethod: data.delivery_method,
      address: data.address,
      paymentMethod: data.payment_method,
      note: data.note,
      subtotal: Number(data.subtotal) || 0,
      status: data.status,
      items: (data.order_items || []).map((it: any) => ({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        nameSnapshot: it.product_name,
        priceSnapshot: Number(it.product_price) || 0,
        unitSnapshot: "/ pcs",
        qty: it.qty,
        designNote: it.design_note,
        total: Number(it.subtotal) || 0,
      })),
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .or(`id.eq.${id},code.eq.${id}`);

  return !error;
}
