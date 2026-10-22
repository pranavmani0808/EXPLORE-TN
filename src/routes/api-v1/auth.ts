// src/routes/api-v1/auth.ts
import { secretKeyHandler } from "@/lib/security/secret-key-route"
import { signInWithEmailPassword, signUpWithEmailPassword, resetPassword, verifyOtp } from "@/lib/security/auth.js"

export async function POST(request: Request) {
  const body = await request.json()
  const { action } = body

  if (action === "secret-key") return await secretKeyHandler(request)

  if (action === "login") {
    const { email, password } = body
    const { session } = await signInWithEmailPassword(email, password)
    return new Response(JSON.stringify({ user: session?.user }), { status: 200 })
  }

  if (action === "signup") {
    const { email, password, name } = body
    const { data } = await signUpWithEmailPassword(email, password, name)
    return new Response(JSON.stringify({ data }), { status: 201 })
  }

  if (action === "reset-password") {
    const { email } = body
    await resetPassword(email)
    return new Response(JSON.stringify({ status: "sent" }), { status: 200 })
  }

  if (action === "verify-email") {
    const { email, otp } = body
    await verifyOtp(email, otp)
    return new Response(JSON.stringify({ status: "verified" }), { status: 200 })
  }

  return new Response(JSON.stringify({ error: "unknown action" }), { status: 400 })
}
