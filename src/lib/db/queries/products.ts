import fs from "node:fs";
import path from "node:path";
import { db } from "../client";
import { ProductInput } from "@/lib/validators";

export function syncProductsToJson(): void {
  try {
    const jsonPath = path.join(process.cwd(), "src", "data", "products.json");
    const { products } = getProducts({ includeInactive: true });
    
    const serialized = products.map((p) => ({
      id: p.id,
      category: p.category,
      categoryId: p.categoryId,
      title: p.name,
      name: p.name,
      desc: p.description,
      description: p.description,
      price: p.price,
      priceNumber: p.priceNumber,
      normalPrice: p.normalPrice,
      compareAtPrice: p.compareAtPrice,
      unit: p.unit,
      rating: p.rating,
      sold: p.sold,
      isBestSeller: p.isBestSeller,
      isActive: p.isActive,
      img: p.imageUrl,
      imageUrl: p.imageUrl,
      images: p.images,
      specs: p.specs,
    }));

    fs.writeFileSync(jsonPath, JSON.stringify(serialized, null, 2), "utf-8");
  } catch {
    // Pada filesystem read-only (seperti Vercel Lambda /var/task), lewati sinkronisasi file lokal
  }
}

export interface FormattedProduct {
  id: string;
  slug: string;
  name: string;
  title: string; // alias untuk kompatibilitas UI
  categoryId: string;
  category: string; // nama kategori
  description: string;
  desc: string; // alias
  price: string; // format tampilan "Rp 25.000"
  priceNumber: number; // integer 25000
  normalPrice?: string; // "Rp 35.000"
  compareAtPrice: number | null;
  unit: string;
  imageUrl: string;
  img: string; // alias
  gallery: string[];
  images: string[]; // alias
  specs: string[];
  isBestSeller: boolean;
  isActive: boolean;
  rating: string;
  sold: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function formatRupiah(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

function mapRowToProduct(r: any): FormattedProduct {
  const priceNum = Number(r.price) || 0;
  const compareAtNum = r.compare_at_price ? Number(r.compare_at_price) : null;
  
  let gallery: string[] = [];
  try {
    if (r.gallery) gallery = JSON.parse(r.gallery);
  } catch {
    gallery = [];
  }

  let specs: string[] = [];
  try {
    if (r.specs) specs = JSON.parse(r.specs);
  } catch {
    specs = [];
  }

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    title: r.name,
    categoryId: r.category_id,
    category: r.category_name || "Lainnya",
    description: r.description || "",
    desc: r.description || "",
    price: formatRupiah(priceNum),
    priceNumber: priceNum,
    normalPrice: compareAtNum ? formatRupiah(compareAtNum) : undefined,
    compareAtPrice: compareAtNum,
    unit: r.unit || "/ pcs",
    imageUrl: r.image_url,
    img: r.image_url,
    gallery,
    images: gallery.length > 0 ? gallery : [r.image_url],
    specs,
    isBestSeller: Boolean(r.is_best_seller),
    isActive: Boolean(r.is_active),
    rating: r.rating || "5.0",
    sold: r.sold || "0",
    sortOrder: r.sort_order || 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function getProducts(options?: {
  category?: string;
  search?: string;
  includeInactive?: boolean;
  isBestSeller?: boolean;
  limit?: number;
  offset?: number;
}): { products: FormattedProduct[]; total: number } {
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (!options?.includeInactive) {
    whereClauses.push("p.is_active = 1");
  }

  if (options?.category && options.category !== "Semua") {
    whereClauses.push("(c.name = ? OR c.id = ? OR c.slug = ?)");
    params.push(options.category, options.category, options.category);
  }

  if (options?.search) {
    const q = `%${options.search.toLowerCase()}%`;
    whereClauses.push("(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(c.name) LIKE ?)");
    params.push(q, q, q);
  }

  if (options?.isBestSeller !== undefined) {
    whereClauses.push("p.is_best_seller = ?");
    params.push(options.isBestSeller ? 1 : 0);
  }

  const whereSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

  // Count total
  const countStmt = db.prepare(`
    SELECT COUNT(*) as total 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereSql}
  `);
  const totalRow = countStmt.get(...params) as any;
  const total = totalRow ? Number(totalRow.total) : 0;

  // Query products
  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereSql}
    ORDER BY p.sort_order ASC, p.created_at DESC
  `;

  if (options?.limit) {
    query += ` LIMIT ? OFFSET ?`;
    params.push(options.limit, options.offset || 0);
  }

  const rows = db.prepare(query).all(...params) as any[];
  return {
    products: rows.map(mapRowToProduct),
    total,
  };
}

export function getProductById(id: string): FormattedProduct | null {
  const query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? OR p.slug = ?
  `;
  const r = db.prepare(query).get(id, id) as any;
  if (!r) return null;
  return mapRowToProduct(r);
}

export function createProduct(input: ProductInput): FormattedProduct {
  const rawSlug = (input.slug && input.slug.trim()) || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = rawSlug || "produk";
  const id = input.id || slug + "-" + Date.now().toString(36);

  // Prevent UNIQUE constraint failed: products.slug
  let counter = 1;
  while (db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) {
    slug = `${rawSlug || "produk"}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO products (
      id, slug, category_id, name, description, price, compare_at_price,
      unit, image_url, gallery, specs, is_best_seller, is_active,
      rating, sold, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    slug,
    input.categoryId,
    input.name,
    input.description || "",
    input.price,
    input.compareAtPrice || null,
    input.unit || "/ pcs",
    input.imageUrl,
    JSON.stringify(input.gallery || []),
    JSON.stringify(input.specs || []),
    input.isBestSeller ? 1 : 0,
    input.isActive !== undefined ? (input.isActive ? 1 : 0) : 1,
    input.rating || "5.0",
    input.sold || "0",
    input.sortOrder || 0,
    now,
    now
  );

  const created = getProductById(id)!;
  syncProductsToJson();
  return created;
}

export function updateProduct(id: string, input: Partial<ProductInput>): FormattedProduct | null {
  const existing = getProductById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = input.name ?? existing.name;
  let slug = existing.slug;
  if (input.slug && input.slug.trim()) {
    const rawSlug = input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    slug = rawSlug || "produk";
    let counter = 1;
    while (db.prepare("SELECT 1 FROM products WHERE slug = ? AND id != ?").get(slug, id)) {
      slug = `${rawSlug || "produk"}-${counter}`;
      counter++;
    }
  }
  const categoryId = input.categoryId ?? existing.categoryId;
  const description = input.description ?? existing.description;
  const price = input.price !== undefined ? input.price : existing.priceNumber;
  const compareAtPrice = input.compareAtPrice !== undefined ? input.compareAtPrice : existing.compareAtPrice;
  const unit = input.unit ?? existing.unit;
  const imageUrl = input.imageUrl ?? existing.imageUrl;
  const gallery = input.gallery ? JSON.stringify(input.gallery) : JSON.stringify(existing.gallery);
  const specs = input.specs ? JSON.stringify(input.specs) : JSON.stringify(existing.specs);
  const isBestSeller = input.isBestSeller !== undefined ? (input.isBestSeller ? 1 : 0) : (existing.isBestSeller ? 1 : 0);
  const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);
  const rating = input.rating ?? existing.rating;
  const sold = input.sold ?? existing.sold;
  const sortOrder = input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder;

  db.prepare(`
    UPDATE products SET
      name = ?, slug = ?, category_id = ?, description = ?, price = ?, compare_at_price = ?,
      unit = ?, image_url = ?, gallery = ?, specs = ?, is_best_seller = ?, is_active = ?,
      rating = ?, sold = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    name, slug, categoryId, description, price, compareAtPrice,
    unit, imageUrl, gallery, specs, isBestSeller, isActive,
    rating, sold, sortOrder, now, id
  );

  const updated = getProductById(id);
  syncProductsToJson();
  return updated;
}

export function deleteProduct(id: string, softDelete = true): boolean {
  if (softDelete) {
    db.prepare("UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?").run(new Date().toISOString(), id);
    syncProductsToJson();
    return true;
  }
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  syncProductsToJson();
  return true;
}
