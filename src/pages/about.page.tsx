// src/pages/about.page.tsx
export default function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About ExplorerTN</h1>
      <p className="mb-4">
        ExplorerTN is a community‑driven platform for discovering the cultural, natural and historic trails
        of Tamil Nadu. Our goal is to make every village, temple, waterfall and hill station
        accessible to wanderers around the world.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Our Mission</h2>
      <p className="mb-4">
        • Promote sustainable tourism by highlighting lesser‑known routes.
        <br />• Preserve cultural heritage through maps, stories and itineraries.
        <br />• Empower local guides and travelers with data‑driven planning tools.
      </p>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Contact Us</h2>
      <p>
        If you have any questions, feedback or would like to contribute, please email us at
        <a href="mailto:contact@explorertn.org" className="ml-1 underline text-indigo-600">
          contact@explorertn.org
        </a>.
      </p>
    </div>
  )
}
