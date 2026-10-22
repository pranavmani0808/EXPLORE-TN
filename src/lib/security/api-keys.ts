// src/lib/security/api-keys.ts
import jwt from "jsonwebtoken"

const SUPER_ADMIN_ROLE = "super_admin"

/**
 * Secret key used to sign the JWT that is returned by `/api/v1/secret-key`.
 * It should live in Vercel/Render secret variables.
 */
const JWT_SECRET = process.env.SECRET_KEY_FOR_JWT!
const JWT_TTL = "4h"

export async function signSupabaseKey(userId: string) {
  // The payload should only contain the Supabase service role key.
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const payload = { supabaseKey: supabaseServiceKey }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL, subject: userId })
}

export function verifySupabaseKey(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { supabaseKey: string }
    return decoded.supabaseKey
  } catch {
    return null
  }
}

export function isSuperAdmin(userRole: string): boolean {
  return userRole === SUPER_ADMIN_ROLE
}
