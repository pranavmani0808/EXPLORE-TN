import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/app-shell";
import { DistrictView } from "@/components/site/district-view";
import { TAMIL_NADU_DISTRICTS } from "@/lib/data/districts";
import { ExplorePlanMap, ExplorePlan } from "@/components/site/explore-plan-map";

export const Route = createFileRoute("/madurai")({
  head: () => ({
    meta: [
      { title: "Explore Madurai District — Temples, Heritage, Food & Thrift Bazaars | ExplorerTN" },
      {
        name: "description",
        content:
          "Dedicated Madurai district guide featuring standalone Madurai district map, Meenakshi Temple, Puthu Mandapam thrift market, Famous Jigarthanda, Konar Mess Kari Dosa, and Nayak Palace.",
      },
      { property: "og:title", content: "Explore Madurai District — ExplorerTN" },
      {
        property: "og:description",
        content:
          "Explore Madurai city & district: standalone map, temples, heritage sites, street food legends, and famous thrift markets.",
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
    id: "madurai-thrift-food-trail",
    title: "Plan 2 — Madurai Heritage, Thrift Markets & Food Trail",
    subtitle: "Puthu Mandapam → Avani Moola St → Famous Jigarthanda → Konar Mess",
    description: "400-year-old Nayak tailoring market arcade, tie-and-dye silk street, badam-gum Jigarthanda drink, and 3-tier Mutton Kari Dosa.",
    stops: [
      { placeId: "puthu-mandapam", order: 1, visitDurationMinutes: 90, activities: ["16th-Century Carved Tailor Pillars", "1-Hour Custom Kurtas"] },
      { placeId: "avani-moola-street", order: 2, visitDurationMinutes: 90, activities: ["Madurai Sungudi Silk Sarees", "Traditional Crafts"] },
      { placeId: "famous-jigarthanda", order: 3, visitDurationMinutes: 45, activities: ["Original Special Jigarthanda", "Almond Resin Cream"] },
      { placeId: "konar-mess", order: 4, visitDurationMinutes: 60, activities: ["3-Tier Mutton Kari Dosa", "Spicy Bone Marrow Fry"] },
    ],
  },
];

const MADURAI_ORIGIN_OPTIONS = [
  { placeId: "madurai-hub", name: "Madurai Hub (Meenakshi Temple)", latitude: 9.9195, longitude: 78.1193 },
  { placeId: "thirupparankundram-hub", name: "Thirupparankundram Junction", latitude: 9.8789, longitude: 78.0722 },
  { placeId: "alagar-kovil-hub", name: "Alagar Kovil Gate", latitude: 10.0736, longitude: 78.2144 },
  { placeId: "madurai-junction", name: "Madurai Railway Junction", latitude: 9.9175, longitude: 78.1118 },
  { placeId: "theni", name: "Theni Central Hub", latitude: 10.0104, longitude: 77.4768 },
];

function ExploreMaduraiPage() {
  const maduraiData = TAMIL_NADU_DISTRICTS["madurai"];

  return (
    <AppShell>
      <DistrictView district={maduraiData} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 font-sans border-t border-zinc-800">
        <ExplorePlanMap
          plans={MADURAI_PLANS}
          originOptions={MADURAI_ORIGIN_OPTIONS}
          title="Madurai City Curated Navigation Plans"
          subtitle="Select a Madurai plan to view turn-by-turn road network routes, segment distances, and live navigation."
        />
      </div>
    </AppShell>
  );
}
