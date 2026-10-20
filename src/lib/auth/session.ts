import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "../db/client";
import { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "bas_admin_token";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

// Inisialisasi admin user default bila belum ada
export function ensureInitialAdminUser() {
  const existing = db.prepare("SELECT COUNT(*) as count FROM admin_users").get() as any;
  if (!existing || existing.count === 0) {
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "UrangDalamBAS2026!#";
    const id = "admin-" + crypto.randomUUID();
    const hash = hashPassword(adminPass);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, adminUser, hash, now);
    console.log(`[AUTH] Admin user '${adminUser}' berhasil dibuat secara otomatis.`);
  }
}

export function authenticateAdmin(username: string, password: string): { success: boolean; token?: string; error?: string } {
  ensureInitialAdminUser();

  const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username) as any;
  if (!user) {
    return { success: false, error: "Username atau password salah." };
  }

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) {
    return { success: false, error: "Username atau password salah." };
  }

  // Buat sesi baru
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  db.prepare(`
    INSERT INTO admin_sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(sessionId, user.id, expiresAt);

  return { success: true, token: sessionId };
}

export function validateSession(token: string): boolean {
  if (!token) return false;
  const now = Date.now();
  const session = db.prepare(`
    SELECT * FROM admin_sessions 
    WHERE id = ? AND expires_at > ?
  `).get(token, now) as any;

  if (!session) {
    // Bersihkan sesi kedaluwarsa jika ada
    db.prepare("DELETE FROM admin_sessions WHERE id = ?").run(token);
    return false;
  }
  return true;
}

export function deleteSession(token: string): void {
  if (!token) return;
  db.prepare("DELETE FROM admin_sessions WHERE id = ?").run(token);
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const c = cookieStore.get(SESSION_COOKIE);
  return c?.value || null;
}
