import { db } from "../client";

export interface PortfolioRecord {
  id: string;
  title: string;
  client: string | null;
  category: string;
  imageUrl: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function getPortfolio(includeInactive = false): PortfolioRecord[] {
  const query = includeInactive
    ? "SELECT * FROM portfolio ORDER BY sort_order ASC, created_at DESC"
    : "SELECT * FROM portfolio WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC";

  const rows = db.prepare(query).all() as any[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    client: r.client,
    category: r.category || "All Work",
    imageUrl: r.image_url,
    description: r.description,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
  }));
}

export function createPortfolioItem(input: {
  title: string;
  client?: string | null;
  category?: string | null;
  imageUrl: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}): PortfolioRecord {
  const id = "port-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO portfolio (id, title, client, category, image_url, description, sort_order, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.title,
    input.client || null,
    input.category || "All Work",
    input.imageUrl,
    input.description || null,
    input.sortOrder || 0,
    input.isActive !== undefined ? (input.isActive ? 1 : 0) : 1,
    now
  );

  const r = db.prepare("SELECT * FROM portfolio WHERE id = ?").get(id) as any;
  return {
    id: r.id,
    title: r.title,
    client: r.client,
    category: r.category,
    imageUrl: r.image_url,
    description: r.description,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at,
  };
}

export function updatePortfolioItem(id: string, input: any): PortfolioRecord | null {
  const existing = db.prepare("SELECT * FROM portfolio WHERE id = ?").get(id) as any;
  if (!existing) return null;

  const title = input.title ?? existing.title;
  const client = input.client !== undefined ? input.client : existing.client;
  const category = input.category ?? existing.category;
  const imageUrl = input.imageUrl ?? existing.image_url;
  const description = input.description !== undefined ? input.description : existing.description;
  const sortOrder = input.sortOrder !== undefined ? input.sortOrder : existing.sort_order;
  const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : existing.is_active;

  db.prepare(`
    UPDATE portfolio SET
      title = ?, client = ?, category = ?, image_url = ?, description = ?, sort_order = ?, is_active = ?
    WHERE id = ?
  `).run(title, client, category, imageUrl, description, sortOrder, isActive, id);

  return db.prepare("SELECT * FROM portfolio WHERE id = ?").get(id) as any;
}

export function deletePortfolioItem(id: string): boolean {
  db.prepare("DELETE FROM portfolio WHERE id = ?").run(id);
  return true;
}
