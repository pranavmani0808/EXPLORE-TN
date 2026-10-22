// src/lib/security/secret-key-route.ts
import { requireAdmin } from "./server-auth"
import { signSupabaseKey } from "./api-keys"
import { supabase } from "../../lib/supabase-client"

/**
 * Server‑side handler for `/api/v1/secret-key`.
 * Only a verified super_admin may call this.
 */
export async function secretKeyHandler(request: Request): Promise<Response> {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  const supabaseUserId = guard.session.userId
  const token = await signSupabaseKey(supabaseUserId)
  return new Response(
    JSON.stringify({ token, expiresIn: 4 * 60 * 60 }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}
