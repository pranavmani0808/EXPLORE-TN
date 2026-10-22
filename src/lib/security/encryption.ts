import { generateRandomHex, computeSha256 } from "./browser-crypto";

/**
 * SERVER-ONLY. Do not import from client components.
 *
 * The key must be provided via the EXPLORETN_SECURITY_SECRET environment
 * variable — there is deliberately no fallback, because a hardcoded key in
 * source (or in the client bundle) is equivalent to publishing it.
 *
 * NOTE: this is a lightweight XOR stream construction, not authenticated
 * encryption. For data whose confidentiality actually matters, prefer
 * WebCrypto AES-GCM or server-side Postgres encryption.
 */
function getSecretKeyHex(): string {
  const key =
    typeof process !== "undefined" ? process.env?.["EXPLORETN_SECURITY_SECRET"] : undefined;
  if (!key) {
    throw new Error(
      "EXPLORETN_SECURITY_SECRET is not configured. Encryption is disabled outside the server environment."
    );
  }
  return key;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: string;
}

/**
 * Encrypt sensitive string data (XOR stream keyed by SHA-256(secret + iv))
 */
export function encryptData(plainText: string, keyVersion: string = "v1"): EncryptedPayload {
  try {
    const SECRET_KEY_HEX = getSecretKeyHex();
    const iv = generateRandomHex(12);
    // Deterministic keystream generation using SHA-256(secret + iv)
    const keystream = computeSha256(SECRET_KEY_HEX + iv);
    let ciphertext = "";
    for (let i = 0; i < plainText.length; i++) {
      const charCode = plainText.charCodeAt(i);
      const keyCode = keystream.charCodeAt(i % keystream.length);
      const enc = charCode ^ keyCode;
      ciphertext += enc.toString(16).padStart(4, "0");
    }

    const authTag = computeSha256(ciphertext + iv + SECRET_KEY_HEX).slice(0, 32);

    return {
      ciphertext,
      iv,
      authTag,
      keyVersion,
    };
  } catch (error) {
    console.error("[CAIN Encryption Error]", error);
    throw new Error("Data encryption failed");
  }
}

/**
 * Decrypt data
 */
export function decryptData(encryptedData: string, ivHex: string, authTagHex: string): string {
  try {
    const SECRET_KEY_HEX = getSecretKeyHex();
    const expectedTag = computeSha256(encryptedData + ivHex + SECRET_KEY_HEX).slice(0, 32);
    if (expectedTag !== authTagHex) {
      throw new Error("Authentication tag mismatch");
    }

    const keystream = computeSha256(SECRET_KEY_HEX + ivHex);
    let plainText = "";
    for (let i = 0; i < encryptedData.length; i += 4) {
      const chunk = parseInt(encryptedData.substr(i, 4), 16);
      const keyIndex = Math.floor(i / 4) % keystream.length;
      const keyCode = keystream.charCodeAt(keyIndex);
      plainText += String.fromCharCode(chunk ^ keyCode);
    }

    return plainText;
  } catch (error) {
    console.error("[CAIN Decryption Error]", error);
    throw new Error("Data decryption failed or authentication tag mismatch");
  }
}
