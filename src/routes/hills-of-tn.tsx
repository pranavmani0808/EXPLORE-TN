import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { ExplorePlanMap, ExplorePlan } from "@/components/site/explore-plan-map";

export const Route = createFileRoute("/hills-of-tn")({
  head: () => ({
    meta: [
      { title: "Hills of Tamil Nadu — Mountain Discovery Collection | ExplorerTN" },
      {
        name: "description",
        content:
          "Discover Kolli Hills, Yelagiri, Tharangambadi, Kalrayan Hills, Gingee Fort, and Panchamalai across Tamil Nadu.",
      },
      { property: "og:title", content: "Hills of Tamil Nadu — ExplorerTN" },
      {
        property: "og:description",
        content: "Misty mountains, winding hairpin bends, ancient hill forts, and offbeat landscapes across Tamil Nadu.",
      },
    ],
  }),
  component: HillsOfTNPage,
});

const HILLS_OF_TN_PLANS: ExplorePlan[] = [
  {
    id: "kolli-hills-plan",
    title: "Plan 1 — Kolli Hills Mountain Circuit",
    subtitle: "70 Hairpin Bends, Agaya Gangai Falls & Arapaleeswarar Temple",
    description: "Conquer Tamil Nadu's most famous mountain pass with 70 continuous hairpin bends.",
    stops: [
      { placeId: "kolli-hills", order: 1, visitDurationMinutes: 240, activities: ["70 Hairpin Bend Drive", "Agaya Gangai 300ft Falls"] },
    ],
  },
  {
    id: "yelagiri-plan",
    title: "Plan 2 — Yelagiri Hill Station",
    subtitle: "Punganoor Lake, Swamimalai Peak & Quiet Orchards",
    description: "Pleasant 1,110m hill retreat off NH44 with boating lake and peak trek.",
    stops: [
      { placeId: "yelagiri", order: 1, visitDurationMinutes: 180, activities: ["Punganoor Lake Boating", "Swamimalai Peak Trek"] },
    ],
  },
  {
    id: "kalrayan-gingee-plan",
    title: "Plan 3 — Kalrayan Hills & Gingee Citadel",
    subtitle: "Troy of the East granite fort & Periyar falls",
    description: "Impregnable 3-hill granite fort combined with Eastern Ghats waterfalls.",
    stops: [
      { placeId: "kalrayan-hills", order: 1, visitDurationMinutes: 120, activities: ["Periyar Cascading Waterfalls", "Gomukhi Reservoir"] },
      { placeId: "gingee-fort", order: 2, visitDurationMinutes: 180, activities: ["Rajagiri Citadel Climb", "Kalyan Mahal Pavilion"] },
    ],
  },
];

function HillsOfTNPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="DESTINATION DISCOVERY COLLECTION"
        title="Hills & Mountain Forts of Tamil Nadu"
        description="Misty mountains, 70 hairpin bends, ancient hill forts, and offbeat landscapes across Tamil Nadu."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <ExplorePlanMap
          plans={HILLS_OF_TN_PLANS}
          title="Hills of Tamil Nadu Road Trip Engine"
          subtitle="Select a hill plan to view real road routes, visit durations, and live itinerary schedule."
        />
      </div>
    </AppShell>
  );
}
