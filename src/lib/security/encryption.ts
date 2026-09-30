import crypto from "node:crypto";

// Fallback key if environment secret is not set (32-byte key for AES-256)
const SECRET_KEY_HEX =
  process.env.EXPLORETN_SECURITY_SECRET ||
  "4f8a9b2c3d1e0f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e";

function getKeyBuffer(): Buffer {
  return Buffer.from(SECRET_KEY_HEX.slice(0, 64), "hex");
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: string;
}

/**
 * Encrypt sensitive string data using AES-256-GCM
 */
export function encryptData(plainText: string, keyVersion: string = "v1"): EncryptedPayload {
  try {
    const iv = crypto.randomBytes(12);
    const key = getKeyBuffer();
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return {
      ciphertext: encrypted,
      iv: iv.toString("hex"),
      authTag,
      keyVersion,
    };
  } catch (error) {
    console.error("[CAIN Encryption Error]", error);
    throw new Error("Data encryption failed");
  }
}

/**
 * Decrypt AES-256-GCM encrypted data
 */
export function decryptData(encryptedData: string, ivHex: string, authTagHex: string): string {
  try {
    const key = getKeyBuffer();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[CAIN Decryption Error]", error);
    throw new Error("Data decryption failed or authentication tag mismatch");
  }
}

/**
 * Mask PII (Personally Identifiable Information) in API responses
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "*****";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return "+91 987***3210";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "+91 987***3210";
  const main = digits.slice(-10);
  return `+91 ${main.slice(0, 3)}***${main.slice(-4)}`;
}

export function maskSecretKey(key?: string): string {
  if (!key || key.length <= 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

/**
 * Recursively sanitize objects to mask PII according to data classification
 */
export function sanitizePiiResponse<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = { ...obj } as any;

  for (const key of Object.keys(sanitized)) {
    const val = sanitized[key];
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes("password") || lowerKey.includes("secret") || lowerKey.includes("token")) {
      sanitized[key] = maskSecretKey(typeof val === "string" ? val : "");
    } else if (lowerKey === "email") {
      sanitized[key] = maskEmail(typeof val === "string" ? val : "");
    } else if (lowerKey.includes("phone") || lowerKey.includes("mobile")) {
      sanitized[key] = maskPhoneNumber(typeof val === "string" ? val : "");
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizePiiResponse(val);
    }
  }

  return sanitized as T;
}
