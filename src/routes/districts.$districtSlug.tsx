import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/app-shell";
import { DistrictView } from "@/components/site/district-view";
import { getDistrictBySlug, getAllDistrictsList } from "@/lib/data/districts";
import { Button } from "@/components/ui/button";
import { MapPin, Compass } from "lucide-react";

export const Route = createFileRoute("/districts/$districtSlug")({
  head: ({ params }) => {
    const district = getDistrictBySlug(params.districtSlug);
    if (!district) {
      return { meta: [{ title: "District Explorer — ExplorerTN" }] };
    }
    return {
      meta: [
        { title: `${district.title} | ExplorerTN` },
        { name: "description", content: district.tagline },
        { property: "og:title", content: district.title },
        { property: "og:description", content: district.tagline },
      ],
    };
  },
  component: DynamicDistrictPage,
});

function DynamicDistrictPage() {
  const { districtSlug } = Route.useParams();
  const districtData = getDistrictBySlug(districtSlug);

  if (!districtData) {
    const availableDistricts = getAllDistrictsList();

    return (
      <AppShell>
        <div className="min-h-screen bg-background text-foreground py-20 px-4 max-w-5xl mx-auto space-y-8 font-sans">
          <div className="text-center space-y-4">
            <Compass className="mx-auto size-12 text-amber-500 animate-spin-slow" />
            <h1 className="text-3xl font-extrabold font-display">District '{districtSlug}' Under Curation</h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Our travel curators are mapping detailed spots for this district. In the meantime, explore Madurai district or pick from our curated Tamil Nadu districts below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-6">
            {availableDistricts.map((d) => (
              <Link
                key={d.slug}
                to="/districts/$districtSlug"
                params={{ districtSlug: d.slug }}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-amber-500/50 hover:bg-zinc-900 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                    {d.region}
                  </Badge>
                  <MapPin className="size-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                  {d.name}
                </h3>
                <p className="text-xs text-zinc-400">{d.spotsCount} Handpicked Spots & Map</p>
              </Link>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link to="/madurai">
              <Button className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold rounded-xl px-6">
                Explore Madurai District Guide →
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <DistrictView district={districtData} />
    </AppShell>
  );
}
