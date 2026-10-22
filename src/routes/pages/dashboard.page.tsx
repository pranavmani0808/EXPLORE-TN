// src/routes/pages/dashboard.page.tsx
import { useEffect } from "react"
import { useAuthContext } from "@/lib/auth-guard-context"
import { supabase } from "@/lib/supabase-client"

export default function DashboardPage() {
  const { authSession, setAuthSession } = useAuthContext()
  const [profile, setProfile] = useState<null | any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authSession) return
    async function load() {
      const { data: upd, error } = await supabase.from("user_profiles").select().eq("user_id", authSession.id).single()
      if (error) {
        console.error(error)
        return
      }
      setProfile(upd)
      setLoading(false)
    }
    load()
  }, [authSession])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (!profile) return <EmptyState title="No profile" description="Set up your explorer profile to unlock all features." />

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome back, {authSession?.name}</h1>
      <p>Your active trails and saved itineraries will appear here.</p>
    </div>
  )
}
