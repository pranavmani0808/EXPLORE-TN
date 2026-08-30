import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { ExplorePlanMap, ExplorePlan } from "@/components/site/explore-plan-map";

export const Route = createFileRoute("/hill-escapes")({
  head: () => ({
    meta: [
      { title: "Hill Escapes From Chennai — Weekend Mountain Trips | ExplorerTN" },
      {
        name: "description",
        content:
          "Curated hill station road trip plans from Chennai: Yelagiri, Horsley Hills, Yercaud, Sirumalai, Kodaikanal, Kotagiri & Coonoor.",
      },
      { property: "og:title", content: "Hill Escapes From Chennai — ExplorerTN" },
      {
        property: "og:description",
        content: "Interactive road trip planning map for mountain getaways from Chennai.",
      },
    ],
  }),
  component: HillEscapesPage,
});

const HILL_ESCAPES_PLANS: ExplorePlan[] = [
  {
    id: "chennai-yelagiri",
    title: "Escape 1 — Chennai to Yelagiri Hills",
    subtitle: "230 km · ~4.5 Hours Driving via NH44",
    description: "Closest hill station to Chennai (1,110m MSL) with Punganoor lake boating & Swamimalai peak trek.",
    stops: [
      { placeId: "chennai", order: 1, visitDurationMinutes: 0, activities: ["Chennai Departure"] },
      { placeId: "yelagiri", order: 2, visitDurationMinutes: 180, activities: ["Punganoor Lake Boating", "Swamimalai Peak Trek"] },
    ],
  },
  {
    id: "chennai-horsley",
    title: "Escape 2 — Chennai to Horsley Hills (Andhra)",
    subtitle: "275 km · ~5.5 Hours Driving via Tirupati Pass",
    description: "Ooty of Andhra (1,290m MSL) featuring eucalyptus forests & giant Kalyani banyan tree.",
    stops: [
      { placeId: "chennai", order: 1, visitDurationMinutes: 0, activities: ["Chennai Departure"] },
      { placeId: "horsley-hills", order: 2, visitDurationMinutes: 180, activities: ["1,290m Eucalyptus Ridge Walk", "Kalyani Banyan Tree"] },
    ],
  },
  {
    id: "chennai-yercaud",
    title: "Escape 3 — Chennai to Yercaud (Shevaroy Hills)",
    subtitle: "365 km · ~6.5 Hours Driving via Salem",
    description: "Jewel of the South (1,515m MSL) with 20 hairpin bends, Emerald lake, and coffee estate drives.",
    stops: [
      { placeId: "chennai", order: 1, visitDurationMinutes: 0, activities: ["Chennai Departure"] },
      { placeId: "yercaud", order: 2, visitDurationMinutes: 240, activities: ["20 Hairpin Bend Drive", "Emerald Lake Boating", "Pagoda Point"] },
    ],
  },
  {
    id: "chennai-kodaikanal",
    title: "Escape 4 — Chennai to Kodaikanal Plateau",
    subtitle: "525 km · ~9.5 Hours Driving via Dindigul",
    description: "Princess of Hill Stations (2,133m MSL) featuring star-shaped lake, Pillar Rocks, and cloud forests.",
    stops: [
      { placeId: "chennai", order: 1, visitDurationMinutes: 0, activities: ["Chennai Departure"] },
      { placeId: "kodaikanal", order: 2, visitDurationMinutes: 300, activities: ["Star-Shaped Kodai Lake", "Pillar Rocks Vistas", "Coaker's Walk"] },
    ],
  },
];

function HillEscapesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="WEEKEND MOUNTAIN GETAWAYS"
        title="Hill Escapes from Chennai"
        description="Escape the city heat with real road-route maps, driving times, and itineraries to Yelagiri, Horsley Hills, Yercaud, and Kodaikanal."
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 font-sans">
        <ExplorePlanMap
          plans={HILL_ESCAPES_PLANS}
          title="Chennai Mountain Road Trips"
          subtitle="Select a destination to view real road routes from Chennai with ETA, visit duration, and navigation."
        />
      </div>
    </AppShell>
  );
}
