import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Compass,
  Filter,
  MapPin,
  Maximize2,
  Search,
  Server,
  Star,
  X,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/site/app-shell";
import { DedicatedMapModal, CATEGORIES_CONFIG } from "@/components/site/dedicated-map-modal";
import { ExploreCatalogMap } from "@/components/site/explore-catalog-map";
import { Button } from "@/components/ui/button";
import { filterExplorerPlaces, loadExploreCatalog, type CatalogSource } from "@/lib/places-catalog";
import { CANONICAL_PLACES, type ExplorerPlace } from "@/lib/data/canonical-places";

type ExploreSearch = {
  cat?: string;
  q?: string;
  district?: string;
  map?: boolean;
};

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    cat: typeof search.cat === "string" ? search.cat : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    district: typeof search.district === "string" ? search.district : undefined,
    map: search.map === true || search.map === "1" || search.map === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore Tamil Nadu — ExplorerTN" },
      {
        name: "description",
        content:
          "Browse verified waterfalls, temples, hill stations and coastal places across Tamil Nadu. Filter by district and open any pin on the map.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate({ from: "/explore" });
  const search = Route.useSearch();
  const [catalog, setCatalog] = useState<ExplorerPlace[]>(CANONICAL_PLACES);
  const [source, setSource] = useState<CatalogSource>("local");
  const [apiCount, setApiCount] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [queryDraft, setQueryDraft] = useState(search.q || "");

  const category = search.cat || "all";
  const district = search.district || "all";
  const query = search.q || "";
  const mapOpen = Boolean(search.map);

  useEffect(() => {
    let active = true;
    loadExploreCatalog().then((result) => {
      if (!active) return;
      setCatalog(result.places);
      setSource(result.source);
      setApiCount(result.apiCount);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQueryDraft(query);
  }, [query]);

  const districts = useMemo(() => {
    return Array.from(new Set(catalog.map((p) => p.district))).sort();
  }, [catalog]);

  const filtered = useMemo(
    () => filterExplorerPlaces(catalog, { category, district, query }),
    [catalog, category, district, query],
  );

  const selected = filtered.find((p) => p.slug === selectedSlug) || filtered[0] || null;

  const updateSearch = (patch: ExploreSearch) => {
    const nextMap = patch.map === false ? undefined : patch.map === true ? true : mapOpen || undefined;
    navigate({
      search: {
        cat: patch.cat === "all" ? undefined : patch.cat ?? (category !== "all" ? category : undefined),
        q: patch.q === "" ? undefined : patch.q ?? (query || undefined),
        district:
          patch.district === "all"
            ? undefined
            : patch.district ?? (district !== "all" ? district : undefined),
        map: nextMap,
      },
    });
  };

  return (
    <AppShell>
      <DedicatedMapModal
        isOpen={mapOpen}
        onClose={() => updateSearch({ map: false })}
        initialPlace={selected}
      />

      <PageHeader
        eyebrow="Spatial catalog"
        title="Explore Tamil Nadu"
        description="Filter 50+ verified places by obsession, district or search. Click a card or a pin — then open the place page or launch the fullscreen map."
      />

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-bold text-emerald-400">
              <Compass className="size-3.5" /> {filtered.length} places
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              <Server className="size-3.5" />
              {source === "local" ? "Local catalog" : source === "api" ? `API live · ${apiCount}` : `API + local · ${apiCount} synced`}
            </span>
          </div>
          <Button
            onClick={() => updateSearch({ map: true })}
            className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
          >
            <Maximize2 className="size-4" /> Fullscreen map
          </Button>
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              updateSearch({ q: queryDraft.trim() });
            }}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-emerald-400" />
            <input
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
              placeholder="Search waterfalls, temples, districts..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
            />
            {queryDraft && (
              <button
                type="button"
                onClick={() => {
                  setQueryDraft("");
                  updateSearch({ q: "" });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          <label className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300">
            <Filter className="size-4 text-emerald-400" />
            <select
              value={district}
              onChange={(e) => updateSearch({ district: e.target.value })}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none"
            >
              <option value="all">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES_CONFIG.filter((c) => c.isPrimary || c.id === category).map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateSearch({ cat: cat.id })}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "bg-emerald-500 text-black"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-500/40 hover:text-white"
                }`}
              >
                <Icon className="size-3.5" />
                {cat.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1 custom-scrollbar">
            {filtered.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                No places match those filters. Try another district or clear search.
              </div>
            )}
            {filtered.map((place) => {
              const active = selected?.slug === place.slug;
              return (
                <article
                  key={place.slug}
                  className={`overflow-hidden rounded-3xl border transition ${
                    active
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-glow"
                      : "border-white/10 bg-[#121821]/70 hover:border-emerald-500/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(place.slug)}
                    className="flex w-full gap-4 p-3 text-left"
                  >
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          {place.primaryCategory}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="size-3 fill-current" /> {place.rating ?? "4.6"}
                        </span>
                      </div>
                      <h3 className="mt-1 truncate font-display text-base font-bold">{place.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="size-3 text-emerald-400" /> {place.district}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">{place.tagline}</p>
                    </div>
                  </button>
                  <div className="flex gap-2 border-t border-white/5 px-3 py-2">
                    <Button asChild size="sm" className="rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold">
                      <Link to="/place/$slug" params={{ slug: place.slug }}>
                        Open place
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs"
                      onClick={() => updateSearch({ map: true })}
                    >
                      View on map
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="relative hidden min-h-[560px] overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F14] lg:block">
            <ExploreCatalogMap
              places={filtered}
              selectedSlug={selected?.slug}
              onSelect={(place) => setSelectedSlug(place.slug)}
            />
            {selected && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20">
                <div className="pointer-events-auto rounded-2xl border border-white/15 bg-[#121821]/95 p-4 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{selected.district}</p>
                  <h4 className="mt-1 font-display text-lg font-bold">{selected.name}</h4>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{selected.tagline}</p>
                  <Link
                    to="/place/$slug"
                    params={{ slug: selected.slug }}
                    className="mt-3 inline-flex rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black"
                  >
                    Explore place
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
