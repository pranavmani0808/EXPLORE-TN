import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { ExplorePlanMap, ExplorePlan } from "@/components/site/explore-plan-map";

export const Route = createFileRoute("/madurai")({
  head: () => ({
    meta: [
      { title: "Explore Madurai — Temples, Tourist Places & Taste Madurai | ExplorerTN" },
      {
        name: "description",
        content:
          "Discover Meenakshi Amman Temple, Thirupparankundram, Alagar Kovil, Pazhamudircholai, Thirumalai Nayakkar Mahal, Gandhi Museum, Samanar Hills, Vandiyur Teppakulam, Vaigai River, Jigarthanda and Madurai food.",
      },
      { property: "og:title", content: "Explore Madurai — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Dedicated Madurai city guide covering ancient temples, historic landmarks, iconic local street food, interactive map, and AI Trip Planner integration.",
      },
    ],
  }),
  component: ExploreMaduraiPage,
});

const MADURAI_PLANS: ExplorePlan[] = [
  {
    id: "madurai-temple-circuit",
    title: "Plan 1 — Sacred Madurai Temple Trail",
    subtitle: "Meenakshi Amman → Thirupparankundram → Alagar Kovil → Pazhamudircholai",
    description: "Experience 2,000-year Dravidian temple architecture, 14 gopurams, 2 Arupadai Veedu shrines, and hill forest sanctuaries.",
    stops: [
      { placeId: "meenakshi-amman-temple", order: 1, visitDurationMinutes: 180, activities: ["14 Gopurams", "1000-Pillar Hall", "Golden Lotus Tank"] },
      { placeId: "thirupparankundram-temple", order: 2, visitDurationMinutes: 90, activities: ["6th-Century Rock-Cut Shrine", "Granite Hill View"] },
      { placeId: "alagar-kovil", order: 3, visitDurationMinutes: 120, activities: ["Kallazhagar Vishnu Temple", "Alagar Hills Canopy"] },
      { placeId: "pazhamudircholai-temple", order: 4, visitDurationMinutes: 90, activities: ["5th Arupadai Veedu", "Solaimalai Forest Springs"] },
    ],
  },
  {
    id: "madurai-heritage-landmarks",
    title: "Plan 2 — Historic Landmarks & Royal Palaces",
    subtitle: "Thirumalai Nayakkar Mahal → Gandhi Museum → Samanar Hills → Vandiyur Teppakulam",
    description: "1636 Nayak royal palace, freedom struggle museum, 9th-century Jain rock-cut beds, and 16-acre temple tank.",
    stops: [
      { placeId: "thirumalai-mahal", order: 1, visitDurationMinutes: 90, activities: ["82ft Giant White Pillars", "Swarga Vilasam Courtyard"] },
      { placeId: "gandhi-museum-madurai", order: 2, visitDurationMinutes: 90, activities: ["Freedom Struggle Gallery", "Tamukkam Summer Palace"] },
      { placeId: "samanar-hills", order: 3, visitDurationMinutes: 120, activities: ["9th-Century Jain Bas-Reliefs", "Sunset Over Madurai Plains"] },
      { placeId: "vandiyur-teppakulam", order: 4, visitDurationMinutes: 60, activities: ["16-Acre Water Tank", "Maiya Mandapam Pavilion"] },
    ],
  },
];

function ExploreMaduraiPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="MADURAI · TAMIL NADU"
        title="Explore Madurai City Discovery"
        description="Ancient temples, historic royal palaces, Jain rock-cut hills, and iconic street food of Madurai."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 font-sans">
        <ExplorePlanMap
          plans={MADURAI_PLANS}
          title="Madurai City & Heritage Curated Plans"
          subtitle="Select a Madurai plan to view real road network routes, segment distances, and live navigation."
        />
      </div>
    </AppShell>
  );
}
