import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Clock3,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { DedicatedMapModal } from "@/components/site/dedicated-map-modal";
import { GoogleMapHero } from "@/components/site/google-map-hero";
import { PlaceCard } from "@/components/site/place-card";
import { SearchPanel } from "@/components/site/search-panel";
import { places, type Place } from "@/data/places";
import heroImg from "@/assets/hero-ghats.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExploreTN — Plan a trip around Tamil Nadu" },
      {
        name: "description",
        content:
          "Find places to visit across Tamil Nadu, get practical travel details, and put together a trip that works for you.",
      },
    ],
  }),
  component: Index,
});

const FEATURED_SLUGS = [
  "meenakshi-amman-temple",
  "kodaikanal",
  "mahabalipuram",
  "theni",
  "famous-jigarthanda",
  "thanjavur-city",
];

const CATEGORIES = [
  { label: "Hill stations", category: "hill-escapes", image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=700&q=85" },
  { label: "Temples & heritage", category: "heritage-temples", image: "https://images.unsplash.com/photo-1600100597069-5c5c55f0f20b?auto=format&fit=crop&w=700&q=85" },
  { label: "Waterfalls", category: "waterfalls", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=700&q=85" },
  { label: "Coastal escapes", category: "coastal", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=700&q=85" },
];

const DISTRICTS = [
  { name: "Madurai", note: "Temple streets & local food", count: "42 places", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=85", slug: "madurai" },
  { name: "The Nilgiris", note: "Tea country & mountain air", count: "36 places", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=85", slug: "the-nilgiris" },
  { name: "Thanjavur", note: "Chola heritage & living art", count: "31 places", image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=900&q=85", slug: "thanjavur" },
];

function Index() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [addedTrips, setAddedTrips] = useState<Record<string, boolean>>({});
  const featuredPlaces = FEATURED_SLUGS.map((slug) => places.find((place) => place.slug === slug)).filter(Boolean) as Place[];

  return (
    <AppShell className="bg-white text-slate-900">
      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />
      <DedicatedMapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} />

      <section className="relative overflow-hidden bg-[#eef7ff] pt-28 sm:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-14 lg:pb-20">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-sky-800 shadow-sm">
              <MapPin className="size-3.5" /> Your guide to Tamil Nadu
            </p>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">
              Find your kind of <span className="text-sky-700">Tamil Nadu.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Compare places, check the details that matter, and plan a trip at your own pace.
            </p>

            <button
              onClick={() => setSearchOpen(true)}
              className="mt-8 flex min-h-16 w-full max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 pl-4 text-left shadow-[0_12px_35px_rgba(15,60,100,0.10)] transition hover:border-sky-300 focus-visible:outline-sky-600"
              aria-label="Search places, districts, or experiences"
            >
              <Search className="size-5 shrink-0 text-sky-700" />
              <span className="flex-1 text-sm text-slate-500">Where would you like to go?</span>
              <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800">
                Search <ArrowRight className="size-4" />
              </span>
            </button>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Popular:</span>
              {["Ooty", "Kodaikanal", "Madurai", "Rameswaram"].map((term) => (
                <button key={term} onClick={() => setSearchOpen(true)} className="rounded-full border border-sky-100 bg-white/80 px-3 py-1.5 transition hover:border-sky-300 hover:text-sky-800">
                  {term}
                </button>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-sky-700" /> Useful local details</span>
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-sky-700" /> 38 districts to explore</span>
            </div>
          </div>

          <div className="relative min-h-[300px] sm:min-h-[430px]">
            <img src={heroImg} alt="A scenic road winding through the Western Ghats" className="absolute inset-0 size-full rounded-[2rem] object-cover shadow-[0_24px_70px_rgba(14,59,96,0.18)]" />
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-7 sm:left-7 sm:right-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">A little inspiration</p>
                <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">The Western Ghats</p>
              </div>
              <Link to="/western-ghats" className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-sky-800 transition hover:bg-sky-50" aria-label="Explore the Western Ghats">
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading eyebrow="Start with what you love" title="What kind of trip are you in the mood for?" description="A few good ways to find your next stop." />
        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((item) => (
            <Link key={item.category} to="/explore" search={{ category: item.category }} className="group relative h-44 overflow-hidden rounded-2xl sm:h-56">
              <img src={item.image} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 font-display text-base font-semibold text-white sm:text-lg">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-7 flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Worth the journey" title="Popular places" description="Start with traveler favourites, then make the trip your own." />
            <Link to="/explore" className="mb-1 hidden items-center gap-2 text-sm font-semibold text-sky-800 hover:text-sky-950 sm:inline-flex">All places <ArrowRight className="size-4" /></Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id || place.slug} place={place} onAddToTrip={(slug) => setAddedTrips((prev) => ({ ...prev, [slug]: true }))} isAdded={addedTrips[place.slug]} />
            ))}
          </div>
          <Link to="/explore" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 sm:hidden">See all places <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <SectionHeading eyebrow="Explore closer" title="Pick a district" description="Find local highlights, nearby places, and ideas for a longer stay." />
          <Link to="/districts" className="mb-1 hidden items-center gap-2 text-sm font-semibold text-sky-800 hover:text-sky-950 sm:inline-flex">All districts <ArrowRight className="size-4" /></Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {DISTRICTS.map((district) => (
            <Link key={district.slug} to="/districts/$districtSlug" params={{ districtSlug: district.slug }} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="h-52 overflow-hidden"><img src={district.image} alt={district.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" /></div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3"><h3 className="font-display text-lg font-semibold text-slate-900">{district.name}</h3><span className="text-xs font-medium text-sky-800">{district.count}</span></div>
                <p className="mt-1 text-sm text-slate-600">{district.note}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#eef7ff]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Get your bearings" title="See what’s around" description="Browse places across Tamil Nadu on the map." />
            <button onClick={() => setMapOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"><Compass className="size-4" /> Open map</button>
          </div>
          <div className="h-[360px] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm sm:h-[440px]">
            <GoogleMapHero GOOGLE_MAPS_KEY="" onOpenDedicatedMap={() => setMapOpen(true)} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-8 rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800"><Sparkles className="size-4" /> Your trip, your way</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Put the pieces of your trip together.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Choose where you want to start, how long you have, and the places you care about. Build an itinerary with distances and practical stops along the way.</p>
            <Link to="/planner" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800">Plan a trip <ArrowRight className="size-4" /></Link>
          </div>
          <div className="rounded-2xl bg-sky-50 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-800">A sample weekend</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">Chennai to Pondicherry</h3>
            <div className="mt-5 space-y-4">
              <ItineraryStep day="Day 1" title="Mahabalipuram" note="Shore Temple · lunch by the coast" icon={<MapPin className="size-4" />} />
              <ItineraryStep day="Day 2" title="Pondicherry" note="Heritage quarter · promenade" icon={<CalendarDays className="size-4" />} />
              <div className="flex items-center gap-3 border-t border-sky-100 pt-4 text-xs text-slate-600"><span className="inline-flex items-center gap-1.5"><CarFront className="size-4 text-sky-700" /> Approx. 3.5 hrs driving</span><span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-sky-700" /> 2 days</span></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link to="/" className="font-display text-base font-bold text-slate-900">Explore<span className="text-sky-700">TN</span><span className="ml-2 font-normal text-slate-500">Travel Tamil Nadu with confidence.</span></Link>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link to="/explore" className="hover:text-sky-800">Places</Link><Link to="/routes" className="hover:text-sky-800">Routes</Link><Link to="/community" className="hover:text-sky-800">Travel guides</Link><Link to="/legal/privacy" className="hover:text-sky-800">Privacy</Link></div>
        </div>
      </footer>
    </AppShell>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">{eyebrow}</p><h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p></div>;
}

function ItineraryStep({ day, title, note, icon }: { day: string; title: string; note: string; icon: ReactNode }) {
  return <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-sky-800 shadow-sm">{icon}</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">{day}</p><p className="mt-0.5 text-sm font-semibold text-slate-900">{title}</p><p className="mt-0.5 text-xs text-slate-600">{note}</p></div></div>;
}
