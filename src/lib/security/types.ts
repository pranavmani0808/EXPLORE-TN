export type DataClassification = "PUBLIC" | "PRIVATE" | "RESTRICTED";

export type SecuritySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuditActionType =
  | "CREATED"
  | "UPDATED"
  | "VERIFIED"
  | "DELETED"
  | "APPROVED"
  | "REJECTED"
  | "ROLE_CHANGED"
  | "SUSPENDED"
  | "BACKUP"
  | "SUBMITTED"
  | "PUBLISHED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "PASSWORD_CHANGED"
  | "SESSION_REVOKED"
  | "RECORD_TAMPERED";

export type AuditEntityType =
  | "user"
  | "place"
  | "route"
  | "media"
  | "review"
  | "weather"
  | "system"
  | "security";

export interface CryptographicSignature {
  signature: string;
  signedBy: string;
  signerRole: string;
  timestamp: string;
  algorithm: "HMAC-SHA256" | "RSA-SHA256";
  payloadHash: string;
}

export interface ChainedAuditLogEntry {
  id: string;
  actorId: string;
  performedBy: string;
  performedByRole: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  timestamp: string;
  details?: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  traceId: string;
  // CAIN Non-Repudiation & Integrity fields
  previousHash: string;
  currentHash: string;
  signature?: CryptographicSignature;
  severity: SecuritySeverity;
}

export interface RecordVersionEntry {
  versionId: string;
  recordId: string;
  entityType: AuditEntityType;
  versionNumber: number;
  dataHash: string;
  previousHash: string;
  data: Record<string, any>;
  updatedBy: string;
  timestamp: string;
  classification: DataClassification;
}

export interface MfaConfig {
  userId: string;
  secret: string;
  qrCodeUrl: string;
  isEnabled: boolean;
  backupCodes: string[];
  hashedBackupCodes: string[];
  lastVerifiedAt?: string;
}

export interface DataProvenance {
  id: string;
  sourceUrl: string;
  sourceHash: string;
  fetchedAt: string;
  approvedBy?: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  trustScore: number; // 0 - 100
  rawContentHash: string;
}

export interface CainSecurityStatus {
  cainComplianceScore: number;
  confidentialityStatus: {
    aesEncryptionActive: boolean;
    piiMaskingEnabled: boolean;
    restrictedFieldsEncrypted: number;
  };
  authenticationStatus: {
    mfaEnabledAdminsCount: number;
    totalAdminsCount: number;
    sessionSecurityMode: string;
    rateLimiterActive: boolean;
  };
  integrityStatus: {
    totalRecordsMonitored: number;
    validRecordsCount: number;
    tamperedRecordsCount: number;
    lastIntegrityCheck: string;
  };
  nonRepudiationStatus: {
    auditChainLength: number;
    isChainValid: boolean;
    signedAdminActionsCount: number;
  };
}
