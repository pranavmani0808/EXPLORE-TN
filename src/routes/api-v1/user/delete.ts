// src/routes/api-v1/user/delete.ts
import { requireAdmin } from "@/lib/security/server-auth"
import { getSupabaseAdminClient } from "@/lib/supabase-client"

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  const userId = guard.session.userId
  const supabase = getSupabaseAdminClient()

  const { error } = await supabase
    .from("users")
    .update({ status: "deleted" })
    .eq("id", userId)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  await supabase.from("user_profiles").delete().eq("user_id", userId)
  await supabase.from("user_stats").delete().eq("user_id", userId)

  return new Response(JSON.stringify({ status: "deleted" }), { status: 200 })
}
