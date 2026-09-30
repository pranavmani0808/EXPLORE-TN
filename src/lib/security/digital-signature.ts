import crypto from "node:crypto";
import { CryptographicSignature } from "./types";

const ADMIN_SIGNING_SECRET =
  process.env.EXPLORETN_ADMIN_SIGNING_KEY ||
  "cain-super-admin-digital-signature-master-secret-key-99887766554433221100";

/**
 * Sign an administrative action payload with HMAC-SHA256 to ensure non-repudiation
 */
export function signAdminAction(
  payloadHash: string,
  signerName: string,
  signerRole: string
): CryptographicSignature {
  const timestamp = new Date().toISOString();
  const rawToSign = `${payloadHash}|${signerName}|${signerRole}|${timestamp}`;

  const signature = crypto
    .createHmac("sha256", ADMIN_SIGNING_SECRET)
    .update(rawToSign, "utf8")
    .digest("hex");

  return {
    signature,
    signedBy: signerName,
    signerRole,
    timestamp,
    algorithm: "HMAC-SHA256",
    payloadHash,
  };
}

/**
 * Verify a cryptographic digital signature for non-repudiation compliance
 */
export function verifyAdminSignature(signatureObj: CryptographicSignature): {
  isValid: boolean;
  message: string;
} {
  try {
    const rawToSign = `${signatureObj.payloadHash}|${signatureObj.signedBy}|${signatureObj.signerRole}|${signatureObj.timestamp}`;
    const recomputed = crypto
      .createHmac("sha256", ADMIN_SIGNING_SECRET)
      .update(rawToSign, "utf8")
      .digest("hex");

    const isValid = recomputed === signatureObj.signature;

    return {
      isValid,
      message: isValid
        ? "Digital signature verified. Proof of non-repudiation confirmed."
        : "INVALID SIGNATURE! Potential repudiation or payload tampering detected.",
    };
  } catch (error: any) {
    return {
      isValid: false,
      message: `Signature verification error: ${error?.message || "Unknown error"}`,
    };
  }
}
