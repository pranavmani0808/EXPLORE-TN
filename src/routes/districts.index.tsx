import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, MapPin, Search, Sparkles, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { getAllDistrictsList } from "@/lib/data/districts";

export const Route = createFileRoute("/districts/")({
  head: () => ({
    meta: [
      { title: "Districts of Tamil Nadu (38 Regions) — ExplorerTN" },
      {
        name: "description",
        content: "Explore places across all 38 districts of Tamil Nadu. From Madurai to Kodaikanal, Nilgiris to Kanyakumari.",
      },
    ],
  }),
  component: DistrictsIndexPage,
});

function DistrictsIndexPage() {
  const [search, setSearch] = useState("");
  const allDistricts = getAllDistrictsList();

  const filtered = allDistricts.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.region.toLowerCase().includes(search.toLowerCase()) ||
      d.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 pt-28 space-y-8 font-sans text-foreground">
        {/* Header */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
            <Compass className="size-3.5" /> 38 DISTRICT REGIONS
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-foreground tracking-tight">
            Explore Tamil Nadu by District
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Discover curated tourist spots, local food legends, road conditions, and boundary maps district-by-district.
          </p>

          <div className="pt-2 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search districts (e.g. Madurai, Nilgiris, Thanjavur)..."
                className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Districts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <Link
              key={d.slug}
              to="/districts/$districtSlug"
              params={{ districtSlug: d.slug }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-zinc-950">
                  <img
                    src={d.heroImage}
                    alt={d.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-3 py-1 text-[10px] font-extrabold text-amber-400">
                    {d.region}
                  </span>
                  <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400 font-black px-2.5 py-1 text-[10px] text-zinc-950 shadow-md">
                    <Sparkles className="size-3" />
                    {d.spotsCount} Spots
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-amber-400 transition-colors">
                    {d.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.tagline}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>View District Guide</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
