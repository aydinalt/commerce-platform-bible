export interface AuditEntry {
  action: string;
  actorUserId?: string;
  correlationId: string;
  effectiveBusinessId?: string;
  reason?: string;
  result: "ALLOWED" | "DENIED";
  safeMetadata?: Record<string, boolean | number | string>;
  targetId?: string;
  targetType: string;
}

export interface AuditWriter {
  record(entry: AuditEntry): Promise<void>;
}

export const auditModule = { name: "audit" } as const;
