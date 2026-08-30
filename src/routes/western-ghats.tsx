import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { ExplorePlanMap, ExplorePlan } from "@/components/site/explore-plan-map";

export const Route = createFileRoute("/western-ghats")({
  head: () => ({
    meta: [
      { title: "Western Ghats — Mist, Mountains & Rainforest Route | ExplorerTN" },
      {
        name: "description",
        content:
          "Experience the Western Ghats road trip: Kinnakorai -> Mullayanagiri -> Agumbe. Discover remote mountains, Karnataka's highest peak, coffee estates, and rainforest trails.",
      },
      { property: "og:title", content: "Western Ghats — Mist, Mountains & Rainforest Route" },
      {
        property: "og:description",
        content:
          "Structured multi-stop road-trip experience with isolated route engine, interactive maps, segment breakdowns, and AI Trip Planner integration.",
      },
    ],
  }),
  component: WesternGhatsRoutePage,
});

const WESTERN_GHATS_PLANS: ExplorePlan[] = [
  {
    id: "western-ghats-route",
    title: "Western Ghats — Mist, Mountains & Rainforest Trail",
    subtitle: "Kinnakorai → Mullayanagiri → Agumbe",
    description: "From remote Nilgiri passes to Karnataka's highest peak (1,930m) and Agumbe rainforest canopy.",
    stops: [
      {
        placeId: "kinnakorai",
        order: 1,
        visitDurationMinutes: 120,
        activities: ["Remote Mountain Ridges", "Forest Canopy Pass Drive"],
      },
      {
        placeId: "mullayanagiri",
        order: 2,
        visitDurationMinutes: 180,
        activities: ["1,930m Highest Peak Summit View", "Shola Grassland Trek", "Coffee Estate Drive"],
      },
      {
        placeId: "agumbe",
        order: 3,
        visitDurationMinutes: 150,
        activities: ["Cherrapunji of the South Rainforest Canopy", "Agumbe Sunset Point", "Barkana Waterfall Trail"],
      },
    ],
  },
];

function WesternGhatsRoutePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="WESTERN GHATS ROAD TRIP"
        title="Mist, Mountains & Rainforest Route"
        description="Experience the canonical Western Ghats road trip from remote mountain passes to highest summits and rainforest trails."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 font-sans">
        <ExplorePlanMap
          plans={WESTERN_GHATS_PLANS}
          title="Western Ghats Canonical Route"
          subtitle="Explore Kinnakorai, Mullayanagiri, and Agumbe with real road network geometry, distance calculation, and GPS navigation."
        />
      </div>
    </AppShell>
  );
}
