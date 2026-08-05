import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Star,
  MapPin,
  Navigation,
  Gauge,
  CalendarDays,
  Route as RouteIcon,
  ParkingCircle,
  Ticket,
  Clock,
  ShieldAlert,
  CloudSun,
  Utensils,
  Fuel,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/site/app-shell";
import { PlaceCard } from "@/components/site/place-card";
import { Button } from "@/components/ui/button";
import { getPlace, places, type Place } from "@/data/places";

export const Route = createFileRoute("/place/$slug")({
  loader: ({ params }) => {
    const place = getPlace(params.slug);
    if (!place) throw notFound();
    return { place };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Place not found — ExplorerTN" }, { name: "robots", content: "noindex" }] };
    }
    const { place } = loaderData;
    return {
      meta: [
        { title: `${place.name}, ${place.district} — ExplorerTN` },
        { name: "description", content: place.tagline },
        { property: "og:title", content: `${place.name} — ExplorerTN` },
        { property: "og:description", content: place.tagline },
      ],
    };
  },
  component: PlacePage,
});

function Fact({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5 text-primary" aria-hidden /> {label}
      </p>
      <p className="mt-2 font-display text-sm font-semibold leading-snug">{value}</p>
    </div>
  );
}

function PlacePage() {
  const { place } = Route.useLoaderData() as { place: Place };
  const related = places.filter((p) => p.slug !== place.slug).slice(0, 3);

  return (
    <AppShell>
      <article>
        <div className="relative h-[70vh] overflow-hidden">
          <motion.img
            src={place.image}
            alt={place.name}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/60" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-10 sm:px-6">
            <Link
              to="/explore"
              className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> Back to map
            </Link>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden /> {place.district} · {place.distanceFromChennai} from Chennai
            </p>
            <h1 className="mt-2 text-4xl font-extrabold sm:text-6xl">{place.name}</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{place.tagline}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="glass flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-gold">
                <Star className="size-4 fill-current" aria-hidden /> {place.rating} · {place.reviews} reviews
              </span>
              <Button size="lg" className="rounded-xl" asChild>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.district)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation className="size-4" /> Navigate
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold">The story</h2>
              <p className="mt-3 text-muted-foreground">{place.story}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Know before you go</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Fact icon={Gauge} label="Difficulty" value={place.difficulty} />
                <Fact icon={CalendarDays} label="Best season" value={place.bestSeason} />
                <Fact icon={RouteIcon} label="Road condition" value={place.roadCondition} />
                <Fact icon={ParkingCircle} label="Parking" value={place.parking} />
                <Fact icon={Ticket} label="Entry fee" value={place.entryFee} />
                <Fact icon={Clock} label="Timings" value={place.timings} />
                <Fact icon={ShieldAlert} label="Safety" value={place.safety} />
                <Fact icon={CloudSun} label="Weather now" value={place.weather} />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {places.slice(0, 6).map((p) => (
                  <img
                    key={p.slug}
                    src={p.image}
                    alt={`${place.name} area photo`}
                    loading="lazy"
                    className="h-36 w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Reviews</h2>
              <div className="mt-4 space-y-3">
                {[
                  ["Arun K.", "Rode down at 5 AM on a Sunday and had the whole place to myself. Worth the early alarm."],
                  ["Divya S.", "Beautiful, but go on a weekday. Weekends get crowded by 10."],
                ].map(([who, text]) => (
                  <div key={who} className="rounded-3xl border border-border bg-card p-5">
                    <p className="flex items-center gap-2 font-display text-sm font-semibold">
                      {who}
                      <span className="flex items-center gap-1 text-xs text-gold">
                        <Star className="size-3 fill-current" aria-hidden /> 5.0
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
            <div className="glass rounded-3xl p-5">
              <p className="flex items-center gap-2 font-display text-sm font-semibold">
                <Lightbulb className="size-4 text-gold" aria-hidden /> Travel tips
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {place.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="flex items-center gap-2 font-display text-sm font-semibold">
                <Utensils className="size-4 text-sunset" aria-hidden /> Nearby food
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {place.nearbyFood.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="flex items-center gap-2 font-display text-sm font-semibold">
                <Fuel className="size-4 text-ocean" aria-hidden /> Fuel stops
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {place.nearbyFuel.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="mb-6 text-2xl font-bold">Nearby & related</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PlaceCard key={p.slug} place={p} />
            ))}
          </div>
        </section>
      </article>
    </AppShell>
  );
}
