import { db } from "../client";
import { CategoryInput } from "@/lib/validators";

export interface CategoryRecord {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export function getCategories(includeInactive = false): CategoryRecord[] {
  const query = includeInactive
    ? `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count 
       FROM categories c ORDER BY c.sort_order ASC, c.name ASC`
    : `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count 
       FROM categories c WHERE c.is_active = 1 ORDER BY c.sort_order ASC, c.name ASC`;

  const rows = db.prepare(query).all() as any[];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    icon: r.icon,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    productCount: Number(r.product_count || 0),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getCategoryById(id: string): CategoryRecord | null {
  const r = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as any;
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    icon: r.icon,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function getCategoryBySlug(slug: string): CategoryRecord | null {
  const r = db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as any;
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    icon: r.icon,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function createCategory(input: CategoryInput): CategoryRecord {
  const id = input.id || "cat-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const rawSlug = (input.slug && input.slug.trim()) || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = rawSlug || "kategori";
  
  // Prevent UNIQUE constraint failed: categories.slug
  let counter = 1;
  while (db.prepare("SELECT 1 FROM categories WHERE slug = ?").get(slug)) {
    slug = `${rawSlug || "kategori"}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO categories (id, slug, name, icon, sort_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    slug,
    input.name,
    input.icon || null,
    input.sortOrder || 0,
    input.isActive !== undefined ? (input.isActive ? 1 : 0) : 1,
    now,
    now
  );

  return getCategoryById(id)!;
}

export function updateCategory(id: string, input: Partial<CategoryInput>): CategoryRecord | null {
  const existing = getCategoryById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = input.name ?? existing.name;
  
  let slug = existing.slug;
  if (input.slug && input.slug.trim()) {
    const rawSlug = input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    slug = rawSlug || "kategori";
    let counter = 1;
    while (db.prepare("SELECT 1 FROM categories WHERE slug = ? AND id != ?").get(slug, id)) {
      slug = `${rawSlug || "kategori"}-${counter}`;
      counter++;
    }
  }

  const icon = input.icon !== undefined ? input.icon : existing.icon;
  const sortOrder = input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder;
  const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);

  db.prepare(`
    UPDATE categories 
    SET name = ?, slug = ?, icon = ?, sort_order = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `).run(name, slug, icon, sortOrder, isActive, now, id);

  return getCategoryById(id);
}

export function deleteCategory(id: string): { success: boolean; error?: string } {
  // Cek apakah masih ada produk di kategori ini (RESTRICT rule)
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?").get(id) as any;
  if (productCount && productCount.count > 0) {
    return {
      success: false,
      error: `Tidak dapat menghapus kategori ini karena masih berisi ${productCount.count} produk. Silakan pindahkan atau hapus produk terlebih dahulu.`,
    };
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return { success: true };
}
