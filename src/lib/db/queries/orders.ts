import { db } from "../client";
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

export function createOrder(input: OrderInput): { order: OrderRecord; error?: string } {
  // 1. Ambil data produk langsung dari database untuk menjamin keaslian harga
  const itemsWithPrice: {
    productId: string;
    name: string;
    price: number;
    unit: string;
    qty: number;
    designNote?: string | null;
  }[] = [];

  let calculatedSubtotal = 0;

  for (const item of input.items) {
    const prodRow = db.prepare("SELECT name, price, unit FROM products WHERE id = ?").get(item.productId) as any;
    if (!prodRow) {
      return { order: null as any, error: `Produk dengan ID ${item.productId} tidak ditemukan atau telah dihapus.` };
    }
    const unitPrice = Number(prodRow.price) || 0;
    calculatedSubtotal += unitPrice * item.qty;

    itemsWithPrice.push({
      productId: item.productId,
      name: prodRow.name,
      price: unitPrice,
      unit: prodRow.unit || "/ pcs",
      qty: item.qty,
      designNote: item.designNote || null,
    });
  }

  const orderId = "ord-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const orderCode = generateOrderCode();
  const now = new Date().toISOString();

  // Eksekusi transaksi
  db.exec("BEGIN TRANSACTION;");
  try {
    db.prepare(`
      INSERT INTO orders (id, code, customer_name, customer_phone, delivery_method, address, payment_method, note, subtotal, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderCode,
      input.customerName,
      input.customerPhone,
      input.deliveryMethod,
      input.address || null,
      input.paymentMethod,
      input.note || null,
      calculatedSubtotal,
      "BARU",
      now
    );

    const itemStmt = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, name_snapshot, price_snapshot, unit_snapshot, qty, design_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of itemsWithPrice) {
      const itemId = "item-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      itemStmt.run(
        itemId,
        orderId,
        item.productId,
        item.name,
        item.price,
        item.unit,
        item.qty,
        item.designNote
      );
    }

    db.exec("COMMIT;");
  } catch (err: any) {
    db.exec("ROLLBACK;");
    throw err;
  }

  return { order: getOrderById(orderId)! };
}

export function getOrders(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): { orders: OrderRecord[]; total: number } {
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (options?.status && options.status !== "Semua") {
    whereClauses.push("status = ?");
    params.push(options.status);
  }

  const whereSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  const totalRow = db.prepare(`SELECT COUNT(*) as total FROM orders ${whereSql}`).get(...params) as any;
  const total = totalRow ? Number(totalRow.total) : 0;

  let query = `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC`;
  if (options?.limit) {
    query += " LIMIT ? OFFSET ?";
    params.push(options.limit, options.offset || 0);
  }

  const orderRows = db.prepare(query).all(...params) as any[];
  const orders = orderRows.map((o) => getOrderDetails(o));

  return { orders, total };
}

export function getOrderById(id: string): OrderRecord | null {
  const o = db.prepare("SELECT * FROM orders WHERE id = ? OR code = ?").get(id, id) as any;
  if (!o) return null;
  return getOrderDetails(o);
}

function getOrderDetails(o: any): OrderRecord {
  const itemRows = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id) as any[];
  const items: OrderItemRecord[] = itemRows.map((it) => ({
    id: it.id,
    orderId: it.order_id,
    productId: it.product_id,
    nameSnapshot: it.name_snapshot,
    priceSnapshot: Number(it.price_snapshot),
    unitSnapshot: it.unit_snapshot,
    qty: Number(it.qty),
    designNote: it.design_note,
    total: Number(it.price_snapshot) * Number(it.qty),
  }));

  return {
    id: o.id,
    code: o.code,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    deliveryMethod: o.delivery_method,
    address: o.address,
    paymentMethod: o.payment_method,
    note: o.note,
    subtotal: Number(o.subtotal),
    status: o.status || "BARU",
    items,
    createdAt: o.created_at,
  };
}

export function updateOrderStatus(id: string, status: string): boolean {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return true;
}
