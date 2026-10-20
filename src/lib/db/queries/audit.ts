import { db } from "../client";

export interface AuditLogInput {
  actor: string;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: any;
}

export function logAudit(
  actorOrInput: string | AuditLogInput,
  action?: string,
  entity?: string,
  entityId?: string | null,
  diff?: any
): void {
  try {
    let act: string;
    let actn: string;
    let ent: string;
    let eid: string | null = null;
    let df: any = null;

    if (typeof actorOrInput === "object" && actorOrInput !== null) {
      act = actorOrInput.actor;
      actn = actorOrInput.action;
      ent = actorOrInput.entity;
      eid = actorOrInput.entityId || null;
      df = actorOrInput.diff || null;
    } else {
      act = actorOrInput;
      actn = action || "UNKNOWN";
      ent = entity || "system";
      eid = entityId || null;
      df = diff || null;
    }

    const id = "aud-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const diffStr = df ? (typeof df === "string" ? df : JSON.stringify(df)) : null;

    db.prepare(`
      INSERT INTO audit_log (id, actor, action, entity, entity_id, diff, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, act, actn, ent, eid, diffStr, now);
  } catch (err) {
    console.error("Gagal mencatat audit log:", err);
  }
}

export function getAuditLogs(limit = 50): any[] {
  return db.prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?").all(limit) as any[];
}
