import type { Request } from "express";
import { AuditLog } from "../models/index.js";
import type { AuditTargetType } from "../models/AuditLog.model.js";

export interface RecordAuditLogInput {
  req?: Request;
  actorUserId?: number | null;
  actorName?: string;
  actorRole?: string;
  action: string;
  targetType: AuditTargetType;
  targetId?: string | number | null;
  companyName?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Persists an immutable audit trail entry without throwing if logging fails
 * (so primary business operations are never blocked by telemetry).
 */
export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
  try {
    const req = input.req;
    const forwarded = req?.headers["x-forwarded-for"];
    const ipAddress =
      typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : req?.ip || req?.socket?.remoteAddress || null;

    await AuditLog.create({
      actorUserId: input.actorUserId ?? req?.user?.id ?? null,
      actorName: input.actorName || req?.user?.fullName || "System Administrator",
      actorRole: input.actorRole || req?.user?.role || "system",
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId !== undefined && input.targetId !== null ? String(input.targetId) : null,
      companyName: input.companyName ?? null,
      summary: input.summary,
      metadata: input.metadata ?? null,
      ipAddress,
    });
  } catch (err) {
    console.error("[AUDIT LOG ERROR]:", err);
  }
}
