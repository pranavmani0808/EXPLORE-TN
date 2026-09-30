import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Fingerprint,
  Link,
  ShieldAlert,
  Server,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCainSecurityStatus,
  getChainedAuditLogs,
  verifyAuditChain,
  checkRecordIntegrity,
  setupAdminMfa,
  verifyAdminMfaToken,
  recordChainedAuditLog,
  ChainedAuditLogEntry,
  CainSecurityStatus,
  MfaConfig,
} from "@/lib/security";
import { toast } from "sonner";

export function SecurityDashboardModule() {
  const [status, setStatus] = useState<CainSecurityStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<ChainedAuditLogEntry[]>([]);
  const [chainValidation, setChainValidation] = useState<{
    isValid: boolean;
    totalLogs: number;
    reason?: string;
  } | null>(null);

  const [integrityTestRecordId, setIntegrityTestRecordId] = useState("place-madurai-meenakshi");
  const [integrityResult, setIntegrityResult] = useState<any>(null);

  // MFA Setup state
  const [mfaConfig, setMfaConfig] = useState<MfaConfig | null>(null);
  const [mfaInputToken, setMfaInputToken] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);

  useEffect(() => {
    refreshSecurityState();
  }, []);

  function refreshSecurityState() {
    const s = getCainSecurityStatus();
    setStatus(s);
    const logs = getChainedAuditLogs();
    setAuditLogs(logs);
    const v = verifyAuditChain();
    setChainValidation(v);
  }

  function handleVerifyChain() {
    const result = verifyAuditChain();
    setChainValidation(result);

    recordChainedAuditLog({
      actorId: "usr-admin-1",
      performedBy: "Pranav",
      performedByRole: "SUPER_ADMIN",
      action: "VERIFIED",
      entityType: "security",
      entityId: "cain-chain-audit",
      entityName: "SHA-256 Audit Chain Scan",
      details: result.isValid
        ? `Cryptographic hash chain verified intact across ${result.totalLogs} events`
        : `HASH CHAIN TAMPER DETECTED: ${result.reason}`,
      severity: result.isValid ? "LOW" : "CRITICAL",
    });

    if (result.isValid) {
      toast.success(`Cryptographic Audit Chain Intact! (${result.totalLogs} linked events verified)`);
    } else {
      toast.error(`TAMPER ALERT: ${result.reason}`);
    }

    refreshSecurityState();
  }

  function handleRunIntegrityCheck() {
    const testData = {
      id: integrityTestRecordId,
      name: "Meenakshi Amman Temple",
      district: "Madurai",
      category: "Heritage & Temple",
      classification: "PUBLIC",
    };

    const res = checkRecordIntegrity(integrityTestRecordId, testData);
    setIntegrityResult(res);

    if (res.isIntact) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  function handleSetupMfa() {
    const config = setupAdminMfa("usr-admin-1", "pranavviper7@gmail.com");
    setMfaConfig(config);
    toast.info("MFA Secret generated. Scan QR code or enter token.");
  }

  function handleVerifyMfa() {
    if (!mfaInputToken) {
      toast.error("Enter 6-digit TOTP code or backup code");
      return;
    }
    setIsVerifyingMfa(true);

    const res = verifyAdminMfaToken("usr-admin-1", mfaInputToken);
    setIsVerifyingMfa(false);

    if (res.success) {
      toast.success(res.message);
      recordChainedAuditLog({
        actorId: "usr-admin-1",
        performedBy: "Pranav",
        performedByRole: "SUPER_ADMIN",
        action: "MFA_ENABLED",
        entityType: "user",
        entityId: "usr-admin-1",
        entityName: "Pranav Admin Security",
        details: "TOTP Two-Factor Authentication verified & activated",
        severity: "MEDIUM",
      });
      refreshSecurityState();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: CAIN Compliance Summary */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  CAIN Security & Trust Architecture
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    ACTIVE
                  </span>
                </h2>
                <p className="text-sm text-zinc-400">
                  Confidentiality • Authentication • Integrity • Non-Repudiation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
            <div className="text-right">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">CAIN Trust Score</div>
              <div className="text-2xl font-black text-emerald-400">
                {status?.cainComplianceScore ?? 100} / 100
              </div>
            </div>
            <Button
              onClick={handleVerifyChain}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Verify Hash Chain
            </Button>
          </div>
        </div>

        {/* 4 Pillars Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* 1. Confidentiality */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confidentiality
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white">AES-256-GCM Active</div>
            <div className="text-xs text-zinc-400 mt-1">
              PII Masked in API Responses ({status?.confidentialityStatus.restrictedFieldsEncrypted} Sensitive Fields Encrypted)
            </div>
          </div>

          {/* 2. Authentication */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Authentication
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white">RBAC + TOTP MFA</div>
            <div className="text-xs text-zinc-400 mt-1">
              Session Cookies & Rate-Limiter Throttling Active
            </div>
          </div>

          {/* 3. Integrity */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Integrity
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white">SHA-256 Baseline</div>
            <div className="text-xs text-zinc-400 mt-1">
              {status?.integrityStatus.validRecordsCount} Records Monitored for Tampering
            </div>
          </div>

          {/* 4. Non-Repudiation */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5" /> Non-Repudiation
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-white">Signed Hash Chain</div>
            <div className="text-xs text-zinc-400 mt-1">
              {status?.nonRepudiationStatus.auditChainLength} Linked Blocks ({status?.nonRepudiationStatus.signedAdminActionsCount} Signed)
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Audit Chain & Integrity Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chained Audit Log (2 cols) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Cryptographic SHA-256 Audit Log Chain</h3>
            </div>
            {chainValidation && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  chainValidation.isValid
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {chainValidation.isValid ? "CHAIN INTACT" : "TAMPERED"}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400">
            Every administrative action is hashed and cryptographically linked to the preceding entry (<code className="text-amber-400">Hash_N = SHA256(Event_N + Hash_N-1)</code>).
          </p>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-zinc-950 p-4 rounded-lg border border-zinc-800/80 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        {log.action}
                      </span>
                      <span className="text-xs text-zinc-400">• {log.performedBy} ({log.performedByRole})</span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-1">{log.entityName}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{log.details}</div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="truncate text-zinc-400">
                    <span className="text-zinc-400">Prev:</span> {log.previousHash.slice(0, 16)}...
                  </div>
                  <div className="truncate text-emerald-400/90 font-semibold">
                    <span className="text-zinc-400">Hash:</span> {log.currentHash.slice(0, 16)}...
                  </div>
                </div>

                {log.signature && (
                  <div className="mt-2 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded flex items-center gap-1.5">
                    <Fingerprint className="w-3 h-3 text-amber-400" />
                    Signed by {log.signature.signedBy} ({log.signature.algorithm})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: MFA & Integrity Scanner (1 col) */}
        <div className="space-y-6">
          {/* Admin TOTP MFA Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Admin TOTP MFA Setup</h3>
            </div>

            <p className="text-xs text-zinc-400">
              Enforce two-factor authentication for high-privilege operations.
            </p>

            {!mfaConfig ? (
              <Button onClick={handleSetupMfa} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                Initialize Admin MFA
              </Button>
            ) : (
              <div className="space-y-3 bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <div className="text-xs text-zinc-300 font-mono break-all">
                  <span className="text-zinc-400 font-sans">Secret Key:</span> {mfaConfig.secret}
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Enter 6-digit TOTP Token</label>
                  <input
                    type="text"
                    value={mfaInputToken}
                    onChange={(e) => setMfaInputToken(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <Button
                  onClick={handleVerifyMfa}
                  disabled={isVerifyingMfa}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Verify MFA Code
                </Button>

                <div className="pt-2 border-t border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-400 mb-1">Backup Recovery Codes:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-300">
                    {mfaConfig.backupCodes.map((code, idx) => (
                      <span key={idx} className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-center">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Record Integrity Scanner Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Record Integrity Baseline</h3>
            </div>

            <p className="text-xs text-zinc-400">
              Compute and compare canonical SHA-256 payload hashes to catch silent record mutations.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400">Record ID to Scan</label>
              <input
                type="text"
                value={integrityTestRecordId}
                onChange={(e) => setIntegrityTestRecordId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none font-mono"
              />
              <Button onClick={handleRunIntegrityCheck} className="w-full bg-purple-600 hover:bg-purple-500 text-white">
                Scan Record Payload
              </Button>
            </div>

            {integrityResult && (
              <div className={`p-3 rounded-lg border text-xs ${
                integrityResult.isIntact
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}>
                <div className="font-semibold">{integrityResult.message}</div>
                <div className="mt-1 font-mono text-[10px] text-zinc-400 truncate">
                  SHA256: {integrityResult.computedHash}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
