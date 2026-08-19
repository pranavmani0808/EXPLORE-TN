import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { ExplorePlanMap, ExplorePlan } from "@/components/site/explore-plan-map";

export const Route = createFileRoute("/coastal-heritage")({
  head: () => ({
    meta: [
      { title: "Ultimate Tamil Nadu Coastal & Heritage Road Trip — ExplorerTN" },
      {
        name: "description",
        content:
          "From Chennai to Kanniyakumari via ECR, Mahabalipuram, Puducherry, Pichavaram, Tharangambadi, Thanjavur, Karaikudi, Pamban Bridge, Rameswaram, Dhanushkodi & Kanniyakumari.",
      },
      { property: "og:title", content: "Ultimate Tamil Nadu Coastal & Heritage Road Trip — ExplorerTN" },
      {
        property: "og:description",
        content: "14 canonical stops, 1,000+ km of Bay of Bengal coastal highway and Chola & Chettinad heritage.",
      },
    ],
  }),
  component: CoastalHeritagePage,
});

const COASTAL_HERITAGE_PLANS: ExplorePlan[] = [
  {
    id: "coastal-coromandel-plan",
    title: "Plan 1 — North Coromandel Heritage Coast",
    subtitle: "Chennai → Mahabalipuram → Puducherry → Pichavaram → Tharangambadi",
    description: "UNESCO Shore Temple, French White Town, Mangrove Tunnels & 1620 Danish Fort Dansborg.",
    stops: [
      { placeId: "chennai", order: 1, visitDurationMinutes: 60, activities: ["Marina Beach", "Departure Hub"] },
      { placeId: "mahabalipuram", order: 2, visitDurationMinutes: 120, activities: ["Shore Temple UNESCO", "Pancha Rathas"] },
      { placeId: "puducherry", order: 3, visitDurationMinutes: 180, activities: ["White Town French Quarter", "Promenade Beach"] },
      { placeId: "pichavaram", order: 4, visitDurationMinutes: 90, activities: ["Mangrove Root Tunnel Boating"] },
      { placeId: "tharangambadi", order: 5, visitDurationMinutes: 120, activities: ["1620 Fort Dansborg Sea Citadel"] },
    ],
  },
  {
    id: "coastal-chola-chettinad-plan",
    title: "Plan 2 — Chola & Chettinad Heritage Route",
    subtitle: "Thanjavur → Karaikudi → Rameswaram → Dhanushkodi → Kanniyakumari",
    description: "Brihadeeswarar Big Temple, Chettinad Mansions, Pamban Sea Bridge, Ghost Town & Southernmost Tip.",
    stops: [
      { placeId: "thanjavur", order: 1, visitDurationMinutes: 180, activities: ["Chola Brihadeeswarar Big Temple"] },
      { placeId: "karaikudi", order: 2, visitDurationMinutes: 150, activities: ["1000-Window Palatial Mansions", "Chettinad Feast"] },
      { placeId: "rameswaram", order: 3, visitDurationMinutes: 180, activities: ["1,212-Pillar Ramanathaswamy Corridor", "Pamban Sea Bridge"] },
      { placeId: "dhanushkodi", order: 4, visitDurationMinutes: 120, activities: ["Arichal Munai Two-Ocean Confluence", "Cyclone Ruins"] },
      { placeId: "kanniyakumari", order: 5, visitDurationMinutes: 180, activities: ["Vivekananda Rock Memorial", "Thiruvalluvar Statue"] },
    ],
  },
];

export function CoastalHeritagePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="COASTAL & HERITAGE HIGHWAY"
        title="Chennai to Kanniyakumari Road Trip Engine"
        description="Explore 1,000+ km of Bay of Bengal oceanfront roads, French quarters, Chola temples, Chettinad mansions, and Rameswaram sea bridges."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <ExplorePlanMap
          plans={COASTAL_HERITAGE_PLANS}
          title="Coastal Tamil Nadu Curated Journeys"
          subtitle="Select a coastal plan to view real road network routes, segment distances, and live navigation."
        />
      </div>
    </AppShell>
  );
}
