// src/routes/pages/delete-account.page.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"

export default function DeleteAccountPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Do you really want to delete your account? This action is irreversible."
    )
    if (!confirmed) return
    setLoading(true)
    setError(null)
    try {
      const { error: delErr } = await supabase.auth.signOut()
      if (delErr) throw delErr
      // OPTIONAL: call a server endpoint to delete the Supabase row if needed.
      const res = await fetch("/api/v1/user/delete", {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Unknown server error")
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || "Failed to delete account")
    }
    setLoading(false)
  }

  if (success) {
    return <p>Account deleted. Goodbye!</p>
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
      <p className="mb-6 text-sm text-gray-700">
        If you’re sure you want to permanently delete your ExplorerTN
        account and all associated data, click the button below.
      </p>
      {error && (
        <div className="mb-4 text-red-600">{error}</div>
      )}
      <Button color="danger" onClick={handleDelete} loading={loading}>
        Delete My Account
      </Button>
    </div>
  )
}
