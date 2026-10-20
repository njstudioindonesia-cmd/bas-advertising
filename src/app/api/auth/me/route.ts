import { NextResponse } from "next/server";
import { getSessionTokenFromCookies, validateSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";

export async function GET() {
  try {
    const token = await getSessionTokenFromCookies();
    if (!token || !validateSession(token)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = db.prepare("SELECT user_id FROM admin_sessions WHERE id = ?").get(token) as any;
    const user = session ? db.prepare("SELECT username FROM admin_users WHERE id = ?").get(session.user_id) as any : null;

    return NextResponse.json({
      authenticated: true,
      user: {
        username: user?.username || "admin"
      }
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
