import { Link } from "@tanstack/react-router";
import { Calendar, Sun, CloudRain, Snowflake, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PEAK_SEASONS = [
  {
    id: "winter-peak",
    season: "Winter & Heritage Peak",
    months: "October — March",
    badge: "🔥 Current Peak Season",
    color: "from-blue-500/20 via-indigo-500/10 to-transparent border-indigo-500/30",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    icon: Snowflake,
    temp: "14°C — 24°C",
    tagline: "Cool mornings, clear coastal waters & pleasant temple walks",
    destinations: [
      { name: "Ooty & Doddabetta Peak", district: "The Nilgiris", category: "/explore/hills" },
      { name: "Dhanushkodi Ghost Town", district: "Ramanathapuram", category: "/explore/beaches" },
      { name: "Meenakshi Temple", district: "Madurai", category: "/explore/temples" },
      { name: "Vedanthangal Sanctuary", district: "Chengalpattu", category: "/explore/nature" },
    ],
    highlights: ["Migratory bird arrival", "Nilgiri Toy Train rides", "Giri Pradakshina Walks"],
  },
  {
    id: "monsoon-peak",
    season: "Monsoon Cascade Peak",
    months: "July — November",
    badge: "💧 Waterfall Peak",
    color: "from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    icon: CloudRain,
    temp: "18°C — 26°C",
    tagline: "Roaring Western Ghats cascades & lush rubber estate rain trails",
    destinations: [
      { name: "Valli Chunai Falls", district: "Kanyakumari", category: "/explore/falls" },
      { name: "Hogenakkal River Falls", district: "Dharmapuri", category: "/explore/falls" },
      { name: "Suruli Waterfalls", district: "Theni", category: "/explore/falls" },
      { name: "Perunchilambu Stream", district: "Kanyakumari", category: "/explore/falls" },
    ],
    highlights: ["Full river discharge", "Coracle boat rides", "Mist-covered tea slopes"],
  },
  {
    id: "summer-peak",
    season: "Summer Altitude Escapes",
    months: "April — June",
    badge: "🏔️ High Altitude Escapes",
    color: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: Sun,
    temp: "12°C — 20°C (Hills)",
    tagline: "Cloud forest ridge treks, 70-hairpin passes & cool tea estates",
    destinations: [
      { name: "Kodaikanal Lake & Sholas", district: "Dindigul", category: "/explore/hills" },
      { name: "Valparai 40-Hairpins", district: "Coimbatore", category: "/explore/hills" },
      { name: "Kolli Hills 70-Pass", district: "Namakkal", category: "/explore/trekking" },
      { name: "Piranmalai Summit", district: "Sivaganga", category: "/explore/trekking" },
    ],
    highlights: ["Shola forest shade", "Mountain cycling", "Highland fruit harvests"],
  },
];

export function PeakTravelGuide() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-4xl bg-card border border-border p-6 sm:p-10 shadow-xl space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              <Calendar className="size-3.5" /> PEAK TRAVEL CALENDAR
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-foreground">
              Peak Travel Seasons in Tamil Nadu
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Plan your travel around real-time seasonal peaks — from monsoon waterfalls to winter cloud forests.
            </p>
          </div>

          <Button asChild size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0">
            <Link to="/explore">
              Explore All Seasonal Destinations <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>

        {/* 3 Seasonal Peak Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PEAK_SEASONS.map((season) => {
            const Icon = season.icon;
            return (
              <div
                key={season.id}
                className={`rounded-3xl border bg-gradient-to-b ${season.color} p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${season.badgeColor}`}>
                      {season.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1">
                      <Icon className="size-3.5" /> {season.temp}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-foreground">{season.season}</h3>
                  <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 mt-0.5">{season.months}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{season.tagline}</p>

                  {/* Highlights List */}
                  <div className="mt-4 space-y-1.5 pt-3 border-t border-border/40">
                    <p className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Seasonal Highlights:</p>
                    {season.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs text-foreground font-medium">
                        <Sparkles className="size-3 text-amber-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Spots */}
                <div className="pt-4 border-t border-border/40 space-y-2">
                  <p className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Top Destinations:</p>
                  <div className="space-y-1.5">
                    {season.destinations.map((spot) => (
                      <Link
                        key={spot.name}
                        to={spot.category as any}
                        className="flex items-center justify-between text-xs font-semibold hover:text-emerald-500 transition py-0.5"
                      >
                        <span className="truncate">{spot.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal shrink-0 flex items-center gap-0.5">
                          <MapPin className="size-2.5 text-emerald-500" /> {spot.district}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
