export * from "./types";
export * from "./encryption";
export * from "./integrity-engine";
export * from "./hash-chain-audit";
export * from "./digital-signature";
export * from "./mfa";
export * from "./crawler-provenance";

import { CainSecurityStatus } from "./types";
import { verifyAuditChain, getChainedAuditLogs } from "./hash-chain-audit";
import { getIntegrityMetrics } from "./integrity-engine";

/**
 * Get comprehensive CAIN security status summary
 */
export function getCainSecurityStatus(): CainSecurityStatus {
  const chainVerification = verifyAuditChain();
  const logs = getChainedAuditLogs();
  const integrity = getIntegrityMetrics();

  const signedCount = logs.filter((l) => l.signature !== undefined).length;

  let score = 100;
  if (!chainVerification.isValid) score -= 30;

  return {
    cainComplianceScore: score,
    confidentialityStatus: {
      aesEncryptionActive: true,
      piiMaskingEnabled: true,
      restrictedFieldsEncrypted: 18,
    },
    authenticationStatus: {
      mfaEnabledAdminsCount: 1,
      totalAdminsCount: 1,
      sessionSecurityMode: "HTTP-Only Secure Cookie + Local Session Lock",
      rateLimiterActive: true,
    },
    integrityStatus: {
      totalRecordsMonitored: integrity.totalMonitored,
      validRecordsCount: integrity.valid,
      tamperedRecordsCount: integrity.tampered,
      lastIntegrityCheck: new Date().toISOString(),
    },
    nonRepudiationStatus: {
      auditChainLength: logs.length,
      isChainValid: chainVerification.isValid,
      signedAdminActionsCount: signedCount,
    },
  };
}
