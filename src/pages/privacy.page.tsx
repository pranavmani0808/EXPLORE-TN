// src/pages/privacy.page.tsx
export default function PrivacyPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        At ExplorerTN we respect your privacy. This policy explains what data we collect,
        how we use it and what choices you have.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Data We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Email address and name for account purposes</li>
        <li>Location data you share when planning itineraries</li>
        <li>Usage data via analytics services (e.g., Plausible)</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-6 mb-2">How We Use Data</h2>
      <p className="mb-4">
        We use collected information to provide and improve our services, to personalize
        your experience, and to comply with legal obligations. Data is stored securely
        in Supabase PostgreSQL and is protected by row‑level security.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Your Choices</h2>
      <ul className="list-disc list-inside mb-4">
        <li>You can delete your account and all related data.</li>
        <li>Opt‑out of analytics by disabling the script in the layout.</li>
        <li>Contact us to request data deletion or correction.</li>
      </ul>
      <p className="font-medium">Last update: Oct 2026.</p>
    </div>
  )
}
