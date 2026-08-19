import { z } from 'zod';

export type AuditAction = 'create' | 'update' | 'rollback' | 'approve' | 'reject';

export const AuditActionSchema = z.enum(['create', 'update', 'rollback', 'approve', 'reject']);

export interface AuditEvent {
  id: string;
  businessId: string;
  action: AuditAction;
  changedBy: string; // e.g. "ai/claude-3-5-sonnet" | "user/email@example.com"
  details: Record<string, unknown>;
  timestamp: string; // ISO 8601 string
}

export const AuditEventSchema = z.object({
  id: z.string().min(1, 'Audit ID is required'),
  businessId: z.string().min(1, 'Business ID is required'),
  action: AuditActionSchema,
  changedBy: z.string().min(1, 'changedBy identity is required'),
  details: z.record(z.unknown()),
  timestamp: z.string().datetime({ message: 'Timestamp must be ISO 8601' }),
});

export function createAuditEvent(params: {
  id?: string;
  businessId: string;
  action: AuditAction;
  changedBy: string;
  details?: Record<string, unknown>;
}): AuditEvent {
  return {
    id: params.id ?? `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    businessId: params.businessId,
    action: params.action,
    changedBy: params.changedBy,
    details: params.details ?? {},
    timestamp: new Date().toISOString(),
  };
}
