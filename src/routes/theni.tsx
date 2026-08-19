import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { ExplorePlanMap, ExplorePlan } from "@/components/site/explore-plan-map";

export const Route = createFileRoute("/theni")({
  head: () => ({
    meta: [
      { title: "Explore Theni — Nature, Waterfalls & Mountain Trails | ExplorerTN" },
      {
        name: "description",
        content:
          "Discover Suruli Falls, Chinna Suruli, Ellapatti River, Kumbakkarai, Meghamalai, Kurangani, Top Station, Vaigai Dam, and Cumbum Valley Vineyards.",
      },
      { property: "og:title", content: "Explore Theni — ExplorerTN" },
      {
        property: "og:description",
        content: "Interactive nature trip planning map for Theni district.",
      },
    ],
  }),
  component: TheniTripPlannerPage,
});

const THENI_EXPLORE_PLANS: ExplorePlan[] = [
  {
    id: "circuit-a",
    title: "Circuit A — Nature & Waterfalls",
    subtitle: "Cascading falls, wild mountain streams & river walks",
    description: "Theni → Suruli Falls → Chinna Suruli → Ellapatti River Walk",
    stops: [
      { placeId: "theni", order: 1, visitDurationMinutes: 0, activities: ["Trip Assembly", "Fuel & Snacks"] },
      { placeId: "suruli-waterfalls", order: 2, visitDurationMinutes: 120, activities: ["150ft Waterfall Viewing", "Rock Cave Shrines", "Forest Trail Walk"] },
      { placeId: "chinna-suruli-waterfalls", order: 3, visitDurationMinutes: 60, activities: ["Secluded Bathing", "Kombaitholu Forest Stream"] },
      { placeId: "ellapatti-river-walk", order: 4, visitDurationMinutes: 90, activities: ["Shallow Stream Bathing", "Shaded Bamboo Canopy Walk"] },
    ],
  },
  {
    id: "circuit-b",
    title: "Circuit B — Kodaikanal-side Nature",
    subtitle: "Foothill granite rock baths & historic elevated aqueducts",
    description: "Theni → Kumbakkarai Falls → Thottipalam Aqueduct",
    stops: [
      { placeId: "theni", order: 1, visitDurationMinutes: 0, activities: ["Trip Assembly"] },
      { placeId: "kumbakkarai-falls", order: 2, visitDurationMinutes: 120, activities: ["Granite Rock Water Basins", "Foothills Stream Bathing"] },
      { placeId: "thottipalam-aqueduct", order: 3, visitDurationMinutes: 60, activities: ["Aqueduct Canal Walk", "Paddy Field Vistas"] },
    ],
  },
  {
    id: "circuit-c",
    title: "Circuit C — Meghamalai Cloud Forests",
    subtitle: "Misty tea estates, 18 hairpin bends & high-altitude lakes",
    description: "Theni → Meghamalai Tea Estates & High Wavy Peak",
    stops: [
      { placeId: "theni", order: 1, visitDurationMinutes: 0, activities: ["Trip Assembly"] },
      { placeId: "meghamalai", order: 2, visitDurationMinutes: 240, activities: ["18 Hairpin Bend Mountain Drive", "High Waves Tea Plantation Safari"] },
    ],
  },
  {
    id: "circuit-d",
    title: "Circuit D — Mountain Trekking Adventure",
    subtitle: "Pine forest climbing, cliff ridges & 1,700m summit vistas",
    description: "Theni → Kurangani Foothills → Top Station Ridge",
    stops: [
      { placeId: "theni", order: 1, visitDurationMinutes: 0, activities: ["Trip Assembly", "Gear Check"] },
      { placeId: "kurangani-hill-village", order: 2, visitDurationMinutes: 90, activities: ["Trekking Basecamp Prep", "Shola Forest Gateway"] },
      { placeId: "top-station-viewpoint", order: 3, visitDurationMinutes: 180, activities: ["1,700m Summit Panorama", "Sea of Clouds Viewpoint"] },
    ],
  },
  {
    id: "circuit-e",
    title: "Circuit E — Relaxed Family & Countryside",
    subtitle: "111ft reservoir dam, flower gardens & grape tasting",
    description: "Theni → Vaigai Dam → Cumbum Valley Vineyards",
    stops: [
      { placeId: "theni", order: 1, visitDurationMinutes: 0, activities: ["Trip Assembly"] },
      { placeId: "vaigai-dam", order: 2, visitDurationMinutes: 120, activities: ["111ft Dam Wall View", "Lush Flower Gardens"] },
      { placeId: "cumbum-valley-vineyards", order: 3, visitDurationMinutes: 90, activities: ["Muscat Grape Farm Tasting", "Vineyard Walk"] },
    ],
  },
];

export function TheniTripPlannerPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="THENI · TAMIL NADU"
        title="Theni Interactive Nature Trip Planner"
        description="Plan real multi-stop road itineraries with exact driving distances, visit durations, activities, and live WGS84 GPS navigation."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <ExplorePlanMap
          plans={THENI_EXPLORE_PLANS}
          title="Theni Curated Nature Circuits"
          subtitle="Select a circuit to view real road routes, visit durations, and live itinerary schedule."
        />
      </div>
    </AppShell>
  );
}
