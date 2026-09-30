import crypto from "node:crypto";
import { ChainedAuditLogEntry, AuditActionType, AuditEntityType, SecuritySeverity } from "./types";
import { signAdminAction } from "./digital-signature";

export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

const STORAGE_KEY = "etn_cain_chained_audit_logs_v1";

// In-memory array fallback if localStorage is unavailable
let inMemoryChain: ChainedAuditLogEntry[] = [];

/**
 * Compute cryptographic SHA-256 hash of an audit log entry linked with previous hash
 */
export function computeEventHash(entryPayload: Omit<ChainedAuditLogEntry, "currentHash">, prevHash: string): string {
  const contentToHash = JSON.stringify({
    id: entryPayload.id,
    actorId: entryPayload.actorId,
    performedBy: entryPayload.performedBy,
    performedByRole: entryPayload.performedByRole,
    action: entryPayload.action,
    entityType: entryPayload.entityType,
    entityId: entryPayload.entityId,
    entityName: entryPayload.entityName,
    timestamp: entryPayload.timestamp,
    details: entryPayload.details || "",
    severity: entryPayload.severity,
    previousHash: prevHash,
  });

  return crypto.createHash("sha256").update(contentToHash, "utf8").digest("hex");
}

/**
 * Fetch all chained audit logs
 */
export function getChainedAuditLogs(): ChainedAuditLogEntry[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback to memory
    }
  }

  if (inMemoryChain.length === 0) {
    // Initialize with Genesis Event
    const genesisEntry = createGenesisLogEntry();
    inMemoryChain = [genesisEntry];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryChain));
      } catch {}
    }
  }

  return inMemoryChain;
}

function createGenesisLogEntry(): ChainedAuditLogEntry {
  const payload = {
    id: "aud-cain-genesis",
    actorId: "system",
    performedBy: "CAIN Security Engine",
    performedByRole: "SUPER_ADMIN",
    action: "CREATED" as AuditActionType,
    entityType: "security" as AuditEntityType,
    entityId: "cain-system-1",
    entityName: "CAIN Hash Chain Initialization",
    timestamp: new Date().toISOString(),
    details: "Initialized tamper-evident SHA-256 linked cryptographic audit chain",
    traceId: `tr-genesis-${Date.now()}`,
    previousHash: GENESIS_HASH,
    severity: "LOW" as SecuritySeverity,
  };

  const currentHash = computeEventHash(payload, GENESIS_HASH);

  return {
    ...payload,
    currentHash,
  };
}

/**
 * Append a new audit event to the tamper-evident hash chain
 */
export function recordChainedAuditLog(params: {
  actorId: string;
  performedBy: string;
  performedByRole: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  details?: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  severity?: SecuritySeverity;
  signWithRole?: string;
}): ChainedAuditLogEntry {
  const currentChain = getChainedAuditLogs();
  const lastEntry = currentChain.length > 0 ? currentChain[0] : createGenesisLogEntry(); // sorted desc in storage
  const previousHash = lastEntry ? lastEntry.currentHash : GENESIS_HASH;

  const id = `aud-cain-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();
  const traceId = `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const severity = params.severity || "LOW";

  const rawPayload = {
    id,
    actorId: params.actorId,
    performedBy: params.performedBy,
    performedByRole: params.performedByRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    timestamp,
    details: params.details,
    beforeData: params.beforeData,
    afterData: params.afterData,
    traceId,
    previousHash,
    severity,
  };

  const currentHash = computeEventHash(rawPayload, previousHash);

  let signature;
  if (params.signWithRole || params.performedByRole === "super_admin" || params.performedByRole === "admin") {
    signature = signAdminAction(currentHash, params.performedBy, params.performedByRole);
  }

  const fullEntry: ChainedAuditLogEntry = {
    ...rawPayload,
    currentHash,
    signature,
  };

  const updatedChain = [fullEntry, ...currentChain];
  inMemoryChain = updatedChain;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChain));
    } catch {}
  }

  return fullEntry;
}

/**
 * Verify the entire cryptographic audit log chain for integrity & tampering
 */
export function verifyAuditChain(): {
  isValid: boolean;
  totalLogs: number;
  brokenAtStep?: number;
  brokenLogId?: string;
  reason?: string;
} {
  const logs = getChainedAuditLogs();
  if (logs.length === 0) {
    return { isValid: true, totalLogs: 0 };
  }

  // Iterate from oldest to newest (reverse of stored descending order)
  const chronological = [...logs].reverse();

  for (let i = 0; i < chronological.length; i++) {
    const entry = chronological[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : chronological[i - 1].currentHash;

    if (entry.previousHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalLogs: logs.length,
        brokenAtStep: i,
        brokenLogId: entry.id,
        reason: `Previous hash mismatch at step ${i}. Stored prevHash: ${entry.previousHash}, expected: ${expectedPrevHash}`,
      };
    }

    const recomputedHash = computeEventHash(entry, entry.previousHash);
    if (recomputedHash !== entry.currentHash) {
      return {
        isValid: false,
        totalLogs: logs.length,
        brokenAtStep: i,
        brokenLogId: entry.id,
        reason: `Event hash mismatch at step ${i}. Stored: ${entry.currentHash}, recomputed: ${recomputedHash}`,
      };
    }
  }

  return {
    isValid: true,
    totalLogs: logs.length,
  };
}
