/**
 * Client-safe PII masking utilities. These contain no secrets and are safe to
 * import from browser components. Server-side encryption lives in
 * ./encryption.ts, which is reserved for the server bundle.
 */

export function maskEmail(email?: string): string {
  if (!email) return "*****";
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "*****";
  const name = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (name.length <= 2) return `${name.charAt(0)}***@${domain}`;
  return `${name.charAt(0)}${"*".repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
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
